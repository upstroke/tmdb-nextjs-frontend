import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.mjs"],
    plugins: { jsdoc },
    rules: {
      // Enforce JSDoc on public functions
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      // Params + returns declared in JSDoc must match actual signature
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-tag-names": "warn",
      "jsdoc/check-types": "warn",
      // Descriptions must not be empty
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
      // @param and @returns must exist when there are params/return values
      "jsdoc/require-param": "warn",
      "jsdoc/require-returns": "warn",
      // No duplicate tags
      "jsdoc/no-multi-asterisks": "warn",
      "jsdoc/valid-types": "warn",
    },
  },
];

export default eslintConfig;
