# Setup Guide

This guide walks you through setting up the monorepo for the first time. The project runs entirely inside a **devcontainer** — a Docker-based development environment that comes pre-configured with Node.js, pnpm, and all the tools you need.

## Contents

- [Prerequisites](#prerequisites)
  - [Windows prerequisites](#windows-prerequisites)
- [1. Clone the repo](#1-clone-the-repo)
- [2. Create your `.env` file](#2-create-your-env-file)
- [3. Open the devcontainer](#3-open-the-devcontainer)
- [4. Install local extensions](#4-install-local-extensions)
- [5. Start the dev server](#5-start-the-dev-server)
- [What's inside the devcontainer](#whats-inside-the-devcontainer)

---

## Prerequisites

You'll need these installed on your machine before you begin:

- 🐳 **Docker Desktop** — [download here](https://www.docker.com/products/docker-desktop/)
- 💻 **VS Code** or **Cursor** with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- **Git**

> [!NOTE]
> You do **not** need to install Node.js or pnpm locally. Everything runs inside the container.

### Windows prerequisites

Windows users need one additional thing before starting:

- **WSL2** (Windows Subsystem for Linux) with Ubuntu — [installation guide](https://learn.microsoft.com/en-us/windows/wsl/install). Run the following in PowerShell as Administrator if you don't have it:
  ```powershell
  wsl --install
  ```

VS Code and Cursor are installed on **Windows** as normal. They connect to your WSL2 Ubuntu environment via the built-in **WSL remote extension** ([VS Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) / [Cursor](https://www.cursor.com/)) — you don't need to install them inside WSL2.

---

## 1. Create your repo from the template

This project is a **GitHub template repository**. Rather than cloning it directly, use GitHub's template system to create your own fresh repo:

1. Go to the template repo on GitHub
2. Click **Use this template → Create a new repository**
3. Give your repo a name and choose its visibility
4. Click **Create repository**

You'll get a new repo with all the files and a clean git history — no fork relationship, no upstream to manage.

Once your repo is created, clone it:

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

> [!WARNING]
> **Windows users:** Clone into your WSL2 home directory (e.g. `~/projects/your-repo-name`), **not** the Windows filesystem. Running a devcontainer from the Windows filesystem causes significant latency due to cross-filesystem overhead. Once cloned, `cd` into the repo and open it in your IDE with `code .` or `cursor .` — this connects the editor to WSL2 with the repo as the workspace, and from there you can **Reopen in Container** as normal.

---

## 2. Create your `.env` file

The devcontainer loads environment variables from a `.env` file at the repo root. Copy the example file to get started:

```bash
cp .env.example .env
```

Open `.env` and fill in `GH_TOKEN` with a GitHub Personal Access Token. This token is used by the `gh` CLI inside the container for things like opening pull requests and checking CI status.

> [!TIP]
> Use a **fine-grained PAT** scoped to only this repository with the minimum permissions you need. If the token ever leaks, the blast radius is limited to one repo. See `.env.example` for the recommended permission set and a link to create one.

> [!NOTE]
> If you forget this step, the container will still start — `.env` is created automatically from `.env.example` on first launch. You just won't be able to use `gh` until you fill in the token.

---

## 3. Open the devcontainer

Open the repo folder in VS Code or Cursor. You should see a prompt to **Reopen in Container** — click it. If the prompt doesn't appear, open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run:

```
Dev Containers: Reopen in Container
```

> [!NOTE]
> The first build takes a few minutes while Docker pulls the base image and installs dependencies. Subsequent starts are much faster.

---

## 4. Install local extensions

Once the container is running, open the command palette and run:

```
Remote: Install Local Extensions in Container monorepo-starter
```

This copies your locally installed IDE extensions (language support, linters, themes, etc.) into the container. Without this step they won't be active inside the devcontainer.

---

## 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the example app. 🎉

---

## What's inside the devcontainer

| Tool                   | Details                                            |
| ---------------------- | -------------------------------------------------- |
| **Node.js 24**         | Pre-installed, no local setup needed               |
| **pnpm**               | Package manager, pre-installed                     |
| **GitHub CLI (`gh`)**  | Authenticated via your `GH_TOKEN`                  |
| **Claude Code**        | Installed globally, connectable via SSH            |
| **SSH server**         | Runs on port 2222 for Claude Code Desktop          |
| **Persistent volumes** | Claude settings and SSH host keys survive rebuilds |

For details on connecting Claude Code Desktop to the container, see [Claude Code](./claude-code.md).
