# Adding New Packages to the Workspace

This guide explains how to scaffold and integrate new packages into the monorepo.

## Quick Overview

The monorepo uses:

- **pnpm workspaces** for package management
- **Turborepo** for task orchestration and generators
- **TypeScript** with shared configuration
- **ESLint & Prettier** with shared configurations

All packages must follow the established patterns to integrate seamlessly.

## Quick Start: Using the Generator (Recommended)

Create a new package instantly with the Turborepo generator:

**Interactive mode** (recommended):

```bash
pnpm generate:package
```

**Non-interactive mode** (for CI/CD or scripting):

```bash
turbo gen package --args "@repo/my-lib" "utility" "My library" ""
```

The interactive generator will prompt you for:

1. **Package name** (e.g., `@repo/my-awesome-lib`)
2. **Package type** (CLI, Utility Library, or React Component Library)
3. **Package description** (optional)
4. **CLI command name** (only if CLI type)

The generator automatically creates all necessary files and runs `pnpm install`.

### Examples

**Create a CLI package (interactive):**

```bash
pnpm generate:package
? Package name: @repo/my-cli-tool
? Package type: CLI (with build step)
? Description: A handy CLI tool
? CLI command name: my-cli-tool
```

**Create a CLI package (non-interactive):**

```bash
# Format: @repo/name type description cliCommandName
turbo gen package --args "@repo/my-cli-tool" "cli" "A handy CLI tool" "my-cli-tool"
```

**Create a utility library (interactive):**

```bash
pnpm generate:package
? Package name: @repo/my-helpers
? Package type: Utility Library (no build, like deploy)
? Description: Common helper functions
```

**Create a utility library (non-interactive):**

```bash
# Format: @repo/name type description cliCommandName (empty string for utility)
turbo gen package --args "@repo/my-helpers" "utility" "Common helper functions" ""
```

**Create a React component library (interactive):**

```bash
pnpm generate:package
? Package name: @repo/my-components
? Package type: React Component Library (like ui)
? Description: Shared UI components
? CLI command name (e.g., my-awesome-lib)? [Leave empty if not CLI]:
```

**Create a React component library (non-interactive):**

```bash
# Format: @repo/name type description cliCommandName (empty string for react)
turbo gen package --args "@repo/my-components" "react" "Shared UI components" ""
```

Then generate components in the React library:

```bash
pnpm --filter @repo/my-components generate:component
```

---

## Manual Setup (Alternative)

