import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    specPattern: 'tests/cypress/acceptance/components/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: 'tests/cypress/support/component.ts',
    indexHtmlFile: 'tests/cypress/support/component-index.html',
    devServer: {
      framework: 'next',
      bundler: 'next'
    }
  },
  e2e: {
    specPattern: 'tests/cypress/acceptance/flows/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: 'tests/cypress/support/e2e.ts',
    baseUrl: 'http://localhost:3000'
  }
});
