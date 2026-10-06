/**
 * Cypress TMDB Intercept Commands
 * Import this in cypress/support/e2e.js:
 *   import './tmdb.commands'
 */

/**
 * Visit a URL with a locale prefix.
 * @param {string} path - URL path, e.g. '/' or '/movie/123'
 * @param {string} [locale='en-US'] - BCP 47 locale tag
 */
Cypress.Commands.add('visitWithLocale', (path, locale = 'en-US') => {
  const url = `/${locale}${path}`;
  return cy.visit(url);
});

Cypress.Commands.add('interceptTmdb', (overrides = {}) => {
  cy.intercept('GET', '**/movie/popular*', {
    fixture: 'tmdb_movies_popular.json',
    ...overrides.moviesPopular
  }).as('moviesPopular');

  cy.intercept('GET', '**/movie/*', {
    fixture: 'tmdb_movie_detail.json',
    ...overrides.movieDetail
  }).as('movieDetail');

  cy.intercept('GET', '**/tv/popular*', {
    fixture: 'tmdb_tv_popular.json',
    ...overrides.tvPopular
  }).as('tvPopular');

  cy.intercept('GET', '**/tv/*/season/*', {
    fixture: 'tmdb_tv_season1.json',
    ...overrides.tvSeason1
  }).as('tvSeason1');

  cy.intercept('GET', '**/tv/*', {
    fixture: 'tmdb_tv_detail.json',
    ...overrides.tvDetail
  }).as('tvDetail');

  cy.intercept('GET', '**/search/multi*', {
    fixture: 'tmdb_search_multi.json',
    ...overrides.searchMulti
  }).as('searchMulti');

  cy.intercept('GET', '**/genre/movie/list*', {
    fixture: 'tmdb_genres_movie.json'
  }).as('genresMovie');

  cy.intercept('GET', '**/genre/tv/list*', {
    fixture: 'tmdb_genres_tv.json'
  }).as('genresTv');
});

/**
 * Simulate TMDB API error for a specific route
 * @param {string} urlPattern - e.g. a TMDB movie URL glob
 * @param {number} statusCode - e.g. 404, 500
 */
Cypress.Commands.add('interceptTmdbError', (urlPattern, statusCode = 500) => {
  cy.intercept('GET', urlPattern, {
    statusCode,
    fixture: 'tmdb_error_404.json'
  });
});
