import { HeaderPage } from '../../../POM/HeaderPage.js';

const header = HeaderPage();

describe('Security: Search XSS Prevention', () => {
  beforeEach(() => {
    header.visit('de-DE');
  });

  it('sanitizes XSS-Input im Suchfeld', () => {
    const xssInput = '<script>alert("XSS")</script>';
    
    // XSS-Input eingeben
    header.searchInput.type(xssInput);
    
    // Der Value im Input-Feld sollte exakt dem Input entsprechen (als Text, nicht ausgeführt)
    header.searchInput.should('have.value', xssInput);
    
    // Enter drücken, um Suche zu triggern
    header.searchInput.type('{enter}');
    
    // Seite sollte nicht crashen – wir landen auf /search
    cy.location('pathname').should('include', '/search');
    
    // URL-Parameter sollte encoded sein (< wird zu %3C, > zu %3E)
    cy.location('search').should('include', '%3Cscript%3E');
    cy.location('search').should('include', '%3C/script%3E');
    
    // Kein echtes Script-Tag im DOM
    cy.get('script').should('not.exist');
    
    // Body-HTML sollte die encoded Version enthalten, nicht das rohe Script-Tag
    cy.get('body').then(($body) => {
      const bodyHtml = $body.html();
      // Das rohe <script>-Tag darf nicht vorkommen
      expect(bodyHtml).to.not.include('<script>alert');
      expect(bodyHtml).to.not.include('</script>');
    });
  });

  it('akzeptiert normale Suchanfragen', () => {
    header.searchInput.type('Batman');
    header.searchInput.type('{enter}');
    
    cy.location('pathname').should('include', '/search');
    
    // Suchergebnisse sollten angezeigt werden
    cy.get('[data-testid="movie-card"]', { timeout: 5000 })
      .should('have.length.at.least', 1);
  });
});
