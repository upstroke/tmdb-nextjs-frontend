// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ============================================================================
// 1. SYSTEM-LEVEL LOG FILTER (Safely silences compiler noise without breaking lifecycle)
// ============================================================================
const filterIstanbulLogs = (stream) => {
  const originalWrite = stream.write;
  stream.write = function (chunk, encoding, callback) {
    const rawString = chunk.toString();

    if (
      rawString.includes('vite:istanbul>') ||
      rawString.includes('Sourcemaps was automatically enabled')
    ) {
      if (typeof callback === 'function') callback();
      return true;
    }
    return originalWrite.call(stream, chunk, encoding, callback);
  };
};

filterIstanbulLogs(process.stdout);
filterIstanbulLogs(process.stderr);

// ============================================================================
// 2. SHARED VARIABLES & HELPERS (Reused across different test environments)
// ============================================================================
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const isCoverageRun = process.argv.includes('--coverage');

const sharedResolve = {
  alias: {
    '@': resolve(__dirname, '.'),
    $tests: resolve(__dirname, 'vitest')
  }
};

const preOptimizedDeps = [
  'next/router',
  'next/navigation',
  'next/link',
  'next/image',
  '@testing-library/react',
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@testing-library/jest-dom/vitest'
];

function getProjectPlugins() {
  const plugins = [react({ jsxRuntime: 'automatic' })];

  if (isCoverageRun) {
    plugins.push(
      istanbul({
        include: ['components/**/*'],
        exclude: ['node_modules/**', 'vitest/**', 'components/providers/**'],
        requireEnv: false,
        forceBuildInstrument: true,
        quiet: true
      })
    );
  }
  return plugins;
}

// ============================================================================
// 3. MAIN VITEST CONFIGURATION (Global settings and isolated workspaces)
// ============================================================================
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  resolve: sharedResolve,

  optimizeDeps: {
    include: preOptimizedDeps
  },

  build: {
    sourcemap: true
  },

  test: {
    silent: true,

    // Global coverage engine settings
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json', 'json-summary'],
      include: [
        'lib/**/*.js',
        'lib/**/*.jsx',
        'app/api/**/*.js',
        'app/api/**/*.jsx',
        'components/**/*.js',
        'components/**/*.jsx'
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
        'components/providers/**'
      ],
      all: true,
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80
      }
    },

    // Isolated workspaces for different testing strategies
    projects: [
      {
        name: 'unit',
        resolve: sharedResolve,
        plugins: getProjectPlugins(),
        optimizeDeps: {
          include: preOptimizedDeps
        },
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          include: ['vitest/unit/**/*.test.{js,jsx}']
        }
      },
      {
        // Integration tests run in jsdom (Node) so async Server Components such as
        // app/[locale]/**/page.js can be called directly and process.env works.
        name: 'integration',
        resolve: sharedResolve,
        plugins: getProjectPlugins(),
        // Pages under app/ are .js files that contain JSX.
        esbuild: {
          loader: 'jsx',
          include: /\.[jt]sx?$/,
          exclude: /node_modules/,
          jsx: 'automatic'
        },
        optimizeDeps: {
          include: preOptimizedDeps
        },
        test: {
          name: 'integration',
          globals: true,
          environment: 'jsdom',
          include: ['vitest/integration/**/*.test.{js,jsx}'],
          setupFiles: ['./vitest/setup/browser.jsx']
        }
      },
      {
        name: 'browser',
        resolve: sharedResolve,
        plugins: getProjectPlugins(),
        optimizeDeps: {
          include: preOptimizedDeps
        },
        test: {
          name: 'browser',
          globals: true,
          include: ['vitest/component/**/*.browser.test.{js,jsx}'],
          exclude: ['vitest/unit/**', 'vitest/integration/**', 'node_modules/**'],
          setupFiles: ['./vitest/setup/browser.jsx'],
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
            instances: [{ browser: 'chromium' }]
          }
        }
      }
    ]
  }
});
