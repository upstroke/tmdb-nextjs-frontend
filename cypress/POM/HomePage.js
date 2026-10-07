export const HomePage = () => {
  const page = () => cy.get('main.home-page');
  const movieCards = () => cy.get('#home-card-1');
  const searchInput = () => cy.get('#typeahead-search-input');

  /**
   * Visit the homepage with the given locale
   * @param {string} locale - e.g. 'en-US' or 'de-DE'
   */
  const visit = (locale) => {
    cy.visit(`/${locale}`);
  };

  /**
   * Assert that the page title is visible
   */
  const assertTitleVisible = () => {
    page().should('be.visible');
  };

  return {
    page,
    movieCards,
    searchInput,
    visit,
    assertTitleVisible,
  };
};
