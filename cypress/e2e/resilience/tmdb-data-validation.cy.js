import { getLocaleText } from '../../../lib/i18n/helpers.js';

const locale = 'en-US';
const { messages } = getLocaleText(locale);

describe('TMDB data validation acceptance', () => {
  it('shows the localized search error message when the search API returns an unusable response', () => {
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

    cy.visit(`/${locale}`);
    cy.get('#typeahead-search-input').type('matrix');

    cy.wait('@searchApi');
    cy.contains(messages.searchError).should('be.visible');
  });
});
