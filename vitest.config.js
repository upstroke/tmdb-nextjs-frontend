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
    // Tell Vite's own esbuild step to treat .js files as JSX.
    // This is required because vite:import-analysis runs before user plugins
    // and would fail on JSX syntax in .js files before @vitejs/plugin-react
    // can transform them.
    include: /\.(jsx?|tsx?)$/,
    loader: 'jsx',
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
