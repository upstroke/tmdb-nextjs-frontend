import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',

    // Test files follow the project convention: tests/acceptance/<feature>/*.spec.js
    specPattern: 'tests/acceptance/**/*.spec.js',

    // Support file
    supportFile: 'tests/setup/cypress.js',

    // Fixtures shared across all test levels
    fixturesFolder: 'tests/fixtures',

    // Artifacts — excluded from version control via .gitignore
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Viewport — matches Fomantic UI default breakpoints
    viewportWidth: 1280,
    viewportHeight: 800,

    // Retry on CI to handle transient failures
    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      return config;
    },
  },
});
