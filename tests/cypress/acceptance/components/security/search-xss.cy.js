import { HeaderPage } from '../../../POM/HeaderPage.js';

const header = HeaderPage();

describe('Security: Search XSS Prevention', () => {
  beforeEach(() => {
    header.visit('de-DE');
  });

  it('zeigt keine Script-Injection in Suchergebnissen', () => {
    const xssInput = '<script>alert("XSS")</script>';
    header.searchInput.type(xssInput);

    // Ergebnis-Layer sollte erscheinen
    cy.get('#typeahead-search-results')
      .should('be.visible');

    // Kein echtes Script-Tag im Ergebnis
    cy.get('#typeahead-search-results script')
      .should('not.exist');

    // Keine Alert-Aufrufe
    cy.on('window:alert', () => {
      throw new Error('XSS Alert triggered');
    });
  });

  it('akzeptiert normale Suchanfragen', () => {
    header.searchInput.type('Batman');

    cy.get('#typeahead-search-results')
      .should('be.visible');

    cy.get('#typeahead-search-results [role="option"]')
      .should('have.length.at.least', 1);
  });
});
