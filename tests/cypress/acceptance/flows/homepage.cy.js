import { HomePage } from '@pom/HomePage.js';

describe('Homepage', () => {
  const homePage = HomePage('en-US');

  beforeEach(() => {
    homePage.visit();
  });

  it('should display the homepage title', () => {
    homePage.header.assertVisible();
  });

  it('should navigate to movie details when clicking on a movie card', () => {
    cy.get('main a[href*="/movie/"]').first().click();
    cy.location('pathname').should('include', '/movie/');
  });

  it('should search for movies when using the search bar', () => {
    cy.get('input[aria-label="Search"], input[name="search"]').first()
      .type('Inception{enter}');
    cy.location('pathname').should('include', '/search');
  });
});
