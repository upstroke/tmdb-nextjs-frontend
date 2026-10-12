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
 * Keyboard handling of the typeahead (arrow keys, Enter, Escape, Home, End),
 * its loading state, and the status message for missing results are covered by
 * vitest/component/typeheadsearch/TypeHeadSearch.browser.test.jsx. A11Y-12 only
 * adds the axe check of the no-results state.
 *
 * Hover and focus contrast use cypress-real-events (real browser events through
 * the Chrome DevTools Protocol), because cy.trigger() cannot apply :hover.
 *
 * See accessibility-testplan.md for the full test plan.
 *
 * @tags @accessibility @a11y
 */
import 'cypress-real-events';
import { HeaderPage } from '../POM/HeaderPage.js';
// Relative path: Cypress does not resolve the "@/" alias from jsconfig.json.
import { formatMessage } from '../../lib/i18n/format.js';

const header = HeaderPage();

// Well known titles with stable TMDB ids.
const MOVIE_ID = 155; // The Dark Knight
const TV_SHOW_ID = 1396; // Breaking Bad

const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'movie list', path: '/movies' },
  { name: 'TV show list', path: '/tv-shows' },
  { name: 'movie detail', path: `/movies/${MOVIE_ID}` },
  { name: 'TV show detail', path: `/tv-shows/${TV_SHOW_ID}` }
];

const LISTS = [
  { name: 'movie list', path: '/movies' },
  { name: 'TV show list', path: '/tv-shows' }
];

const NAV_ITEMS = [
  { name: 'Home', id: '#nav-home' },
  { name: 'Movies', id: '#nav-movies' },
  { name: 'TV shows', id: '#nav-tv' }
];

// Runs only the contrast rule so the current hover or focus state is checked.
const CONTRAST_ONLY = { runOnly: { type: 'rule', values: ['color-contrast'] } };

/**
 * Builds a search result card in the shape of the search API response.
 *
 * @param {number} id - TMDB id.
 * @param {'movie'|'tv'} mediaType - Media type.
 * @param {string} title - Display title.
 * @returns {object} Card item.
 */
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

/**
 * Stubs the search request, opens the homepage and searches for a term.
 *
 * @param {string} locale - Locale of the route, e.g. 'en-US'.
 * @param {{ statusCode?: number, body: object }} response - Stubbed response.
 * @returns {void}
 */
