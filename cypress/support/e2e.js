import 'cypress-axe';
import '@testing-library/cypress';

import './commands';
import './tmdb.commands.js';

Cypress.Commands.add('checkPageA11y', (options = {}) => {
  cy.injectAxe();

  cy.checkA11y(
    null,
    {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
      },
      ...options
    },
    null,
    true
  );
});
