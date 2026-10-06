// tests/cypress/POM/BasePage.js

export class BasePage {
  visit(locale = 'de-DE') {
    cy.visit(`/${locale}`);
  }

  getUrl() {
    return cy.url();
  }

  getHeader() {
    return cy.get('header');
  }

  getLanguageSwitcher() {
    return cy.get('[data-testid="language-switcher"]');
  }
}
