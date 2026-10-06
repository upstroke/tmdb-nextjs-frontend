const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/acceptance/**/*.{cy.js,cy.jsx}',
    excludeSpecPattern: ['cypress/acceptance/components/**/*'],
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
