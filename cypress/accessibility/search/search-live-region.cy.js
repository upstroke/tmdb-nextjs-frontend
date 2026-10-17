import { card, searchWithStub } from '../support/accessibility-helpers.js';
import { formatMessage } from '../../../lib/i18n/format.js';

describe('Accessibility — search live region', () => {
  const locale = 'en-US';

  it('[A11Y-11] announces the result count in the live region', () => {
    const movies = [card(27205, 'movie', 'Inception')];
    const tvShows = [card(1396, 'tv', 'Breaking Bad')];

    searchWithStub(locale, {
      body: { movies, tvShows, results: [...movies, ...tvShows], error: null }
    });

    cy.i18n(locale).then(({ messages }) => {
      const text = formatMessage(messages.searchResultsCount, { count: 2 });
      cy.get('.u-sr-only[aria-live="polite"]').should('contain', text);
    });
  });
});
