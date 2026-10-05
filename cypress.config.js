import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',

    // Acceptance/E2E specs in tests/cypress/acceptance (.cy.js and legacy .spec.js)
    specPattern: 'tests/cypress/acceptance/**/*.{cy,spec}.js',

    // Support entry point — registers custom commands
    supportFile: 'tests/cypress/support/e2e.js',

    // Cypress-specific fixtures used by cy.intercept stubs
    fixturesFolder: 'tests/cypress/fixtures',

    // Artifacts — exclude these paths from version control via .gitignore
    downloadsFolder: 'tests/cypress/downloads',
    screenshotsFolder: 'tests/cypress/screenshots',
    videosFolder: 'tests/cypress/videos',

    // Viewport — matches Fomantic UI desktop breakpoint
    viewportWidth: 1280,
    viewportHeight: 800,

    // Retry flaky tests on CI; never retry in interactive mode
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Default locale used by cy.visitLocale when cypress.env.json is absent.
    // Override per run: cypress run --env DEFAULT_LOCALE=de-DE
    // or create cypress.env.json (not committed) with { "DEFAULT_LOCALE": "en-US" }
    env: {
      DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en-US',
    },

    setupNodeEvents(on, config) {
      return config;
    },
  },
});
