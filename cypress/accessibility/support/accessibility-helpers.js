import 'cypress-real-events';
import { HeaderPage } from '../../POM/HeaderPage.js';

export const MOVIE_ID = 155; // The Dark Knight
export const TV_SHOW_ID = 1396; // Breaking Bad

export const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'movie list', path: '/movies' },
  { name: 'TV show list', path: '/tv-shows' },
  { name: 'movie detail', path: `/movies/${MOVIE_ID}` },
  { name: 'TV show detail', path: `/tv-shows/${TV_SHOW_ID}` }
];

export const LISTS = [
  { name: 'movie list', path: '/movies' },
  { name: 'TV show list', path: '/tv-shows' }
];

export const NAV_ITEMS = [
  { name: 'Home', id: '#nav-home' },
  { name: 'Movies', id: '#nav-movies' },
  { name: 'TV shows', id: '#nav-tv' }
];

// Runs only the contrast rule so the current hover or focus state is checked.
export const CONTRAST_ONLY = { runOnly: { type: 'rule', values: ['color-contrast'] } };

/**
 * Builds a search result card in the shape of the search API response.
 *
 * @param {number} id - TMDB id.
 * @param {'movie'|'tv'} mediaType - Media type.
 * @param {string} title - Display title.
 * @returns {object} Card item.
 */
export function card(id, mediaType, title) {
  return {
    id,
    mediaType,
    title,
    date: '2010-07-15',
    rating: 8.4,
    genres: [],
    imageUrl: '/not-available.png',
    posterUrl: '/not-available.png'
  };
}

/**
 * Stubs the search request, opens the homepage and searches for a term.
 *
 * @param {string} locale - Locale of the route, e.g. 'en-US'.
 * @param {{ statusCode?: number, body: object }} response - Stubbed response.
 * @returns {void}
 */
export function searchWithStub(locale, response) {
  const header = HeaderPage();

  cy.intercept('GET', `**/api/${locale}/search*`, response).as('search');
  cy.visitLocale(locale);
  header.searchInput().type('Inception');
  cy.wait('@search');
}

/**
 * Asserts that an element shows a visible focus indicator (outline or shadow).
 *
 * @param {JQuery<HTMLElement>} $el - Focused element.
 * @returns {void}
 */
export function expectVisibleFocus($el) {
  const style = getComputedStyle($el[0]);
  const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  const hasShadow = style.boxShadow !== 'none';

  expect(hasOutline || hasShadow, 'visible focus indicator').to.equal(true);
}
