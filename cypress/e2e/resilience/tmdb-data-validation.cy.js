describe('TMDB data validation acceptance', () => {
  it('shows the localized search error message when the search API returns an unusable response', () => {
    cy.task('getLocaleText', 'de-DE').then(({ messages }) => {
      cy.intercept('GET', '/api/de-DE/search?q=matrix*', {
        statusCode: 502,
        body: {
          movies: [],
          tvShows: [],
          results: [],
          error: messages.searchError
        }
      }).as('searchApi');

      cy.visit('/de-DE');
      cy.get('#typeahead-search-input').type('matrix');

      cy.wait('@searchApi');
      cy.contains(messages.searchError).should('be.visible');
    });
  });
});
