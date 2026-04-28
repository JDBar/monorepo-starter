# monorepo-starter

An opinionated monorepo starter for TypeScript projects — easy to fork, easy to extend.

**Common Stack**: Node.js, TypeScript, PNPM (Workspace), Turborepo, Vitest
**Common Frontend**: Next.js, React, SCSS Modules

## Getting Started

1. Install dependencies: `pnpm install`
2. Run development server: `pnpm dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Development Commands

- `pnpm dev` - Start all app dev servers
- `pnpm dev:stop` - Stop all running dev servers
- `pnpm check` - Run lint and type checks
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:integration` - Run integration tests (builds first)

Use `--filter <app-name>` to scope commands to a specific app

## Directory Structure

```
monorepo-starter/
├── apps/
│   └── test-app/          # Example Next.js app (static export)
└── packages/
    ├── eslint-config/     # Shared ESLint configs (base, next-js, react-internal)
    ├── typescript-config/ # Shared TypeScript configs
    └── ui/                # Shared React component library
```

## Apps

### test-app

A minimal Next.js app (static export) that demonstrates the monorepo setup. Use it as a starting point or delete it and add your own under `apps/`.

## Packages

Shared packages live in `packages/` and are consumed via the `workspace:*` protocol. Run `pnpm generate:package` to scaffold a new one.

| Package                   | Description                           |
| ------------------------- | ------------------------------------- |
| `@repo/ui`                | Shared React component library        |
| `@repo/eslint-config`     | ESLint presets (base, Next.js, React) |
| `@repo/typescript-config` | Shared `tsconfig` base files          |

## Devcontainer Setup

After the container starts for the first time, open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run:

```
Remote: Install Local Extensions in Container monorepo-starter
```

This installs your local IDE extensions inside the container. Without it your extensions (language support, linters, etc.) won't be active.

## Claude Code

This repo is configured for a native Claude Code experience inside the devcontainer.

### Security model — AI agents and git

The devcontainer deliberately gives AI agents **no direct git or GitHub access.** The rationale: an agent that can push code or merge PRs autonomously is a significant risk, and the upside of that autonomy is not worth it.

Concretely, `devcontainer.json` does the following:

- **Kills the SSH auth socket** (`SSH_AUTH_SOCK=`) so agents can't use forwarded keys
- **Disables all git pushes** via `pushInsteadOf` rewrites that redirect every remote URL to a disabled scheme
- **Strips credential helpers** so no stored credentials leak in

Git reads (clone, fetch, log, diff) still work fine — agents can read history and understand the codebase. They just can't write to the remote.

**GitHub access via `gh` CLI instead**

The `gh` CLI is installed and authenticated via a `GH_TOKEN` in your `.env` file. You control exactly what that token can do by scoping it to a fine-grained PAT with only the permissions your repo needs. See `.env.example` for the recommended permission set.

This means:

- Agents can open PRs, comment on issues, and read CI results through `gh`
- **You** review and merge — agents never touch `main` directly
- If a token leaks, the blast radius is one repo with limited permissions

Copy `.env.example` to `.env` and fill in your token before starting the devcontainer.

**Persistent memory** — Auto-memory writes to `.claude/memory/` (git-tracked, survives rebuilds).

**Persistent plans** — Plans write to `.claude/plans/` (git-tracked, survives rebuilds).

### Connecting Claude Code Desktop via SSH

The devcontainer runs a full OpenSSH server on port 2222. Claude Code Desktop connects to it using a passphrase-free SSH key.

> Claude Code does not support SSH keys with passphrases. The key must have an empty passphrase (`-N ""`).

**Mac / Linux** — open the repo in VS Code/Cursor, **Reopen in Container**, and connect Claude Code Desktop to `127.0.0.1:2222` as user `vscode`. The `initializeCommand` automatically collects all `~/.ssh/*.pub` files from your home directory and authorizes them inside the container. If you don't have a passphrase-free key yet:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
```

Then rebuild the container so it picks up the new key.

---

**Windows** — there is an extra step because of how WSL2 works.

Running the repo directly from the Windows filesystem causes significant latency once the devcontainer is running due to cross-filesystem overhead. The better setup is:

1. **Clone the repo into WSL2** (e.g. `~/projects/monorepo-starter`)
2. **Open it in Cursor via the WSL2 remote**, then **Reopen in Container**
3. **Claude Code Desktop (Windows) SSHes into the container** on port 2222

Because `initialize.bash` runs in WSL2 to populate `authorized_keys`, but Claude Code Desktop uses the Windows SSH client to connect, **the same passphrase-free key pair must exist in both places.**

```bash
# 1. Create the key in WSL2
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# 2. Copy it to Windows (Git Bash / PowerShell path)
cp ~/.ssh/id_ed25519     /mnt/c/Users/<YourWindowsUsername>/.ssh/id_ed25519
cp ~/.ssh/id_ed25519.pub /mnt/c/Users/<YourWindowsUsername>/.ssh/id_ed25519.pub
```

Then open the devcontainer from Cursor. The WSL2 key is picked up automatically; the Windows copy is what Claude Code Desktop will use to authenticate.

Optionally add an entry to your **Windows** `~/.ssh/config` (`C:\Users\<YourWindowsUsername>\.ssh\config`):

```
Host monorepo-devcontainer
    HostName 127.0.0.1
    Port 2222
    User vscode
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

---

**Connect from Claude Code Desktop**

Click **+ Add SSH host...** and fill in the connection dialog:

![Claude Code Desktop — Add SSH host](docs/images/ccd-add-ssh-host.png)

![Claude Code Desktop — SSH connection config](docs/images/ccd-ssh-config.png)

| Field         | Value               |
| ------------- | ------------------- |
| Host          | `vscode@127.0.0.1`  |
| Port          | `2222`              |
| Identity file | `~/.ssh/id_ed25519` |

**Note:** `StrictHostKeyChecking no` / `UserKnownHostsFile /dev/null` are safe here because you're connecting to localhost — there's no meaningful MITM risk on `127.0.0.1`.