function searchWithStub(locale, response) {
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
function expectVisibleFocus($el) {
  const style = getComputedStyle($el[0]);
  const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  const hasShadow = style.boxShadow !== 'none';
  expect(hasOutline || hasShadow, 'visible focus indicator').to.equal(true);
}

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

  PAGES.forEach(({ name, path }) => {
    it(`[A11Y-08] has no axe violations on the ${name} after switching to de-DE`, () => {
      cy.visitLocale(locale, path);

      // The switcher navigates to the same page in de-DE; LocaleSyncer then sets
      // html[lang] in an effect after hydration.
      header.languageSelect().select('de-DE');

      cy.location('pathname').should('include', '/de-DE');
      header.languageSelect().should('have.value', 'de-DE');
      cy.get('html').should('have.attr', 'lang').and('match', /^de/i);
      cy.checkPageA11y();
    });
  });

  PAGES.forEach(({ name, path }) => {
    it(`[A11Y-09] has landmarks and a logical heading order on the ${name}`, () => {
      cy.visitLocale(locale, path);
      // Best-practice rules are not part of the default WCAG tags.
      cy.checkPageA11y({
        runOnly: {
          type: 'rule',
          values: [
            'landmark-one-main',
            'landmark-unique',
            'page-has-heading-one',
            'heading-order',
            'region'
          ]
        }
      });
    });
  });

  it('[A11Y-10] shows a visible focus indicator on the first focusable element', () => {
    cy.visitLocale(locale);
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().closest('#menuHeader').should('exist');
    cy.focused().then(expectVisibleFocus);
  });

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

  it('[A11Y-12] has no axe violations when the search finds nothing', () => {
    searchWithStub(locale, { body: { movies: [], tvShows: [], results: [], error: null } });

    cy.i18n(locale).then(({ messages }) => {
      cy.get('#status-messages')
        .should('have.attr', 'role', 'status')
        .and('contain', messages.searchNoResults);
    });
    cy.checkPageA11y();
  });

  it('[A11Y-13] has no axe violations when the search request fails', () => {
    searchWithStub(locale, { statusCode: 500, body: { error: 'Search failed' } });

    cy.i18n(locale).then(({ messages }) => {
      cy.get('#status-messages')
        .should('have.attr', 'role', 'alert')
        .and('contain', messages.searchError);
    });
    cy.checkPageA11y();
  });

  [
    { name: 'homepage', path: '/' },
    { name: 'movie list', path: '/movies' },
    { name: 'TV show detail', path: `/tv-shows/${TV_SHOW_ID}` }
  ].forEach(({ name, path }) => {
    it(`[A11Y-14] reflows at 320 px without horizontal scrolling on the ${name}`, () => {
      cy.viewport(320, 640);
      cy.visitLocale(locale, path);
      cy.document().then((doc) => {
        const { scrollWidth, clientWidth } = doc.documentElement;
        expect(scrollWidth, 'document width').to.be.at.most(clientWidth);
      });
      cy.checkPageA11y();
    });
  });

  it('[A11Y-15] sets html lang after loading /de-DE directly', () => {
    // html[lang] is set on the client by LocaleSyncer. The server response is
    // not checked: it carries the default locale until hydration (accepted, see
    // the test plan).
    cy.visitLocale('de-DE');
    cy.get('html').should('have.attr', 'lang').and('match', /^de/i);
  });

  NAV_ITEMS.forEach(({ name, id }) => {
    it(`[A11Y-16] keeps text contrast while hovering the ${name} link`, () => {
      cy.visitLocale(locale);
      cy.get(`${id} a`).realHover();
      cy.checkPageA11y(CONTRAST_ONLY);
    });
  });

  it('[A11Y-17] keeps text contrast while hovering a search result', () => {
    const movies = [card(27205, 'movie', 'Inception')];

    searchWithStub(locale, {
      body: { movies, tvShows: [], results: movies, error: null }
    });

    cy.get('#movie-27205').should('be.visible').realHover();
    cy.checkPageA11y(CONTRAST_ONLY);
  });

  it('[A11Y-18] keeps text contrast on the focused element', () => {
    cy.visitLocale(locale);
    cy.realPress('Tab');
    cy.focused().closest('#menuHeader').should('exist');
    cy.checkPageA11y(CONTRAST_ONLY);
  });

  LISTS.forEach(({ name, path }) => {
    it(`[A11Y-19] keeps text contrast while hovering a card on the ${name}`, () => {
      cy.visitLocale(locale, path);
      cy.get('a.default-card').first().should('be.visible').realHover();
      cy.checkPageA11y(CONTRAST_ONLY);
    });
  });

  it('[A11Y-20] keeps text contrast while hovering the load more button', () => {
    cy.visitLocale(locale, '/movies');
    cy.get('.load-more button').should('be.visible').and('not.be.disabled').realHover();
    cy.checkPageA11y(CONTRAST_ONLY);
  });

  ['en-US', 'de-DE'].forEach((testLocale) => {
    it(`[A11Y-21] uses the localized poster alt text on the ${testLocale} movie list`, () => {
      cy.visitLocale(testLocale, '/movies');

      cy.i18n(testLocale).then(({ messages }) => {
        const prefix = formatMessage(messages.posterAlt, { title: '' }).trim();
        cy.get('a.default-card img').first().should('have.attr', 'alt').and('include', prefix);
      });
    });
  });
});
