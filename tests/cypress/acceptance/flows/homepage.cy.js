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
    homePage.searchInput.type('Batman{enter}');
    cy.location('pathname').should('include', '/search');
  });
});
