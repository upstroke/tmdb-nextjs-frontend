const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/cypress/acceptance/**/*.cy.{js,jsx}',
    supportFile: 'tests/cypress/support/e2e.js',
    fixturesFolder: 'tests/cypress/fixtures',
    screenshotsFolder: 'tests/cypress/screenshots',
    videosFolder: 'tests/cypress/videos',
    downloadsFolder: 'tests/cypress/downloads',
    setupNodeEvents(on, config) {
      // Add webpack preprocessor with alias
      const webpackPreprocessor = require('@cypress/webpack-preprocessor');
      const webpackOptions = {
        resolve: {
          extensions: ['.js', '.jsx'],
          alias: {
            '@tests': __dirname,
            '@pom': `${__dirname}/cypress/POM`,
          },
        },
      };

      on('file:preprocessor', webpackPreprocessor({ webpackOptions }));
    },
  },
});
