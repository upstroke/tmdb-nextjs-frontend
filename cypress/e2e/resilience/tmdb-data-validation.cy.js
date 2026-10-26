const locale = 'en-US';

describe('TMDB data validation acceptance', () => {
  it('shows the localized search error message when the search API returns an unusable response', () => {
    cy.i18n(locale).then(({ messages }) => {
      cy.intercept(
        { method: 'GET', pathname: `/api/${locale}/search` },
        {
          statusCode: 502,
          body: {
            movies: [],
            tvShows: [],
            results: [],
            error: messages.searchError
          }
        }
      ).as('searchApi');

      cy.visitLocale(locale);

      cy.get('#typeahead-search-input').type('matrix');

      cy.wait('@searchApi');
      cy.contains(messages.searchError).should('be.visible');
    });
  });
});
