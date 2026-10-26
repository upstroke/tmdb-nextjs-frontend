describe('TMDB data validation acceptance', () => {
  it('shows the search error message when the search API returns an unusable response', () => {
    cy.intercept('GET', '/api/de-DE/search?q=matrix*', {
      statusCode: 502,
      body: {
        movies: [],
        tvShows: [],
        results: [],
        error: 'Suche konnte nicht geladen werden.'
      }
    }).as('searchApi');

    cy.visit('/de-DE');

    cy.get('#typeahead-search-input').type('matrix');

    cy.wait('@searchApi');
    cy.contains('Suche konnte nicht geladen werden.').should('be.visible');
  });
});
