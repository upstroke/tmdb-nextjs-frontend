import { defineConfig } from 'cypress';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      const webpackOptions = {
        resolve: {
          extensions: ['.js', '.jsx'],
          alias: {
            '@pom': `${__dirname}/cypress/POM`,
          },
        },
      };

      on('file:preprocessor', webpackPreprocessor({ webpackOptions }));
    },
  },

  component: {
    supportFile: 'tests/cypress/support/component.js',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
