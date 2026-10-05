import { BasePage } from './BasePage.js';
import { HeaderPage } from './HeaderPage.js';

/**
 * Home Page module — encapsulates homepage selectors and actions.
 *
 * Composes BasePage for navigation and HeaderPage for header interactions.
 *
 * @param {string} [locale='en-US'] - BCP 47 locale tag
 * @returns {Object} HomePage instance with sections and assertions
 */
export function HomePage(locale = 'en-US') {
  const base = BasePage(locale, '/');
  const header = HeaderPage();

  return {
    ...base,
    header,

    /**
     * @returns {Cypress.Chainable}
     */
    get sections() {
      return cy.get('main section');
    },

    /**
     * Assert at least one trending section is rendered.
     * @returns {Object} This instance for chaining
     */
    assertTrendingSectionsExist() {
      this.sections.should('have.length.greaterThan', 0);
      return this;
    },
  };
}
