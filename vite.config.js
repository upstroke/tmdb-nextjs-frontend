// vite.config.js
// Vite configuration for Cypress Component Testing
// This config is used by Cypress when running component tests (tests/cypress/component/)
// Cypress Component Testing uses Vite as its dev server
// For Vitest unit/integration tests, see vitest.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react({
      include: ['**/*.jsx', '**/*.js'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      $tests: resolve(__dirname, 'tests'),
    },
  },
});
