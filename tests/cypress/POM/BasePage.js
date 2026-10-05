export const BasePage = () => {
  /**
   * Navigate to a pathname with locale prefix
   * @param {string} locale - e.g. 'en-US' or 'de-DE'
   * @param {string} pathname - e.g. '/' or '/movies/123'
   */
  const visit = (locale, pathname) => {
    cy.visit(`/${locale}${pathname}`);
  };

  /**
   * Assert that the current URL pathname matches the expected pattern
   * @param {string|RegExp} expected - Expected pathname or regex pattern
   */
  const assertPathname = (expected) => {
    cy.location('pathname').should('match', new RegExp(`^/${expected}/?$`));
  };

  return {
    visit,
    assertPathname,
  };
};
