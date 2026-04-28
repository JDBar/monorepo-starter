# monorepo-starter

An opinionated monorepo starter for TypeScript projects — easy to fork, easy to extend.

**Stack:** Node.js · TypeScript · PNPM Workspaces · Turborepo · Vitest  
**Frontend:** Next.js · React · SCSS Modules

> [!TIP]
> **This is a GitHub template repository.** Click **Use this template → Create a new repository** at the top of this page to create your own repo pre-populated with all these files and a clean git history.

---

## 🚀 Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> [!NOTE]
> The preferred way to run this project is inside a **devcontainer** — Docker handles Node, pnpm, and everything else, and it isolates AI agents from your git credentials. You can run it directly on your host machine too, but the devcontainer is strongly recommended if you're using Claude Code. See the [Setup Guide](docs/setup.md) to get started, or the [security model](docs/claude-code.md#-security-model) for the reasoning.

---

## 🛠️ Development commands

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `pnpm dev`              | Start all app dev servers            |
| `pnpm dev:stop`         | Stop all running dev servers         |
| `pnpm check`            | Run lint and type checks             |
| `pnpm format`           | Format code with Prettier            |
| `pnpm test`             | Run tests once                       |
| `pnpm test:watch`       | Run tests in watch mode              |
| `pnpm test:coverage`    | Run tests with coverage report       |
| `pnpm test:integration` | Run integration tests (builds first) |

Add `--filter <app-name>` to scope any command to a specific app.

---

## 📁 Directory structure

```
monorepo-starter/
├── apps/
│   └── test-app/          # Example Next.js app (static export)
└── packages/
    ├── eslint-config/     # Shared ESLint configs (base, next-js, react-internal)
    ├── typescript-config/ # Shared TypeScript configs
    └── ui/                # Shared React component library
```

### Apps

**test-app** — A minimal Next.js app (static export) that demonstrates the monorepo setup. Use it as a starting point or delete it and add your own under `apps/`.

### Packages

Shared packages live in `packages/` and are consumed via the `workspace:*` protocol. Run `pnpm generate:package` to scaffold a new one.

| Package                   | Description                           |
| ------------------------- | ------------------------------------- |
| `@repo/ui`                | Shared React component library        |
| `@repo/eslint-config`     | ESLint presets (base, Next.js, React) |
| `@repo/typescript-config` | Shared `tsconfig` base files          |

---

## 📚 Guides

| Guide                              | Description                                                 |
| ---------------------------------- | ----------------------------------------------------------- |
| [Setup](docs/setup.md)             | Prerequisites, devcontainer setup, first-time configuration |
| [Claude Code](docs/claude-code.md) | AI agent security model, GitHub access, SSH connection      |
