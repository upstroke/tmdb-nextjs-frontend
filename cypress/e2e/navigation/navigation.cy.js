import { BasePage } from '../../POM/BasePage.js';
import { HeaderPage } from '../../POM/HeaderPage.js';

const base = BasePage();
const header = HeaderPage();

describe('Navigation', () => {
  it('[NAV-01] loads the homepage without errors', () => {
    base.visit('en-US');
    base.assertPathname('en-US');
  });

  it('[NAV-02] includes the locale in the URL', () => {
    base.visit('en-US');
    cy.location('pathname').should('include', '/en-US');
  });

  it('[NAV-03] displays a visible header', () => {
    base.visit('en-US');
    header.navMenu().should('be.visible');
  });

  it('[NAV-04] has a language switcher in the header', () => {
    base.visit('en-US');
    header.languageSelect().should('exist');
  });

  it('[NAV-05] opens Movies, TV shows and Home through the menu links', () => {
    base.visit('en-US');

    header.navLink('#nav-movies').click();
    cy.location('pathname').should('match', /^\/en-US\/movies\/?$/);
    header.navLink('#nav-movies').should('have.attr', 'aria-current', 'page');

    header.navLink('#nav-tv').click();
    cy.location('pathname').should('match', /^\/en-US\/tv-shows\/?$/);
    header.navLink('#nav-tv').should('have.attr', 'aria-current', 'page');

    header.navLink('#nav-home').click();
    cy.location('pathname').should('match', /^\/en-US\/?$/);
    header.navLink('#nav-home').should('have.attr', 'aria-current', 'page');
  });

  it('[NAV-09] opens the mobile menu, follows a link, and closes the menu', () => {
    cy.viewport(375, 667);
    base.visit('en-US');

    header.burgerButton().click();
    header.burgerButton().should('have.attr', 'aria-expanded', 'true');

    header.navLink('#nav-movies').click();

    cy.location('pathname').should('match', /^\/en-US\/movies\/?$/);
    header.burgerButton().should('have.attr', 'aria-expanded', 'false');
  });

  it('[NAV-14] mobile: searches from the open menu, opens a result, and closes the menu', () => {
    // Only the search request of the browser is stubbed. The detail page loads on the server,
    // so the test checks the path and not the title (see R-01 in the test plan).
    cy.intercept({ method: 'GET', pathname: '/api/en-US/search' }, {
      body: {
        movies: [
          {
            id: 603,
            mediaType: 'movie',
            title: 'The Matrix',
            date: '1999-03-30',
            rating: 8.2,
            posterUrl: null
          }
        ],
        tvShows: []
      }
    }).as('search');

    cy.viewport(375, 667);
    base.visit('en-US');

    header.burgerButton().click();
    header.burgerButton().should('have.attr', 'aria-expanded', 'true');

    header.searchInput().type('matrix');
    cy.wait('@search');

    header.searchResult('movie-603').should('be.visible').click();

    cy.location('pathname').should('match', /^\/en-US\/movies\/603\/?$/);
    header.burgerButton().should('have.attr', 'aria-expanded', 'false');
  });
});
