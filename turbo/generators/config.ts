import path from "node:path";
import { existsSync } from "node:fs";
import type { PlopTypes } from "@turbo/gen";

type UnionOmit<T, K extends string | number | symbol> = T extends unknown ? Omit<T, K> : never;

// https://plopjs.com/documentation/
// https://github.com/SBoudrias/Inquirer.js/blob/main/packages/inquirer/README.md#prompt-types

/**
 * Validates that a string is valid kebab-case
 */
function isValidKebabCase(str: string): boolean {
	return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(str);
}

/**
 * Validates that a package name follows @repo/[kebab-case] format
 */
function isValidPackageName(name: string): boolean {
	if (!name.startsWith("@repo/")) return false;
	const shortName = name.slice(6); // Remove @repo/
	return isValidKebabCase(shortName);
}

/**
 * Extracts the short package name from @repo/package-name
 */
function getShortName(fullName: string): string {
	return fullName.slice(6); // Remove @repo/
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	// Custom action type helper example
	plop.setActionType("makeExecutable", makeExecutableAction);

	// Register a custom helper to map script type to file extension
	plop.setHelper("scriptExtension", function (scriptType) {
		const extensionMap = {
			bash: "bash",
			typescript: "ts",
		};
		return extensionMap[scriptType.toLowerCase()] ?? "bash";
	});

	// A simple generator to add a new bin script
	plop.setGenerator("bin", {
		description: "Adds a new bin script",
		prompts: [
			// Ask for name
			{
				type: "input",
				name: "name",
				message: "What is the name of the script?",
			},
			// Ask for .bash or .ts script
			{
				type: "list",
				name: "type",
				message: "What is the type of the script?",
				choices: ["Bash", "TypeScript"],
				default: "Bash",
			},
		],
		actions: [
			Action.add({
				path: "bin/{{kebabCase name}}.{{scriptExtension type}}",
				templateFile: "templates/{{scriptExtension type}}.hbs",
			}),
			Action.makeExecutable({ path: "bin/{{kebabCase name}}.{{scriptExtension type}}" }),
		],
	});

	// Generator for creating new packages in the monorepo
	// Note: Package generator templates are in templates-package/ (not templates/) because
	// the root config.ts shares the same directory as the bin templates. This avoids naming
	// conflicts while keeping related generators in the same config file.
	plop.setGenerator("package", {
		description: "Scaffolds a new package in the monorepo",
		prompts: [
			{
				type: "input",
				name: "packageName",
				message: "Package name (e.g., @repo/my-awesome-lib)?",
				validate: (input: string) => {
					if (!input.trim()) {
						return "Package name is required";
					}
					if (!isValidPackageName(input)) {
						return "Package name must be @repo/[kebab-case], e.g., @repo/my-lib";
					}
					const packagePath = path.join(process.cwd(), "packages", getShortName(input));
					if (existsSync(packagePath)) {
						return `Package @repo/${getShortName(input)} already exists`;
					}
					return true;
				},
			},
			{
				type: "list",
				name: "packageType",
				message: "Package type?",
				choices: [
					{
						name: "CLI (with build step)",
						value: "cli",
					},
					{
						name: "Utility Library (no build step)",
						value: "utility",
					},
					{
						name: "React Component Library (like ui)",
						value: "react",
					},
				],
				default: "utility",
			},
			{
				type: "input",
				name: "packageDescription",
				message: "Package description (optional)?",
				default: "",
			},
			{
				type: "input",
				name: "cliCommandName",
				message: "CLI command name (e.g., my-awesome-lib)? [Leave empty if not CLI]",
				validate: (input: string, answers: Record<string, string>) => {
					// Only validate if it's a CLI package
					const isCli = answers.packageType === "cli";
					if (isCli && !input.trim()) {
						return "CLI command name is required for CLI packages";
					}
					if (input.trim() && !isValidKebabCase(input)) {
						return "CLI command name must be kebab-case";
					}
					return true;
				},
				default: (answers: Record<string, string>) => {
					const isCli = answers.packageType === "cli";
					if (isCli) {
						const shortName = getShortName(answers.packageName as string);
						return shortName;
					}
					return "";
				},
			},
		],
		actions: (data) => {
			const actions: PlopTypes.ActionConfig[] = [];
			const typedData = data as Record<string, string>;
			const shortName = getShortName(typedData.packageName);
			const packagePath = `packages/${shortName}`;

			// Common files for all package types
			actions.push(
				Action.add({
					path: `${packagePath}/tsconfig.json`,
					templateFile: "templates-package/common/tsconfig.json.hbs",
					data: typedData,
				}),
				Action.add({
					path: `${packagePath}/eslint.config.js`,
					templateFile: "templates-package/common/eslint.config.js.hbs",
					data: typedData,
				}),
				Action.add({
					path: `${packagePath}/.gitignore`,
					templateFile: "templates-package/common/.gitignore.hbs",
					data: typedData,
				}),
				Action.add({
					path: `${packagePath}/README.md`,
					templateFile: "templates-package/common/README.md.hbs",
					data: typedData,
				})
			);

			// package.json - type specific
			const packageJsonTemplate = `templates-package/${typedData.packageType}/package.json.hbs`;
			actions.push(
				Action.add({
					path: `${packagePath}/package.json`,
					templateFile: packageJsonTemplate,
					data: typedData,
				})
			);

			// src/index.ts for CLI and Utility
			if (typedData.packageType !== "react") {
				actions.push(
					Action.add({
						path: `${packagePath}/src/index.ts`,
						templateFile: "templates-package/common/src/index.ts.hbs",
						data: typedData,
					})
				);
			}

			// CLI-specific files
			if (typedData.packageType === "cli") {
				actions.push(
					Action.add({
						path: `${packagePath}/src/cli.ts`,
						templateFile: "templates-package/cli/src/cli.ts.hbs",
						data: typedData,
					}),
					Action.add({
						path: `${packagePath}/src/lib/index.ts`,
						templateFile: "templates-package/cli/src/lib/index.ts.hbs",
						data: typedData,
					}),
					Action.add({
						path: `${packagePath}/src/lib/constants.ts`,
						templateFile: "templates-package/cli/src/lib/constants.ts.hbs",
						data: typedData,
					})
				);
			}

			// Utility-specific files
			if (typedData.packageType === "utility") {
				actions.push(
					Action.add({
						path: `${packagePath}/src/lib/index.ts`,
						templateFile: "templates-package/utility/src/lib/index.ts.hbs",
						data: typedData,
					})
				);
			}

			// React-specific files
			if (typedData.packageType === "react") {
				actions.push(
					Action.add({
						path: `${packagePath}/src/.gitkeep`,
						templateFile: "templates-package/common/.gitkeep",
					}),
					Action.add({
						path: `${packagePath}/turbo/generators/config.ts`,
						templateFile: "templates-package/react/turbo/generators/config.ts.hbs",
						data: typedData,
					}),
					Action.add({
						path: `${packagePath}/turbo/generators/templates/component.hbs`,
						templateFile: "templates-package/react/turbo/generators/templates/component.hbs.hbs",
						data: typedData,
					}),
					Action.add({
						path: `${packagePath}/turbo/generators/templates/.gitkeep`,
						templateFile: "templates-package/common/.gitkeep",
					})
				);
			}

			// Add a success message
			actions.push({
				type: "add",
				path: `${packagePath}/.plop-success`,
				skipIfExists: true,
				template: "Package scaffolded successfully! Run 'pnpm install' to complete setup.",
			} as PlopTypes.ActionConfig);

			return actions;
		},
	});
}

