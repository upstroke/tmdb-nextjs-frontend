// tests/cypress/POM/HeaderPage.js

const selectors = {
  root: '#menuHeader',
  navigation: '#navmenu',
  navigationItems: '#navmenu a',
  searchInput: '#typeahead-search-input',
  languageSwitcher: '#language-select',
  menuButton: '#menuHeader .burger-icon'
};

export function HeaderPage() {
  return {
    get root() {
      return cy.get(selectors.root);
    },

    get navigation() {
      return cy.get(selectors.navigation);
    },

    get navigationItems() {
      return cy.get(selectors.navigationItems);
    },

    get searchInput() {
      return cy.get(selectors.searchInput);
    },

    get languageSwitcher() {
      return cy.get(selectors.languageSwitcher);
    },

    get menuButton() {
      return cy.get(selectors.menuButton);
    },

    /**
     * Navigate to a page and return this for chaining
     */
    visit(locale = 'en-US') {
      cy.visit(`/${locale}`);
      return this;
    },

    assertVisible() {
      this.root.should('be.visible');
    },

    assertNavigationExists() {
      this.navigation.should('exist');
    },

    assertLanguageSwitcherExists() {
      this.languageSwitcher.should('exist');
    }
  };
}
