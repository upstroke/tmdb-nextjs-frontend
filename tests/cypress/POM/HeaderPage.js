/**
 * Header Page module — encapsulates header selectors and assertions.
 *
 * @returns {Object} HeaderPage instance with header selectors and assertions
 */
export function HeaderPage() {
  return {
    /**
     * @returns {Cypress.Chainable}
     */
    get root() {
      return cy.get('header[role="banner"]');
    },

    /**
     * @returns {Cypress.Chainable}
     */
    get languageSwitcher() {
      return this.root.get('[data-testid="language-switcher"]');
    },

    /**
     * @returns {Object} This instance for chaining
     */
    assertVisible() {
      this.root.should('be.visible');
      return this;
    },

    /**
     * @returns {Object} This instance for chaining
     */
    assertLanguageSwitcherExists() {
      this.languageSwitcher.should('exist');
      return this;
    },
  };
}