/**
 * Helper functions to create action configs with the correct type.
 */
const Action = {
	add(config: UnionOmit<PlopTypes.AddActionConfig, "type">): PlopTypes.AddActionConfig {
		return {
			type: "add",
			...config,
		} as PlopTypes.AddActionConfig;
	},

	addMany(config: UnionOmit<PlopTypes.AddManyActionConfig, "type">): PlopTypes.AddManyActionConfig {
		return {
			type: "addMany",
			...config,
		} as PlopTypes.AddManyActionConfig;
	},

	modify(config: UnionOmit<PlopTypes.ModifyActionConfig, "type">): PlopTypes.ModifyActionConfig {
		return {
			type: "modify",
			...config,
		} as PlopTypes.ModifyActionConfig;
	},

	append(config: UnionOmit<PlopTypes.AppendActionConfig, "type">): PlopTypes.AppendActionConfig {
		return {
			type: "append",
			...config,
		} as PlopTypes.AppendActionConfig;
	},

	makeExecutable(config: { path: string }): MakeExecutableActionConfig {
		return {
			type: "makeExecutable",
			...config,
		} as MakeExecutableActionConfig;
	},
};

/**
 * Makes specified path executable with chmod +x
 */
const makeExecutableAction: PlopTypes.CustomActionFunction = async (
	/** The answers object from the prompts */
	answers: any,
	/** The config object from the action */
	config: (PlopTypes.ActionConfig & { path?: string }) | undefined,
	/** The plopfile API */
	plopfileApi
) => {
	if (!config || !config.path || !plopfileApi) {
		return "No path specified";
	}
	const { path } = config;
	const renderedPath = plopfileApi.renderString(path, answers);
	const { spawn } = await import("child_process");
	try {
		await spawn("chmod", ["+x", renderedPath]);
	} catch (error) {
		return `Failed to make file executable: ${renderedPath}`;
	}

	return `File made executable: ${renderedPath}`;
};

type MakeExecutableActionConfig = PlopTypes.ActionConfig & {
	path: string;
};