If you prefer to set up a package manually, see [detailed manual setup guide](#setup-checklist-for-new-packages) below. However, the generator is strongly recommended as it ensures consistency and correctness.

## Directory Structure

```
packages/
├── ui/                 # Example: React component library
├── eslint-config/      # Shared ESLint configurations
├── typescript-config/  # Shared TypeScript configurations
└── README.md          # This file
```

## When to Create a Package

Create a new package in `packages/` when you need:

- **Reusable code** shared across multiple apps
- **A CLI tool**
- **A component library** (like ui)
- **Shared configuration** (like eslint-config or typescript-config)

For app-specific code that won't be reused, create an app in `apps/` instead.

## Package Types & Examples

### 1. CLI Package with Build Step

**Use when:** Building a distributable CLI tool

**Key files:**

```
packages/my-cli/
├── src/
│   ├── index.ts           # Library export
│   ├── cli.ts             # Executable entry (→ dist/cli.js)
│   └── lib/
│       ├── constants.ts   # Centralized config
│       └── index.ts       # Namespace exports
├── dist/                  # Built output (git-ignored)
├── package.json           # With build script and bin entry
├── tsconfig.json
├── eslint.config.js
├── .gitignore
└── README.md
```

**package.json structure:**

```json
{
	"name": "@repo/package-name",
	"type": "module",
	"exports": {
		".": "./dist/index.js"
	},
	"bin": {
		"command-name": "./dist/cli.js"
	},
	"scripts": {
		"build": "pkgroll",
		"check": "pnpm run \"/^check:.*/\"",
		"check:lint": "eslint . --max-warnings 0",
		"check:types": "tsc --noEmit"
	},
	"dependencies": {
		/* production dependencies */
	},
	"devDependencies": {
		"@repo/eslint-config": "workspace:*",
		"@repo/typescript-config": "workspace:*"
	}
}
```

**Build tool:** Use `pkgroll` for bundling TypeScript to JavaScript

### 2. Utility Library Package

**Use when:** Building utilities that get imported, not executed directly

**Key differences from CLI:**

- No `bin` entry in package.json
- No build step (exports TypeScript directly or uses tsc)
- Consumed by other packages via `workspace:*` protocol

**package.json structure:**

```json
{
	"name": "@repo/package-name",
	"type": "module",
	"exports": {
		".": "./src/index.ts"
	},
	"scripts": {
		"check:lint": "eslint . --max-warnings 0",
		"check:types": "tsc --noEmit"
	},
	"dependencies": {
		/* production dependencies */
	},
	"devDependencies": {
		"@repo/eslint-config": "workspace:*",
		"@repo/typescript-config": "workspace:*"
	}
}
```

### 3. React Component Library (ui)

**Use when:** Building reusable React components

**Key structure:**

```
packages/ui/
├── src/
│   ├── component1.tsx
│   ├── component2.tsx
│   └── ...
├── turbo/
│   └── generators/
│       ├── config.ts         # Plop generator config
│       └── templates/
│           └── component.hbs # Component scaffold template
├── package.json
├── tsconfig.json
└── eslint.config.js
```

**package.json exports:**

```json
{
	"exports": {
		"./*": "./src/*.tsx"
	}
}
```

**Generate components with:**

```bash
pnpm generate:component
```

### 4. Shared Configuration Package

**Use when:** Sharing ESLint or TypeScript configs

**Key structure:**

```
packages/eslint-config/
├── base.js
├── next.js
├── react-internal.js
└── package.json
```

**No TypeScript needed** - Pure JavaScript/JSON configuration files.

## Setup Checklist for New Packages

### 1. Create Directory Structure

```bash
mkdir -p packages/your-package-name/src/lib
```

### 2. Create Configuration Files

**package.json**

- Set `"name": "@repo/your-package-name"`
- Set `"type": "module"` for ES modules
- Add proper `exports` field
- Include `@repo/eslint-config` and `@repo/typescript-config` in devDependencies
- Use `"workspace:*"` protocol for workspace dependencies

**tsconfig.json**

```json
{
	"extends": "@repo/typescript-config/base.json",
	"include": ["src"],
	"compilerOptions": {
		"outDir": "./dist"
	}
}
```

**eslint.config.js**

```javascript
import { config } from "@repo/eslint-config/base";
export default config;
```

### 3. Create Source Files

**src/index.ts** - Main entry point

```typescript
/**
 * Package description
 */
export * as ModuleName from "./lib/module.js";
```

**src/lib/index.ts** - Namespace exports (for libraries)

```typescript
export * as Constants from "./constants.js";
```

**src/lib/constants.ts** - Centralized config

```typescript
export const CONFIG = {
	DEFAULT: {
		/* defaults */
	},
} as const;
```

### 4. Create Additional Files

**.gitignore**

```
dist/
node_modules/
.turbo/
```

**README.md** - Package documentation

- Development commands
- Usage examples
- Architecture overview

**.gitkeep** in any empty directories you want committed

Git doesn't track empty directories — only files. If your package has placeholder
directories that need to exist in a fresh clone (e.g. `src/templates/`), add an
empty `.gitkeep` file to preserve them:

```bash
touch src/templates/.gitkeep
```

This is a Git limitation, not a code issue. The `.gitkeep` filename is a convention;
Git only cares that the file exists.

### 5. Run Verification

```bash
# Install dependencies
pnpm install

# Type check
pnpm check:types

# Lint
pnpm check:lint

# Format
pnpm format

# Build (if applicable)
pnpm build
```

### 6. Integration with Workspace

The package is **automatically discovered** by pnpm workspaces (defined in `pnpm-workspace.yaml` as `packages/*`).

**Turborepo integration:** Add tasks to `turbo.jsonc` if needed:

```jsonc
{
	"tasks": {
		"build": {
			"inputs": ["src/**", "tsconfig.json"],
			"outputs": ["dist/**"],
		},
	},
}
```

## Naming Conventions

**Package names:** `@repo/your-package-name` (kebab-case)

**Files:**

- TypeScript modules: `camelCase.ts`
- React components: `kebab-case.tsx`
- Configuration: `camelCase.json` or `camelCase.js`

**Constants:** `CONSTANT_CASE` in `constants.ts`

```typescript
export const CONFIG = {
	DEFAULT: {
		SETTING_NAME: "value",
	},
} as const;
```

## Key Patterns

### Module Organization

Use namespace imports for clear module grouping:

```typescript
// src/lib/index.ts
export * as Constants from "./constants.js";
export * as Utils from "./utils.js";

// Usage in other files
import * as MyPackage from "@repo/my-package";
MyPackage.Constants.CONFIG.DEFAULT.SETTING;
```

### Workspace Dependencies

Always use `workspace:*` for internal dependencies:

```json
{
	"dependencies": {
		"@repo/other-package": "workspace:*"
	}
}
```

### Type Safety

- No `any` types - use `unknown` instead
- No non-null assertions (`!`) - use type guards or optional chaining
- Comprehensive JSDoc for public APIs
- Export interfaces alongside implementations

## Shared Configurations

### TypeScript Configs

Located in `packages/typescript-config/`:

- `base.json` - Strict settings for all TypeScript projects
- `react-library.json` - For React component libraries (extends base)
- `nextjs.json` - For Next.js apps (extends base)

Extend with:

```json
{
	"extends": "@repo/typescript-config/base.json"
}
```

### ESLint Configs

Located in `packages/eslint-config/`:

- `base.js` - Base rules for all projects
- `next.js` - Next.js specific rules
- `react-internal.js` - React internal components

Use with:

```javascript
import { config } from "@repo/eslint-config/base";
export default config;
```

## Common Build Tools

### For CLI Packages: pkgroll

Zero-config bundler for Node.js packages. Install as dev dependency:

```bash
pnpm add -D pkgroll
```

Build script:

```json
{
	"scripts": {
		"build": "pkgroll"
	}
}
```

### For Libraries: No bundler needed

TypeScript compiles directly. Use `tsc --noEmit` for type checking.

## Testing

Tests live **alongside the code they test** using `.test.ts` naming:

```
packages/your-package/
└── src/
    ├── module.ts
    └── module.test.ts   ← test file next to the source file
```

Do **not** use `__tests__/` folders. See the root `CLAUDE.md` for full Vitest conventions.

## Publishing Packages

Internal packages use `"private": true` to prevent accidental npm publication.

To publish a package publicly:

1. Remove `"private": true` from package.json
2. Update version in package.json
3. Create a release/tag
4. Use CI/CD to publish to npm

Example published package: `@your-org/my-package` (when ready)

## Example: Complete Setup

Use `pnpm generate:package` to scaffold a new CLI package with:

- Proper build configuration with pkgroll
- TypeScript and ESLint setup
- Namespace exports pattern
- Centralized constants
- Full documentation

See `packages/ui/` for a React component library example.
