// tests/cypress/acceptance/components/security/search-xss.cy.js
describe('Security: Search XSS Prevention', () => {
  beforeEach(() => {
    cy.visit('/de-DE');
  });
  it('sanitizes XSS-Input im Suchfeld', () => {
    const xssInput = '<script>alert("XSS")</script>';
    cy.get('input[placeholder*="Suche"]').type(xssInput).type('{enter}');
    cy.url().should('include', '/de-DE');
    cy.contains(xssInput).should('not.exist');
  });
  it('akzeptiert normale Suchanfragen', () => {
    const searchQuery = 'Batman';
    cy.get('input[placeholder*="Suche"]').type(searchQuery).type('{enter}');
    cy.url().should('include', '/de-DE');
    cy.contains(searchQuery).should('exist');
  });
});
