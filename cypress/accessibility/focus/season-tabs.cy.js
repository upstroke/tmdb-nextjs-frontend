import { TV_SHOW_ID, CONTRAST_ONLY } from '../support/accessibility-helpers.js';

describe('Accessibility — season tabs', () => {
  const locale = 'en-US';
  const detailPath = `/tv-shows/${TV_SHOW_ID}`;

  it('[A11Y-24] keeps text contrast while hovering a season tab', () => {
    cy.visitLocale(locale, detailPath);

    cy.get('[role="tab"]')
      .first()
      .should('be.visible')
      .realHover();
    cy.checkPageA11y(CONTRAST_ONLY);
  });

  it('[A11Y-25] keeps text contrast while focusing a season tab', () => {
    cy.visitLocale(locale, detailPath);

    cy.get('[role="tab"]')
      .first()
      .focus();
    cy.focused().should('have.attr', 'role', 'tab');

    // TabGroupe selects and focuses the next tab for ArrowRight.
    cy.realPress('ArrowRight');
    cy.focused().should('have.attr', 'role', 'tab');
    cy.checkPageA11y(CONTRAST_ONLY);
  });
});
