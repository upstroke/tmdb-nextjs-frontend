/**
 * Accessibility acceptance tests — WCAG 2.2 AA.
 *
 * Uses cypress-axe to run automated axe-core checks on central pages.
 * Document intentional exceptions explicitly; do not disable rules broadly.
 *
 * Lists and detail pages load their data on the server, so cy.intercept()
 * cannot stub them. These specs run against the real TMDB API and need
 * TMDB_API_KEY on the server. Only the search request comes from the browser
 * and is stubbed.
 *
 * See accessibility-testplan.md for the full test plan.
 *
 * @tags @accessibility @a11y
 */
import { HeaderPage } from '../POM/HeaderPage.js';

const header = HeaderPage();

// Well known titles with stable TMDB ids.
const MOVIE_ID = 155; // The Dark Knight
const TV_SHOW_ID = 1396; // Breaking Bad

describe('Accessibility', () => {
  const locale = 'en-US';

  it('[A11Y-01] has no axe violations on the homepage', () => {
    cy.visitLocale(locale);
    cy.checkPageA11y();
  });

  it('[A11Y-02] has no axe violations on the movie list', () => {
    cy.visitLocale(locale, '/movies');
    cy.checkPageA11y();
  });

  it('[A11Y-03] has no axe violations on the TV show list', () => {
    cy.visitLocale(locale, '/tv-shows');
    cy.checkPageA11y();
  });

  it('[A11Y-04] has no axe violations on a movie detail page', () => {
    cy.visitLocale(locale, `/movies/${MOVIE_ID}`);
    cy.checkPageA11y();
  });

  it('[A11Y-05] has no axe violations on a TV show detail page with season tabs', () => {
    cy.visitLocale(locale, `/tv-shows/${TV_SHOW_ID}`);
    cy.checkPageA11y();
  });

  it('[A11Y-06] has no axe violations on the error message for an invalid id', () => {
    cy.visitLocale(locale, '/tv-shows/abc');
    cy.contains('Invalid URL parameters.').should('be.visible');
    cy.checkPageA11y();
  });

  it('[A11Y-07] has no axe violations with stubbed search results open', () => {
    const card = (id, mediaType, title) => ({
      id,
      mediaType,
      title,
      date: '2010-07-15',
      rating: 8.4,
      genres: [],
      imageUrl: '/not-available.png',
      posterUrl: '/not-available.png'
    });
    const movies = [card(27205, 'movie', 'Inception')];
    const tvShows = [card(1396, 'tv', 'Breaking Bad')];

    cy.intercept('GET', `**/api/${locale}/search*`, {
      body: { movies, tvShows, results: [...movies, ...tvShows], error: null }
    }).as('search');

    cy.visitLocale(locale);
    header.searchInput().type('Inception');
    cy.wait('@search');

    // The listbox is rendered after the response and hidden while closed.
    cy.get('#typeahead-search-results').should('be.visible');
    cy.get('#movie-27205').should('be.visible');
    cy.get('#tv-1396').should('be.visible');
    header.searchInput().should('have.attr', 'aria-expanded', 'true');

    cy.checkPageA11y();
  });
});
