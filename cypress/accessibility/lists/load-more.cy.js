import { card } from '../support/accessibility-helpers.js';

describe('Accessibility — load more', () => {
  const locale = 'en-US';

  it('[A11Y-27] announces the load more loading state and appends new cards', () => {
    const newCard = card(999999, 'movie', 'Accessibility Test Movie');

    cy.intercept('GET', '**/api/en-US/movies?page=2', {
      delay: 300,
      body: {
        cards: [newCard],
        page: 2,
        hasMore: true
      }
    }).as('loadMore');

    cy.visitLocale(locale, '/movies');

    cy.get('.load-more')
      .should('have.attr', 'aria-live', 'polite');
    cy.get('.load-more button')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    cy.i18n(locale).then(({ messages }) => {
      cy.get('.load-more button')
        .should('have.attr', 'aria-busy', 'true')
        .and('contain', messages.loadMoreLoading);
    });

    cy.wait('@loadMore');

    cy.get('.load-more button')
      .should('have.attr', 'aria-busy', 'false');
    cy.contains('a.default-card', 'Accessibility Test Movie')
      .should('be.visible');
  });
});
