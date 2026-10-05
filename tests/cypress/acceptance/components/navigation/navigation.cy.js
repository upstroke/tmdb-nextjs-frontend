import { HomePage } from '../../POM/HomePage.js';

describe('Navigation', () => {
  const home = HomePage('en-US');

  it('[NAV-01] loads the homepage without errors', () => {
    home.visit();
    home.assertPathname();
  });

  it('[NAV-02] includes the locale in the URL', () => {
    home.visit();
    cy.location('pathname').should('startWith', '/en-US');
  });

  it('[NAV-03] displays a visible header', () => {
    home.visit();
    home.header.assertVisible();
  });

  it('[NAV-04] has a language switcher in the header', () => {
    home.visit();
    home.header.assertLanguageSwitcherExists();
  });
});
