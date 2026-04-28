# Dev Container

This devcontainer is designed to be launched from **WSL2 Ubuntu** against the
**Windows Docker Desktop** daemon. Launching from WSL2 (rather than directly from
Windows) gives better filesystem performance for the workspace volume.

## File Structure

```
.devcontainer/
├── devcontainer.json          # Container configuration
├── initialize.bash            # Runs on the WSL2 host before the container starts
├── postCreate.bash            # Runs once inside the container after creation
├── postCreate.ssh.bash        # Called by postCreate.bash — sets up the SSH server
├── postStart.bash             # Runs inside the container on every start
└── .host_authorized_key.pub   # Gitignored — staged by initialize.bash at build time
```

## SSH Access from Windows

The container exposes an SSH server on **`127.0.0.1:2222`** (Windows localhost only —
not reachable from external networks). This lets you `ssh` into the container directly
from Windows Git Bash or any Windows SSH client.

### First-time setup

Add this stanza to `~/.ssh/config` on Windows (`C:\Users\<you>\.ssh\config`):

```
Host monorepo-starter
    HostName 127.0.0.1
    Port 2222
    User vscode
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

The key must be **passphrase-free** — tools like Claude Code Desktop cannot prompt for
a passphrase. `StrictHostKeyChecking no` is safe here because you're connecting to
localhost; there is no meaningful MITM risk on `127.0.0.1`.

Then connect:

```bash
ssh monorepo-starter
```

### How it works

**Public key injection** (`initialize.bash` → `postCreate.ssh.bash`)

`initialize.bash` runs in WSL2 _before_ the container starts and collects every
`~/.ssh/*.pub` file into `.devcontainer/.host_authorized_key.pub` (gitignored).
`postCreate.ssh.bash` then copies that file directly to
`/home/vscode/.ssh/authorized_keys` inside the container.

All public keys found in `~/.ssh/*.pub` are included automatically — if you have
multiple keys they will all be authorized.

A bind mount was not used for this because individual file bind mounts from the WSL2
home directory are unreliable with docker-in-docker — the overlayfs layers shadow
them. The workspace directory is always mounted reliably, so staging via the workspace
is used instead.

**Persistent SSH host keys** (named Docker volume)

The container's SSH host keys are stored in a named Docker volume
(`monorepo-starter-ssh-host-keys`) mounted at `/etc/ssh-host-keys/`. Named volumes are
tied to the Docker daemon, not the container image, so they survive `Rebuild Container`.
This means the host key fingerprint accepted on first connection is permanent — you
will never see a "REMOTE HOST IDENTIFICATION HAS CHANGED" warning after a rebuild.

To intentionally rotate the host key (e.g. after a security event):

```bash
# On Windows / WSL2
docker volume rm monorepo-starter-ssh-host-keys
# Then rebuild the container, and clear the stale Windows known_hosts entry:
ssh-keygen -R "[127.0.0.1]:2222"
```

**sshd lifecycle**

- `postCreate.ssh.bash` — installs `openssh-server`, generates host keys, writes
  `/etc/ssh/sshd_config.d/devcontainer.conf` (key-only auth, no passwords, no root login)
- `postStart.bash` — starts sshd on every container start, including after Docker
  Desktop restarts or `docker stop` / `docker start` cycles

## Git Lockdown

`containerEnv` is configured to prevent any git operations that require credentials
or network access from inside the container. This is intentional — Claude agents
running in this container should not be able to push code or access external git hosts.

All pushes (HTTPS, SSH, and `git@` URLs) are redirected to a disabled no-op remote.
SSH agent forwarding is also blocked (`SSH_AUTH_SOCK` is cleared).
