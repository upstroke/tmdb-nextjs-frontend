/**
 * Base Page Object — shared navigation helpers for all page objects.
 *
 * Every page object extends BasePage to inherit locale-aware
 * navigation and common query helpers. Direct cy.visit() calls
 * in spec files should be avoided; use page.visit() instead so
 * the locale prefix is always applied consistently.
 *
 * @example
 * import { HomePage } from '$tests/pages/HomePage.js';
 * const home = new HomePage('en-US');
 * home.visit();
 */
export class BasePage {
  /**
   * @param {string} locale - BCP 47 locale tag, e.g. 'en-US' or 'de-DE'.
   * @param {string} path   - Route path after the locale prefix, e.g. '/movies'.
   */
  constructor(locale, path) {
    this.locale = locale;
    this.path = path;
  }

  /**
   * Navigate to this page using the configured locale and path.
   *
   * Wraps cy.visitLocale() so every page object navigates via
   * the same custom command and locale-prefix convention.
   *
   * @returns {this}
   */
  visit() {
    cy.visitLocale(this.locale, this.path);
    return this;
  }

  /**
   * Assert the current URL contains the locale prefix.
   *
   * @returns {this}
   */
  assertLocaleInUrl() {
    cy.url().should('include', `/${this.locale}`);
    return this;
  }

  /**
   * Assert the main content landmark is present.
   *
   * @returns {this}
   */
  assertMainExists() {
    cy.get('main').should('exist');
    return this;
  }
}
