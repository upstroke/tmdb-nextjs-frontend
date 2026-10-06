// vitest.config.js
// Vitest configuration for unit and integration tests

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
    $tests: resolve(__dirname, 'tests'),
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'app/api/**'],
      exclude: [
        '**/*.test.js',
        '**/*.test.jsx',
        '**/*.cy.js',
        '**/*.cy.jsx',
        'node_modules/**',
        'lib/schemas/tmdb.js',
        'lib/i18n/config.js',
        'tests/cypress/**',
        'tests/setup/**',
        'tests/mocks/**',
      ],
    },

    projects: [
      {
        name: 'unit',
        resolve: sharedResolve,
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          include: ['tests/unit/**/*.test.{js,jsx}'],
        },
      },
      {
        name: 'integration',
        resolve: sharedResolve,
        test: {
          name: 'integration',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./tests/setup/vitest.js'],
          include: [
            'tests/integration/**/*.test.js',
            'tests/integration/**/*.test.jsx',
          ],
        },
      },
    ],
  },
});
