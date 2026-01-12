import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import * as parser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        },
        project: "./tsconfig.json"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/strict-boolean-expressions": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "interface",
          format: ["PascalCase"]
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"]
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"]
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"]
        }
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-empty-function": ["warn", { allow: ["arrowFunctions"] }],
      "max-lines-per-function": "off",
      "complexity": ["warn", 10],
      "max-depth": ["warn", 4],
      "max-nested-callbacks": ["warn", 3],
      "no-duplicate-imports": "warn",
      "sort-imports": "off",
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: parser,
      globals: {
        React: true,
        JSX: true
      }
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs",
      "dist/**",
      "coverage/**",
      ".turbo/**",
      ".claude/**"
    ]
  }
]);

export default eslintConfig;
