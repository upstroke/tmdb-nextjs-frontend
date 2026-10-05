import { defineConfig } from 'cypress';
import viteConfig from '../vitest.config.js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'tests/cypress/support/e2e.js',
    specPattern: 'tests/cypress/acceptance/**/*.cy.{js,jsx}',
    downloadsFolder: 'tests/cypress/downloads',
    fixturesFolder: 'tests/cypress/fixtures',
    screenshotOnRunFailure: true,
    video: false,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig,
    },
    supportFile: 'tests/cypress/support/component.js',
    specPattern: 'tests/cypress/component/**/*.cy.{js,jsx}',
    indexHtmlFile: 'tests/cypress/support/component-index.html',
  },
});
