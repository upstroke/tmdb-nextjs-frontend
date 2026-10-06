import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    supportFile: 'tests/cypress/support/e2e.js',
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/cypress/acceptance/**/*.cy.{js,jsx}',
    fixturesFolder: 'tests/cypress/fixtures',
    downloadsFolder: 'tests/cypress/downloads',
    screenshotsFolder: 'tests/cypress/screenshots',
    videosFolder: 'tests/cypress/videos',
    video: false,
    setupNodeEvents(on, config) {
      // Implement node event listeners here
    },
  },

  component: {
    supportFile: 'tests/cypress/support/component.js',
    specPattern: 'tests/cypress/acceptance/components/cardDefault/cardDefault.cy.js',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
