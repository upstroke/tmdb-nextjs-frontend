export const HeaderPage = () => {
  const menuButton = () => cy.get('#menuHeader');
  const burgerButton = () => cy.get('.burger-icon');
  const navMenu = () => cy.get('#navmenu');
  const searchInput = () => cy.get('#typeahead-search-input');
  const languageSelect = () => cy.get('#language-select');

  /**
   * Get the link inside a navigation item
   * @param {string} itemId - e.g. '#nav-home', '#nav-movies' or '#nav-tv'
   */
  const navLink = (itemId) => cy.get(`${itemId} a`);

  /**
   * Visit the homepage with the given locale
   * @param {string} locale - e.g. 'en-US' or 'de-DE'
   */
  const visit = (locale) => {
    cy.visit(`/${locale}`);
  };

  return {
    menuButton,
    burgerButton,
    navMenu,
    navLink,
    searchInput,
    languageSelect,
    visit
  };
};
