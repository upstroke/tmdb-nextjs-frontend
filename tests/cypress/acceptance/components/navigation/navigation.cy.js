import { BasePage } from '../../../POM/BasePage.js';
import { HeaderPage } from '../../../POM/HeaderPage.js';

const base = BasePage();
const header = HeaderPage();

describe('Navigation', () => {
  it('[NAV-01] loads the homepage without errors', () => {
    base.visit('en-US');
    base.assertPathname('en-US');
  });

  it('[NAV-02] includes the locale in the URL', () => {
    base.visit('en-US');
    cy.location('pathname').should('include', '/en-US');
  });

  it('[NAV-03] displays a visible header', () => {
    base.visit('en-US');
    header.navMenu().should('be.visible');
  });

  it('[NAV-04] has a language switcher in the header', () => {
    base.visit('en-US');
    header.languageSelect().should('exist');
  });
});
