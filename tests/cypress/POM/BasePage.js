// tests/cypress/POM/BasePage.js

const selectors = {
  body: 'body'
};

export function BasePage() {
  return {
    get body() {
      return cy.get(selectors.body);
    },

    /**
     * Asserts the current pathname starts with /{locale}
     * e.g. /en-US or /de-DE
     */
    assertPathname(expectedLocale) {
      cy.location('pathname').should('match', new RegExp(`^/${expectedLocale}(/|$)`));
    },

    /**
     * Asserts the page is loaded (body is visible)
     */
    assertPageLoaded() {
      this.body.should('be.visible');
    }
  };
}
