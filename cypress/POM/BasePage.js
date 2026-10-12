/**
 * Page object with helpers shared by all pages.
 *
 * Built as a factory like HeaderPage, so call it without `new`.
 *
 * @returns {{
 *   visit: (locale?: string) => void,
 *   getUrl: () => Cypress.Chainable<string>,
 *   getHeader: () => Cypress.Chainable<JQuery<HTMLElement>>,
 *   getLanguageSwitcher: () => Cypress.Chainable<JQuery<HTMLElement>>,
 *   assertPathname: (locale: string) => void
 * }} Page helpers.
 */
export function BasePage() {
  /**
   * Visit the homepage of a locale.
   *
   * @param {string} [locale='de-DE'] - e.g. 'en-US' or 'de-DE'.
   * @returns {void}
   */
  const visit = (locale = 'de-DE') => {
    cy.visit(`/${locale}`);
  };

  const getUrl = () => cy.url();

  const getHeader = () => cy.get('header');

  const getLanguageSwitcher = () => cy.get('[data-testid="language-switcher"]');

  /**
   * Assert that the current pathname is the homepage of a locale.
   * A trailing slash is accepted.
   *
   * @param {string} locale - e.g. 'en-US' or 'de-DE'.
   * @returns {void}
   */
  const assertPathname = (locale) => {
    cy.location('pathname').should('match', new RegExp(`^/${locale}/?$`));
  };

  return { visit, getUrl, getHeader, getLanguageSwitcher, assertPathname };
}
