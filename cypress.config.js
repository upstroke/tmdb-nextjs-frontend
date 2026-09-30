import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',

    // Acceptance tests: tests/acceptance/<feature>/*.spec.js
    // Each feature directory also contains a *-testplan.md
    specPattern: 'tests/acceptance/**/*.spec.js',

    // Support entry point — registers cypress-axe and custom commands
    // (cy.visitLocale, cy.checkPageA11y)
    supportFile: 'tests/setup/cypress.js',

    // Shared domain fixtures used by cy.intercept stubs
    fixturesFolder: 'tests/fixtures',

    // Artifacts — excluded from version control via .gitignore
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

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
