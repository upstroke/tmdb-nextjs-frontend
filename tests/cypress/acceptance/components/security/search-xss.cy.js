import { HomePage } from '../../../POM/HomePage.js';

describe('Security: Search XSS Prevention', () => {
  const homePage = HomePage('de-DE');

  beforeEach(() => {
    homePage.visit();
  });

  it('zeigt keine Script-Injection in Suchergebnissen', () => {
    const xssPayload = '<script>alert("XSS")</script>';
    homePage.visit();

    cy.get('input[name="search"]').type(`${xssPayload}{enter}`);
    cy.location('pathname').should('include', '/search');

    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get('main').should('contain', xssPayload);
    cy.contains(xssPayload).should('not.have.length', 0);
  });

  it('akzeptiert normale Suchanfragen', () => {
    const searchTerm = 'Inception';
    homePage.visit();

    cy.get('input[name="search"]').type(`${searchTerm}{enter}`);
    cy.location('pathname').should('include', '/search');
    cy.location('search').should('include', 'q=Inception');

    cy.get('main').should('contain', 'Suche');
  });
});
