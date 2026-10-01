import { BasePage } from './BasePage.js';
import { HeaderPage } from './HeaderPage.js';

/**
 * Home Page Object — encapsulates selectors and actions for the homepage.
 *
 * Extends BasePage for locale-aware navigation and composes HeaderPage
 * for header interactions. Add homepage-specific element getters and
 * action methods here as the page grows.
 *
 * @example
 * import { HomePage } from '$tests/pages/HomePage.js';
 *
 * const home = new HomePage('en-US');
 * home.visit();
 * home.header.assertVisible();
 * home.assertTrendingSectionsExist();
 */
export class HomePage extends BasePage {
  /**
   * @param {string} locale - BCP 47 locale tag, e.g. 'en-US' or 'de-DE'.
   */
  constructor(locale) {
    super(locale, '/');

    /** @type {HeaderPage} */
    this.header = new HeaderPage();
  }

  /**
   * All `<section>` elements inside the main content area.
   *
   * @returns {Cypress.Chainable}
   */
  get sections() {
    return cy.get('main section');
  }

  /**
   * Assert at least one trending section is rendered on the homepage.
   * The heading text is locale-specific, so we check for section landmarks.
   *
   * @returns {this}
   */
  assertTrendingSectionsExist() {
    this.sections.should('have.length.greaterThan', 0);
    return this;
  }
}
