import { LISTS, CONTRAST_ONLY } from '../support/accessibility-helpers.js';

describe('Accessibility — card hover contrast', () => {
  const locale = 'en-US';

  LISTS.forEach(({ name, path }) => {
    it(`[A11Y-19] keeps text contrast while hovering a card on the ${name}`, () => {
      cy.visitLocale(locale, path);
      cy.get('a.default-card').first().should('be.visible').realHover();
      cy.checkPageA11y(CONTRAST_ONLY);
    });
  });
});
