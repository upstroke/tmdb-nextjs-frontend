// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,

  retries: { runMode: 2, openMode: 0 },

  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures'
  }
});
