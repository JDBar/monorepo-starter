# CLAUDE.md

**Project**: `monorepo-starter` - A Turborepo pnpm workspace of multiple projects.

## Agent Memory

Persistent memory lives at `.claude/memory/` (git-tracked). Read `MEMORY.md` there for an index of what's been stored across sessions.

See @README.md for high-level architecture overview and features. May be outdated.

## Project Documentation (`docs/`)

### Architecture Decision Records (`docs/adr/`)

Significant technical decisions are recorded as ADRs in `docs/adr/`. Read these before making changes that touch tooling, dependency strategy, or architectural conventions — they explain _why_ the codebase is the way it is.

- See `docs/adr/README.md` for the index, format, and template.
- When deferring or rejecting a non-trivial upgrade or approach, write an ADR capturing the reasoning so future agents don't re-litigate it.

## Workflow to Follow

1. User will handle git for you.
2. Discovery Phase:
   - Gather information from repo/documents/code as needed.
   - Look up web for relevant docs/examples/research.
3. Planning Phase:
   - Use the native Plan tool to write tasks and get approval from operator.
   - Plans are stored in `.claude/plans/` (git-tracked, survives rebuilds).
4. Implementation Phase:
   - Make changes.
   - Write expressive, thoughtful, and intuitive user-friendly code. There is no rush, take your time.
   - If you experience surprises/issues along the way that you resolve, write about them in your plan file for future reference.
   - If stuck after 3 attempts, ask operator for help.
5. Review Phase:
   - Run `pnpm -w check` to validate code.
     - Use `--filter @repo/<package-name>` to run checks for a specific package.
   - Run `pnpm -w format` to ensure consistent code formatting.
6. Documentation Phase:
   - Ensure README.md is accurate re: architecture/features
   - Ensure accurate subdirectory CLAUDE.md files, esp. directory structures
   - Remove outdated/redundant information
   - **When adding new tools/libraries**: Update README.md Common Stack section
   - **When adding new workspace commands**: Update README.md Development Commands section
   - **When creating/updating packages**: Ensure package README includes:
     - Usage examples with command samples
     - Architecture overview showing file structure and responsibilities
     - Development/testing instructions

### Living Indices — always keep these up to date

| Event                                | File to update            |
| ------------------------------------ | ------------------------- |
| Plan created, completed, or deferred | `.claude/plans/README.md` |
| ADR written                          | `docs/adr/README.md`      |

## Workspace Commands

- `pnpm dev` - Start all app dev servers.
- `pnpm dev:stop` - **Stop all dev servers**. Always run this before starting a new dev server to avoid orphaned processes and CPU spikes.
- `pnpm -w check` - Run lint and type checks.
  - `pnpm -w check:format` - Run format checks.
  - `pnpm -w check:lint` - Run lint checks.
  - `pnpm -w check:types` - Run type checks.
- `pnpm -w format` - Format code.
- Use `--filter <app-name>` to run commands for a specific app.

## Testing

### Vitest

This monorepo uses **Vitest 4.0+** with workspace/projects configuration for testing.

**Organization:**

- Test files should be placed **alongside** the code they test
- Use `.test.ts` naming convention (e.g., `validation.ts` → `validation.test.ts`)
- **DO NOT** use `__tests__/` folders

**Running Tests:**

- `pnpm -w test` - Run tests once
- `pnpm -w test:watch` - Run tests in watch mode
- `pnpm -w test:coverage` - Run tests with coverage report
- `pnpm -w test:integration` - Run integration tests (builds first)
- Use `--filter @repo/<package-name>` to run tests for a specific package

**Best Practices:**

- Follow the "Beyoncé rule": If you like it, put a test on it
- Do not test implementation details or static values.
- Test behavior, not the internals.

## Code Style

### TypeScript

- Use functional-core / imperative-shell patterns in business logic to make tests easier to write and understand.
- Use `type` over `interface` for type definitions (unless you need to extend or implement an interface).
- NO `any`, use `unknown` instead.
  - Exception: Only use `any` for type-inference on generic functions with no circular type dependencies.
- NO non-null assertions (`!`)
  - Use type guards, optional chaining (`?.`) or nullish coalescing (`??`)
- ALWAYS use namespace imports like so:
  ```typescript
  import * as Issue from "./issue"; // Good
  import { create } from "./issue"; // Bad!!
  ```
- NO default exports unless necessary, use named exports instead.
- Export interfaces alongside components
- Comprehensive JSDoc documentation for all TypeScript files
- NEVER hardcode string literals - use centralized constants e.g. `src/lib/constants.ts`
