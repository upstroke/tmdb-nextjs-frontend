// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const sharedPlugins = [
  react({
    jsxRuntime: 'automatic',
  }),
  istanbul({
    include: ['components/**/*'],
    exclude: ['node_modules/**', 'vitest/**', 'components/providers/**'],
    requireEnv: false,
    forceBuildInstrument: true,
  }),
];

const sharedResolve = {
  alias: {
    '@': resolve(__dirname, '.'),
    $tests: resolve(__dirname, 'vitest'),
  },
};

export default defineConfig({
  plugins: sharedPlugins,
  resolve: sharedResolve,

  test: {
    silent: true,

    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json', 'json-summary'],
      include: [
        'lib/**/*.js',
        'lib/**/*.jsx',
        'app/api/**/*.js',
        'app/api/**/*.jsx',
        'components/**/*.js',
        'components/**/*.jsx',
      ],
      exclude: [
        'lib/stores/locale.jsx',
        'vitest/**',
        'node_modules/**',
        '**/*.test.{js,jsx}',
        '**/*.cy.{js,jsx}',
        'app/[locale]/**',
        'app/*.js',
        'app/layout.js',
        'app/page.js',
        'middleware.js',
        'next.config.js',
        'postcss.config.js',
        'vite.config.js',
        'vitest.config.js',
        'components/providers/**',
      ],
      all: true,
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
    },

    projects: [
      {
        name: 'unit',
        resolve: sharedResolve,
        plugins: sharedPlugins,
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          include: ['vitest/unit/**/*.test.{js,jsx}'],
        },
      },
      {
        name: 'integration',
        resolve: sharedResolve,
        plugins: sharedPlugins,
        test: {
          name: 'integration',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest/setup/vitest.js'],
          include: ['vitest/integration/**/*.test.js', 'vitest/integration/**/*.test.jsx'],
          exclude: ['vitest/integration/**/*.browser.test.{js,jsx}'],
        },
      },
      {
        name: 'browser',
        resolve: sharedResolve,
        plugins: sharedPlugins,
        test: {
          name: 'browser',
          globals: true,
          include: [
            'vitest/component/**/*.browser.test.{js,jsx}',
            'vitest/integration/**/*.browser.test.{js,jsx}',
          ],
          exclude: ['vitest/unit/**', 'vitest/integration/**/*.test.{js,jsx}', 'node_modules/**'],
          setupFiles: ['./vitest/setup/browser.jsx'],

          optimizeDeps: {
            include: [
              'next/router',
              'next/navigation',
              'next/link',
              'next/image',
              '@testing-library/react'
            ]
          },

          server: {
            deps: {
              optimizer: {
                web: {
                  exclude: ['components/**/*']
                }
              }
            }
          },

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
