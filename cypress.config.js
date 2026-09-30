import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',

    // Test files location
    specPattern: 'cypress/e2e/**/*.cy.js',

    // Artifacts
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Viewport — matches Fomantic UI breakpoints
    viewportWidth: 1280,
    viewportHeight: 800,

    // Retry on CI to handle flakiness
    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // Node event listeners can be added here
      return config;
    },
  },
});
