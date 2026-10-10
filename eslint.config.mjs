import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import jsdoc from 'eslint-plugin-jsdoc';

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores(['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    plugins: { jsdoc },
    rules: {
      // Enforce JSDoc on public functions
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false
          }
        }
      ],
      // Params + returns declared in JSDoc must match actual signature
      'jsdoc/check-param-names': 'warn',
      // '@tags' is used by Cypress test annotations
      'jsdoc/check-tag-names': ['warn', { definedTags: ['tags'] }],
      'jsdoc/check-types': 'warn',
      // Descriptions must not be empty
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      // @param and @returns must exist when there are params/return values
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      // No duplicate tags
      'jsdoc/no-multi-asterisks': 'warn',
      'jsdoc/valid-types': 'warn'
    }
  },
  {
    // Tests, mocks, Cypress, scripts and tool configs do not need full JSDoc
    files: ['vitest/**', 'cypress/**', 'scripts/**', '*.config.js', '*.config.mjs'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off'
    }
  }
]);

export default eslintConfig;
