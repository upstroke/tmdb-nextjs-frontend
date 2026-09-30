import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const sharedPlugins = [
  react({
    // Allow JSX syntax in .js files (e.g. lib/stores/locale.js).
    include: ['**/*.jsx', '**/*.js'],
  }),
];

const sharedEsbuild = {
  // Treat .js files as JSX so that vite:import-analysis does not fail
  // on JSX syntax in .js source files (e.g. lib/stores/locale.js)
  // before the @vitejs/plugin-react transform runs.
  include: /\.(js|jsx)$/,
  loader: 'jsx',
};

const sharedOptimizeDeps = {
  esbuildOptions: {
    // Tell Vite's dep pre-bundler to treat .js files as JSX.
    // This prevents vite:import-analysis from failing on JSX syntax
    // in .js source files (e.g. lib/stores/locale.js) before the
    // @vitejs/plugin-react transform can run.
    loader: {
      '.js': 'jsx',
    },
  },
};

const sharedResolve = {
  alias: {
    '@': resolve(__dirname, '.'),
    '$tests': resolve(__dirname, 'tests'),
  },
};

export default defineConfig({
  plugins: sharedPlugins,
  esbuild: sharedEsbuild,
  optimizeDeps: sharedOptimizeDeps,
  resolve: sharedResolve,
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'components/**', 'app/**'],
      exclude: ['**/*.test.js', '**/*.test.jsx', 'node_modules/**', 'lib/schemas/tmdb.js', 'lib/i18n/config.js'],
    },
    projects: [
      {
        name: 'unit',
        plugins: sharedPlugins,
        esbuild: sharedEsbuild,
        optimizeDeps: sharedOptimizeDeps,
        resolve: sharedResolve,
        test: {
          name: 'unit',
          environment: 'jsdom',
          // No setupFiles: MSW does not run for unit tests.
          include: ['tests/unit/**/*.test.js'],
        },
      },
      {
        name: 'integration',
        plugins: sharedPlugins,
        esbuild: sharedEsbuild,
        optimizeDeps: sharedOptimizeDeps,
        resolve: sharedResolve,
        test: {
          name: 'integration',
          environment: 'jsdom',
          // MSW server lifecycle (listen / resetHandlers / close) runs here.
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
