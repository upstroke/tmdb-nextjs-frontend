import { PAGES, expectVisibleFocus } from '../support/accessibility-helpers.js';

describe('Accessibility — skip link', () => {
  const locale = 'en-US';

  it('[A11Y-10] shows a visible focus indicator on the first focusable element', () => {
    cy.visitLocale(locale);
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().closest('#menuHeader').should('exist');
    cy.focused().should('have.attr', 'href', '#main-content');
    cy.focused().then(expectVisibleFocus);
  });

  it('[A11Y-18] keeps text contrast on the focused element', () => {
    cy.visitLocale(locale);
    cy.realPress('Tab');
    cy.focused().closest('#menuHeader').should('exist');
    cy.checkPageA11y({ runOnly: { type: 'rule', values: ['color-contrast'] } });
  });

  PAGES.forEach(({ name, path }) => {
    it(`[A11Y-22] skips the header and moves focus to the main content on the ${name}`, () => {
      cy.visitLocale(locale, path);

      cy.i18n(locale).then(({ labels }) => {
        cy.realPress('Tab');
        cy.focused().should('have.text', labels.skipToContent);
        cy.realPress('Enter');

        cy.location('hash').should('eq', '#main-content');
        cy.focused().should('have.id', 'main-content');
      });
    });
  });
});
