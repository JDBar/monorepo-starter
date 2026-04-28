# Devcontainer Internals

This document explains how the devcontainer is built and why certain implementation decisions were made. It is intended for contributors and anyone modifying the container setup.

For **user-facing setup instructions**, see [docs/setup.md](../docs/setup.md).  
For **Claude Code and SSH connection instructions**, see [docs/claude-code.md](../docs/claude-code.md).

## Contents

- [File structure](#file-structure)
- [SSH server](#ssh-server)
  - [Public key injection](#public-key-injection)
  - [Persistent host keys](#persistent-host-keys)
  - [sshd lifecycle](#sshd-lifecycle)
- [Git lockdown](#git-lockdown)

---

## File structure

```
.devcontainer/
├── devcontainer.json          # Container configuration
├── initialize.bash            # Runs on the host before the container starts
├── postCreate.bash            # Runs once inside the container after creation
├── postCreate.ssh.bash        # Called by postCreate.bash — sets up the SSH server
├── postStart.bash             # Runs inside the container on every start
└── .host_authorized_key.pub   # Gitignored — staged by initialize.bash at build time
```

---

## SSH server

The container runs a full OpenSSH server on port 2222, exposed only on `127.0.0.1` (localhost — not reachable from external networks). It is configured with key-only auth, no passwords, and no root login.

### Public key injection

Getting SSH public keys from the host machine into the container is non-trivial. Individual file bind mounts from a WSL2 home directory are unreliable with docker-in-docker — overlayfs layers shadow them silently. The workspace directory is always mounted reliably, so a staging approach is used instead:

1. **`initialize.bash`** runs on the host (in WSL2, or directly on Mac/Linux) _before_ the container starts. It collects every `~/.ssh/*.pub` file and concatenates them into `.devcontainer/.host_authorized_key.pub` (gitignored).
2. **`postCreate.ssh.bash`** runs inside the container after creation. It copies that staged file directly to `/home/vscode/.ssh/authorized_keys`.

This means all public keys present in `~/.ssh/` on the host are authorized automatically — no manual configuration needed.

> [!NOTE]
> `.host_authorized_key.pub` is regenerated fresh on every `initializeCommand` run, so adding a new key to `~/.ssh/` and rebuilding the container is all that's needed to authorize it.

> [!WARNING]
> **SSH agent keys are not included.** `initialize.bash` only reads `.pub` files from `~/.ssh/` — it does not query the SSH agent via `ssh-add -L`. If your key is loaded into an agent but has no corresponding `.pub` file on disk, it will not be authorized. The workaround is to ensure a `.pub` file exists alongside your private key, or to modify `initialize.bash` to also run `ssh-add -L >> "$OUT"`. Note that `ssh-add -L` is unreliable in WSL2, which is why the file-based approach is used here.

### Persistent host keys

The container's SSH host keys are stored in a named Docker volume (`monorepo-starter-ssh-host-keys`) mounted at `/etc/ssh-host-keys/`. Named volumes are tied to the Docker daemon rather than the container image, so they survive **Rebuild Container**.

This means the host key fingerprint is stable across rebuilds — clients will never see a `REMOTE HOST IDENTIFICATION HAS CHANGED` warning after a rebuild.

To intentionally rotate the host keys (e.g. after a security incident):

```bash
docker volume rm monorepo-starter-ssh-host-keys
```

Then rebuild the container. If you have a `known_hosts` entry for the old key, remove it:

```bash
ssh-keygen -R "[127.0.0.1]:2222"
```

### sshd lifecycle

| Script                | Responsibility                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `postCreate.ssh.bash` | Installs `openssh-server`, generates host keys into the named volume, writes `/etc/ssh/sshd_config.d/devcontainer.conf`   |
| `postStart.bash`      | Starts `sshd` on every container start — including after Docker Desktop restarts or `docker stop` / `docker start` cycles |

---

## Git lockdown

`containerEnv` in `devcontainer.json` is configured to prevent AI agents from pushing code or accessing external git remotes. See [docs/claude-code.md — Security model](../docs/claude-code.md#-security-model) for the rationale.

Concretely:

- **All git pushes are disabled** — `pushInsteadOf` rewrites redirect every remote URL scheme (`https://`, `ssh://`, `git@`) to a no-op disabled scheme
- **SSH agent forwarding is blocked** — `SSH_AUTH_SOCK` is cleared so forwarded keys can't be used
- **Credential helpers are stripped** — no stored credentials can leak into the container

Git reads (fetch, clone, log, diff) are unaffected — agents can read history freely.
