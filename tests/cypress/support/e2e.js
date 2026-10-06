// tests/cypress/support/e2e.js

import 'cypress-axe';
import './commands.js';
import './tmdb.commands.js';
import '@testing-library/cypress';

Cypress.Commands.add('checkPageA11y', (options = {}) => {
  cy.injectAxe({
    axeCorePath: '../../node_modules/axe-core/axe.min.js'
  });
  cy.checkA11y(
    null,
    {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      ...options
    },
    null,
    true
  );
});
