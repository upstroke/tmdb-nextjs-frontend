import { card, searchWithStub, CONTRAST_ONLY } from '../support/accessibility-helpers.js';

describe('Accessibility — search result hover contrast', () => {
  const locale = 'en-US';

  it('[A11Y-17] keeps text contrast while hovering a search result', () => {
    const movies = [card(27205, 'movie', 'Inception')];

    searchWithStub(locale, {
      body: { movies, tvShows: [], results: movies, error: null }
    });

    cy.get('#movie-27205').should('be.visible').realHover();
    cy.checkPageA11y(CONTRAST_ONLY);
  });
});
