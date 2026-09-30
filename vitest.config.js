import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react({
      // Allow JSX syntax in .js files (e.g. lib/stores/locale.js).
      include: ['**/*.jsx', '**/*.js'],
    }),
  ],
  esbuild: {
    // Treat .js files as JSX so that vite:import-analysis does not fail
    // on JSX syntax in .js source files (e.g. lib/stores/locale.js)
    // before the @vitejs/plugin-react transform runs.
    include: /\.(js|jsx)$/,
    loader: 'jsx',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Tell Vite's dep pre-bundler to treat .js files as JSX.
      // This prevents vite:import-analysis from failing on JSX syntax
      // in .js source files (e.g. lib/stores/locale.js) before the
      // @vitejs/plugin-react transform can run.
      loader: {
        '.js': 'jsx',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.js'],
    include: [
      'tests/unit/**/*.test.js',
      'tests/integration/**/*.test.js',
      'tests/integration/**/*.test.jsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'components/**', 'app/**'],
      exclude: ['**/*.test.js', '**/*.test.jsx', 'node_modules/**', 'lib/schemas/tmdb.js', 'lib/i18n/config.js'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '$tests': resolve(__dirname, 'tests'),
    },
  },
});
