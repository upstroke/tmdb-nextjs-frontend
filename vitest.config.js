// vitest.config.js
// Vitest configuration for unit, integration, and browser-based UI tests

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const sharedPlugins = [
  react({
    include: ['**/*.jsx', '**/*.js'],
  }),
];

const sharedResolve = {
  alias: {
    '@': resolve(__dirname, '.'),
    $tests: resolve(__dirname, 'vitest'),
  },
};

export default defineConfig({
  esbuild: {
    include: /\.(js|jsx)$/,
    loader: 'jsx',
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },

  plugins: sharedPlugins,

  resolve: sharedResolve,

  test: {
    projects: [
      {
        name: 'unit',
        resolve: sharedResolve,
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          include: ['vitest/unit/**/*.test.{js,jsx}'],
          coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['lib/**/*.{js,jsx}', 'app/api/**/*.{js,jsx}'],
            exclude: [
              'node_modules/**',
              'vitest/**',
              '**/*.test.{js,jsx}',
              '**/*.cy.{js,jsx}',
            ],
          },
        },
      },

      {
        name: 'integration',
        resolve: sharedResolve,
        test: {
          name: 'integration',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest/setup/vitest.js'],
          include: [
            'vitest/integration/**/*.test.js',
            'vitest/integration/**/*.test.jsx',
          ],
          exclude: ['vitest/integration/**/*.browser.test.{js,jsx}'],
          coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['lib/**/*.{js,jsx}', 'app/api/**/*.{js,jsx}'],
            exclude: [
              'node_modules/**',
              'vitest/**',
              '**/*.test.{js,jsx}',
              '**/*.cy.{js,jsx}',
            ],
          },
        },
      },

      {
        name: 'browser',
        resolve: sharedResolve,
        test: {
          name: 'browser',
          globals: true,

          include: [
            'vitest/component/**/*.browser.test.{js,jsx}',
            'vitest/integration/**/*.browser.test.{js,jsx}',
          ],

          exclude: [
            'vitest/unit/**',
            'vitest/integration/**/*.test.{js,jsx}',
            'node_modules/**',
          ],

          setupFiles: ['./vitest/setup/browser.js'],

          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
});
