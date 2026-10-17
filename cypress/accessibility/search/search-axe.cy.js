import { card, searchWithStub } from '../support/accessibility-helpers.js';

describe('Accessibility — search axe checks', () => {
  const locale = 'en-US';

  it('[A11Y-07] has no axe violations with stubbed search results open', () => {
    const movies = [card(27205, 'movie', 'Inception')];
    const tvShows = [card(1396, 'tv', 'Breaking Bad')];

    cy.intercept('GET', `**/api/${locale}/search*`, {
      body: { movies, tvShows, results: [...movies, ...tvShows], error: null }
    }).as('search');

    cy.visitLocale(locale);
    cy.get('#typeahead-search-input').type('Inception');
    cy.wait('@search');

    // The listbox is rendered after the response and hidden while closed.
    cy.get('#typeahead-search-results').should('be.visible');
    cy.get('#movie-27205').should('be.visible');
    cy.get('#tv-1396').should('be.visible');
    cy.get('#typeahead-search-input').should('have.attr', 'aria-expanded', 'true');

    cy.checkPageA11y();
  });

  it('[A11Y-12] has no axe violations when the search finds nothing', () => {
    searchWithStub(locale, { body: { movies: [], tvShows: [], results: [], error: null } });

    cy.i18n(locale).then(({ messages }) => {
      cy.get('#status-messages')
        .should('have.attr', 'role', 'status')
        .and('contain', messages.searchNoResults);
    });
    cy.checkPageA11y();
  });

  it('[A11Y-13] has no axe violations when the search request fails', () => {
    searchWithStub(locale, { statusCode: 500, body: { error: 'Search failed' } });

    cy.i18n(locale).then(({ messages }) => {
      cy.get('#status-messages')
        .should('have.attr', 'role', 'alert')
        .and('contain', messages.searchError);
    });
    cy.checkPageA11y();
  });
});
