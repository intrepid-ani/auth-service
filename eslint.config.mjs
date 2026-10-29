import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    globalIgnores(["dist/**", "node_modules/**", ".env", "*.txt"]),
    {
        files: ["**/*.ts"],
        extends: [
            js.configs.recommended,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "@typescript-eslint/no-floating-promises": "error",
        },
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["tests/*.spec.ts"],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    }
);
