import { CONTRAST_ONLY } from '../support/accessibility-helpers.js';

describe('Accessibility — load more hover contrast', () => {
  const locale = 'en-US';

  it('[A11Y-20] keeps text contrast while hovering the load more button', () => {
    cy.visitLocale(locale, '/movies');
    cy.get('.load-more button').should('be.visible').and('not.be.disabled').realHover();
    cy.checkPageA11y(CONTRAST_ONLY);
  });
});
