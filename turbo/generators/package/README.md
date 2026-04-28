# Package Generator

This Turborepo generator automates the creation of new packages in the monorepo, eliminating the need for manual scaffolding of 12+ files.

## Usage

**Interactive mode** (recommended for most use cases):

```bash
pnpm generate:package
```

**Non-interactive mode** (for CI/CD or scripting):

```bash
turbo gen package --args "@repo/my-lib" "utility" "My library" ""
```

The interactive generator will prompt you for:

1. **Package name** - Must be in format `@repo/[kebab-case]` (e.g., `@repo/my-awesome-lib`)
2. **Package type** - Choose from:
   - `CLI (with build)` - Distributable CLI tool with pkgroll bundling
   - `Utility Library` - Internal utility/helper library
   - `React Component Library` - Reusable React components
3. **Description** (optional) - Brief description for package.json
4. **CLI command name** (CLI type only) - The name of the CLI command in kebab-case

## Generated Files

### All Package Types

Every package gets these common files:

- `package.json` - Base configuration
- `tsconfig.json` - Extends `@repo/typescript-config/base.json`
- `eslint.config.js` - Extends `@repo/eslint-config/base`
- `.gitignore` - Standard ignores (dist/, node_modules/, .turbo/)
- `README.md` - Basic documentation
- `src/` - Source directory with appropriate structure

### CLI Package Additions

CLI packages additionally get:

- `src/cli.ts` - Executable entry point (bundled to `dist/cli.js`)
- `src/lib/constants.ts` - Centralized configuration constants
- `src/lib/index.ts` - Namespace exports
- `package.json` includes:
  - `"build": "pkgroll"` script
  - `"bin"` entry pointing to the CLI command

### Utility Library Additions

Utility packages get:

- `src/index.ts` - Library entry point
- `src/lib/index.ts` - Namespace exports for future modules
- No build script (exports TypeScript directly)

### React Library Additions

React packages get:

- `src/.gitkeep` - Ready for first component
- `turbo/generators/config.ts` - Component scaffold generator
- `turbo/generators/templates/component.hbs` - Component template
- `package.json` includes:
  - `"generate:component": "turbo gen react-component"` script
  - Wildcard exports for components: `"./*": "./src/*.tsx"`

## Examples

### Create a CLI Tool

**Interactive:**

```bash
pnpm generate:package
? Package name: @repo/my-cli-tool
? Package type: CLI (with build step)
? Description: A handy command-line tool
? CLI command name: my-cli-tool
```

**Non-interactive:**

```bash
# Format: @repo/name type description cliCommandName
turbo gen package --args "@repo/my-cli-tool" "cli" "A handy command-line tool" "my-cli-tool"
```

Result: Full CLI package ready for `pnpm build`

### Create a Utility Library

**Interactive:**

```bash
pnpm generate:package
? Package name: @repo/helpers
? Package type: Utility Library (no build step)
? Description: Common helper functions
```

**Non-interactive:**

```bash
# Format: @repo/name type description cliCommandName (empty string for utility)
turbo gen package --args "@repo/helpers" "utility" "Common helper functions" ""
```

Result: Utility library ready for import

### Create a React Component Library

**Interactive:**

```bash
pnpm generate:package
? Package name: @repo/my-components
? Package type: React Component Library (like ui)
? Description: Shared UI components
? CLI command name (e.g., my-awesome-lib)? [Leave empty if not CLI]:
```

**Non-interactive:**

```bash
# Format: @repo/name type description cliCommandName (empty string for react)
turbo gen package --args "@repo/my-components" "react" "Shared UI components" ""
```

Result: React library with component generator ready:

```bash
pnpm --filter @repo/my-components generate:component
```

## Validation

After generation:

1. **Type checking** - Run `pnpm -w check:types --filter @repo/package-name`
2. **Linting** - Run `pnpm -w check:lint --filter @repo/package-name`
3. **Building** (CLI only) - Run `pnpm --filter @repo/package-name build`

## What the Generator Does

1. Creates the package directory structure
2. Generates all required configuration files
3. Sets up TypeScript and ESLint configs (inheriting from shared configs)
4. Creates appropriate source files based on package type
5. For React: Sets up component generator
6. Automatically runs `pnpm install` to register the package

## Naming Requirements

- Package names must start with `@repo/`
- Followed by kebab-case characters only (lowercase letters, numbers, hyphens)
- Examples:
  - ✅ `@repo/my-lib`
  - ✅ `@repo/helpers-v2`
  - ❌ `@repo/MyLib` (not kebab-case)
  - ❌ `my-lib` (missing @repo/ prefix)
  - ❌ `@repo/my_lib` (underscores not allowed)

## Integration with Workspace

The generator:

- Creates the package in the `packages/` directory
- Automatically registers it with pnpm workspaces
- Integrates with Turborepo task configuration
- Uses workspace protocol dependencies (`workspace:*`)

After generation, the package is immediately available:

```bash
pnpm install                          # Updates lock file
pnpm -w check --filter @repo/pkg-name # Verify package
```

## Fallback: Manual Setup

If you need to create a package manually for any reason, see `packages/README.md` for the "[Setup Checklist for New Packages](#setup-checklist-for-new-packages)" section.

## Files Location

Generator configuration: `/turbo/generators/config.ts`

Template files:

- Common: `/turbo/generators/templates-package/common/`
- CLI-specific: `/turbo/generators/templates-package/cli/`
- Utility-specific: `/turbo/generators/templates-package/utility/`
- React-specific: `/turbo/generators/templates-package/react/`
