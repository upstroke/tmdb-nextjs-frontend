import { HeaderPage } from '../../../POM/HeaderPage.js';

const header = HeaderPage();

describe('Security: Search XSS Prevention', () => {
  beforeEach(() => {
    header.visit('de-DE');
  });

  it('zeigt keine Script-Injection in Suchergebnissen', () => {
    const xssInput = '<script>alert("XSS")</script>';
    
    // XSS-Input eingeben
    header.searchInput.type(xssInput);
    
    // Enter drücken, um Suche zu triggern
    header.searchInput.type('{enter}');
    
    // Seite sollte nicht crashen – wir landen auf /search
    cy.location('pathname').should('include', '/search');
    
    // Kein echtes Script-Tag im DOM
    cy.get('body').then(($body) => {
      const bodyHtml = $body.html();
      expect(bodyHtml).to.not.include('<script>');
      expect(bodyHtml).to.not.include('</script>');
    });
    
    // Kein Alert sollte getriggert werden
    let alertTriggered = false;
    cy.on('window:alert', () => {
      alertTriggered = true;
    });
    
    cy.wait(500);
    cy.wrap(alertTriggered).should('be.false');
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
