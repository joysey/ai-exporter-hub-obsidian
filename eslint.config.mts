import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores([
    "node_modules",
    "main.js",
    "test-vault",
    "coverage",
    "docs/ignore",
    ".claude",
    ".zcode",
    "esbuild.config.mjs",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "versions.json",
  ]),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "eslint.config.mts",
            "manifest.json",
            "scripts/*.mjs",
            "test/*.ts",
            "vitest.config.ts",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".json"],
      },
    },
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["scripts/**/*.mjs", "test/**/*.ts", "vitest.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
      "obsidianmd/no-nodejs-modules": "off",
      "obsidianmd/rule-custom-message": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "obsidianmd/ui/sentence-case": [
        "warn",
        {
          brands: [
            "AI Exporter Hub",
            "AI Knowledge",
            "AI Knowledge/Knowledge",
            "Markdown",
            "Obsidian",
          ],
          acronyms: ["AI", "HTTP", "HTTPS", "URL"],
          enforceCamelCaseLower: true,
        },
      ],
    },
  }
);
