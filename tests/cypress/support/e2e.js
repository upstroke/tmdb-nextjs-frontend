// Global support file — runs before every test file.
// Import the Cypress commands and the accessibility plugin once.

import 'cypress-axe';
import './commands';
import './tmdb.commands';
import '@testing-library/cypress';

Cypress.Commands.add('checkPageA11y', (options = {}) => {
  cy.injectAxe();
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
