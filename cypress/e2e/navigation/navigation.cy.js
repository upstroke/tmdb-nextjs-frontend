import { BasePage } from '../../POM/BasePage.js';
import { HeaderPage } from '../../POM/HeaderPage.js';
import { ListPage } from '../../POM/ListPage.js';

const base = BasePage();
const header = HeaderPage();
const list = ListPage();

const MATRIX_SEARCH_RESPONSE = {
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
};

/**
 * Stub the search request of the browser with one movie result.
 * The detail page loads on the server and is not stubbed (see R-01 in the test plan).
 */
const stubSearch = () => {
  cy.intercept({ method: 'GET', pathname: '/api/en-US/search' }, { body: MATRIX_SEARCH_RESPONSE }).as(
    'search'
  );
};

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

  it('[NAV-08] keeps the route when the language changes and after a reload', () => {
    cy.viewport(1280, 800);
    list.visit('/en-US/movies');

    header.languageSelect().select('de-DE');
    cy.location('pathname').should('match', /^\/de-DE\/movies\/?$/);
    header.languageSelect().should('have.value', 'de-DE');

    cy.reload();
    cy.location('pathname').should('match', /^\/de-DE\/movies\/?$/);
    header.languageSelect().should('have.value', 'de-DE');
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

  it('[NAV-10] desktop: opens the detail page with a click on a search result', () => {
    stubSearch();
    cy.viewport(1280, 800);
    base.visit('en-US');

    header.searchInput().type('matrix');
    cy.wait('@search');

    header.searchResult('movie-603').should('be.visible').click();

    cy.location('pathname').should('match', /^\/en-US\/movies\/603\/?$/);
  });

  it('[NAV-11] opens the detail page with ArrowDown and Enter in the search', () => {
    stubSearch();
    cy.viewport(1280, 800);
    base.visit('en-US');

    header.searchInput().type('matrix');
    cy.wait('@search');
    header.searchResult('movie-603').should('be.visible');

    header.searchInput().type('{downArrow}');
    header.searchResult('movie-603').should('have.attr', 'aria-selected', 'true');

    header.searchInput().type('{enter}');

    cy.location('pathname').should('match', /^\/en-US\/movies\/603\/?$/);
  });

  it('[NAV-12] keeps the loaded cards when the user returns from a detail page', () => {
    // Page 1 comes from the server. Only the request for page 2 is stubbed.
    cy.intercept(
      { method: 'GET', pathname: '/api/en-US/movies', query: { page: '2' } },
      {
        body: {
          cards: [
            {
              id: 900001,
              mediaType: 'movie',
              title: 'Stub Movie One',
              date: '2020-01-01',
              rating: 7.1,
              posterUrl: null
            },
            {
              id: 900002,
              mediaType: 'movie',
              title: 'Stub Movie Two',
              date: '2021-02-02',
              rating: 6.5,
              posterUrl: null
            }
          ],
          page: 2,
          hasMore: false
        }
      }
    ).as('page2');

    cy.viewport(1280, 800);
    list.visit('/en-US/movies');

    list.cards().its('length').then((initialCount) => {
      list.loadMoreButton().click();
      cy.wait('@page2');
      list.cards().should('have.length', initialCount + 2);

      list.cardLink('/en-US/movies/900001').click();
      cy.location('pathname').should('match', /^\/en-US\/movies\/900001\/?$/);

      cy.go('back');
      cy.location('pathname').should('match', /^\/en-US\/movies\/?$/);
      list.cards().should('have.length', initialCount + 2);
      list.cardLink('/en-US/movies/900001').should('exist');
    });
  });

  it('[NAV-14] mobile: searches from the open menu, opens a result, and closes the menu', () => {
    stubSearch();
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
