export const HeaderPage = () => {
  const menuButton = () => cy.get('#menuHeader');
  const navMenu = () => cy.get('#navmenu');
  const searchInput = () => cy.get('#typeahead-search-input');
  const languageSelect = () => cy.get('#language-select');

  /**
   * Visit the homepage with the given locale
   * @param {string} locale - e.g. 'en-US' or 'de-DE'
   */
  const visit = (locale) => {
    cy.visit(`/${locale}`);
  };

  return {
    menuButton,
    navMenu,
    searchInput,
    languageSelect,
    visit
  };
};
