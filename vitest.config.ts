import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Automatically discover all packages as separate projects
		projects: ["packages/*", "apps/*"],

		// Root-level options (apply to all projects)
		globals: true,

		// Coverage configuration (process-wide)
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			reportsDirectory: "./coverage",
			include: ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts"],
			exclude: [
				"**/node_modules/**",
				"**/dist/**",
				"**/*.test.ts",
				"packages/*/src/cli.ts", // CLI entry points, underlying logic should be tested via integration tests.
			],
		},
	},
});
