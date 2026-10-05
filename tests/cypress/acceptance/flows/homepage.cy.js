import { HomePage } from '../../POM/HomePage.js';

const homePage = HomePage();

describe('Homepage', () => {
  beforeEach(() => {
    homePage.visit();
  });

  it('should display the homepage title', () => {
    homePage.assertTitleVisible();
  });

  it('should navigate to movie details when clicking on a movie card', () => {
    homePage.visit();
    homePage.movieCards.first().click();
    cy.location('pathname').should('match', /^\/(en-US|de-DE)\/movies\//);
  });

  it('should search for movies when using the search bar', () => {
    homePage.visit();
    homePage.searchInput
      .should('be.visible')
      .type('Batman');

    cy.get('#typeahead-search-results')
      .should('be.visible')
      .and('have.attr', 'role', 'listbox');

    cy.get('#typeahead-search-results [role="option"]')
      .should('have.length.at.least', 1);
  });
});
