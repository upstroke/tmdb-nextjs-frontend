/**
 * Base Page module — provides locale-aware navigation helpers.
 *
 * @param {string} locale - BCP 47 locale tag, e.g. 'en-US'
 * @param {string} path - URL path for this page
 * @returns {Object} BasePage instance with visit() and assertPathname()
 */
export function BasePage(locale, path) {
  return {
    locale,
    path,

    /**
     * Navigate to this page with the configured locale.
     * @returns {Object} This instance for chaining
     */
    visit() {
      cy.visitWithLocale(this.path, this.locale);
      return this;
    },

    /**
     * Assert the current pathname matches the expected locale + path.
     * @returns {Object} This instance for chaining
     */
    assertPathname() {
      cy.location('pathname').should('eq', `/${this.locale}${this.path}`);
      return this;
    },
  };
}
