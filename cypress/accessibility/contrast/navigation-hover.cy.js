import { NAV_ITEMS, CONTRAST_ONLY } from '../support/accessibility-helpers.js';

describe('Accessibility — navigation hover contrast', () => {
  const locale = 'en-US';

  NAV_ITEMS.forEach(({ name, id }) => {
    it(`[A11Y-16] keeps text contrast while hovering the ${name} link`, () => {
      cy.visitLocale(locale);
      cy.get(`${id} a`).realHover();
      cy.checkPageA11y(CONTRAST_ONLY);
    });
  });
});
