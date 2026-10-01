/**
 * Header Page Object — encapsulates selectors and actions for the global header.
 *
 * The header is present on every page, so HeaderPage is composed into
 * other page objects rather than extended. Instantiate it wherever
 * a test needs to interact with header elements.
 *
 * @example
 * import { HeaderPage } from '$tests/pages/HeaderPage.js';
 * const header = new HeaderPage();
 * header.assertVisible();
 * header.assertLanguageSwitcherExists();
 */
export class HeaderPage {
  /**
   * The `<header>` landmark element.
   *
   * @returns {Cypress.Chainable}
   */
  get root() {
    return cy.get('header');
  }

  /**
   * The language switcher control inside the header.
   * Matches data-testid, aria-label (English), and aria-label (German).
   *
   * @returns {Cypress.Chainable}
   */
  get languageSwitcher() {
    return this.root.find('#language-select');
  }

  /**
   * Assert the header is visible.
   *
   * @returns {this}
   */
  assertVisible() {
    this.root.should('be.visible');
    return this;
  }

  /**
   * Assert the language switcher is present inside the header.
   *
   * @returns {this}
   */
  assertLanguageSwitcherExists() {
    this.languageSwitcher.should('exist');
    return this;
  }
}
