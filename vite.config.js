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
