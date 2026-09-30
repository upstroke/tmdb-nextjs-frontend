import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
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
      exclude: ['**/*.test.js', '**/*.test.jsx', 'node_modules/**', 'lib/schemas/tmdb.js'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '$tests': resolve(__dirname, 'tests'),
    },
  },
});
