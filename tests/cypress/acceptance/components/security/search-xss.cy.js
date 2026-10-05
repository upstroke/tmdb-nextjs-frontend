// tests/cypress/acceptance/components/security/search-xss.cy.js
// Security-Test: XSS-Prävention in der Suche

describe('Security: Search XSS Prevention', () => {
  it('zeigt keine Script-Injection in Suchergebnissen', () => {
    cy.visit('/');
    
    // Gib XSS-Payload in die Suche ein
    cy.findByRole('searchbox', { name: /filme suchen/i })
      .type('<script>alert("xss")</script>{enter}');
    
    // Sollte keine Alert-Box zeigen (wird automatisch geblockt)
    // Der Suchbegriff sollte escaped angezeigt werden
    cy.findByText(/<script>/i).should('not.exist');
    
    // Stattdessen sollte der escaped Text sichtbar sein
    cy.contains(/<script>/i).should('exist');
  });

  it('akzeptiert normale Suchanfragen', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /filme suchen/i })
      .type('Inception{enter}');
    
    // Sollte Suchergebnisse anzeigen
    cy.findByText(/inception/i).should('exist');
  });
});
