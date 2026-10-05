import { HeaderPage } from '../../../POM/HeaderPage.js';

const header = HeaderPage();

describe('Security: Search XSS Prevention', () => {
  beforeEach(() => {
    header.visit('de-DE');
  });

  it('zeigt keine Script-Injection in Suchergebnissen', () => {
    const xssInput = '<script>alert("XSS")</script>';
    header.searchInput.type(xssInput).type('{enter}');
    cy.contains(xssInput).should('exist');
    cy.on('window:alert', () => {
      throw new Error('XSS Alert triggered');
    });
  });

  it('akzeptiert normale Suchanfragen', () => {
    header.searchInput.type('Batman').type('{enter}');
    cy.location('pathname').should('include', '/search');
  });
});
