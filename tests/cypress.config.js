import { defineConfig } from 'cypress';
import viteConfig from '../vitest.config.js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/acceptance/**/*.cy.{js,jsx}',
    downloadsFolder: 'cypress/downloads',
    fixturesFolder: 'cypress/fixtures',
    screenshotOnRunFailure: true,
    video: false,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  component: {
    supportFile: 'tests/cypress/support/component.js',
    specPattern: 'tests/cypress/acceptance/components/cardDefault/cardDefault.cy.js',
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        root: '.',
      },
    },
  },
});
