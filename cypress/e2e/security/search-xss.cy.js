/**
 * Security tests — search UI.
 *
 * The browser request to /api/<locale>/search is stubbed, so the tests do not
 * call TMDB. Payloads set window.__xss; the tests assert that it stays undefined.
 *
 * See security-testplan.md for the full test plan.
 *
 * @tags @security
 */
describe('Security: search UI', () => {
  const locale = 'en-US';
  const input = '#typeahead-search-input';

  const xssPayloads = [
    '<script>window.__xss=1</script>',
    '<img src=x onerror="window.__xss=1">',
    '<svg onload="window.__xss=1"></svg>',
    '"><img src=x onerror="window.__xss=1">'
  ];

  /** Builds a stub response in the normalized shape of the search route. */
  function stubResponse(title) {
    const item = {
      id: 1,
      mediaType: 'movie',
      title,
      date: '2010-07-15',
      rating: 8.3,
      genres: [{ id: 28, name: 'Action' }],
      imageUrl: 'javascript:window.__xss=1',
      posterUrl: 'javascript:window.__xss=1'
    };
    return { movies: [item], tvShows: [], results: [item], error: null };
  }

  function assertNoXss() {
    cy.window().then((win) => {
      expect(win.__xss, 'window.__xss').to.equal(undefined);
    });
  }

  beforeEach(() => {
    cy.visitLocale(locale);
  });

  xssPayloads.forEach((payload) => {
    it(`does not execute the typed payload: ${payload}`, () => {
      cy.intercept('GET', '**/api/*/search*', stubResponse('Safe title')).as('search');

      cy.get(input).type(payload, { delay: 0 });
      cy.wait('@search').then(({ request }) => {
        expect(request.url, 'query is URL-encoded').to.not.include('<');
      });

      assertNoXss();
      cy.get('#typeahead-search-results img[src="x"]').should('not.exist');
      cy.get('#typeahead-search-results script').should('not.exist');
    });
  });

  xssPayloads.forEach((payload) => {
    it(`renders a malicious result title as text: ${payload}`, () => {
      cy.intercept('GET', '**/api/*/search*', stubResponse(payload)).as('search');

      cy.get(input).type('test', { delay: 0 });
      cy.wait('@search');

      cy.get('#typeahead-search-results h3.title').should('be.visible').and('contain.text', '<');
      cy.get('#typeahead-search-results h3.title').find('img, script, svg').should('not.exist');
      assertNoXss();
    });
  });

  it('shows an error message when the API answers with 500', () => {
    cy.intercept('GET', '**/api/*/search*', {
      statusCode: 500,
      body: { movies: [], tvShows: [], results: [], error: 'Search failed.' }
    }).as('search');

    cy.get(input).type('test', { delay: 0 });
    cy.wait('@search');

    cy.get('#status-messages').should('have.attr', 'role', 'alert');
    cy.get(input).should('be.visible');
  });

  it('survives an API response with an unexpected shape', () => {
    cy.intercept('GET', '**/api/*/search*', { body: { unexpected: true } }).as('search');

    cy.get(input).type('test', { delay: 0 });
    cy.wait('@search');

    cy.get(input).should('be.visible');
  });

  [
    ['null', 'null'],
    ['a string instead of an array', '"abc"']
  ].forEach(([label, value]) => {
    // Same-origin only (self-XSS level), but the header should not crash.
    it(`survives manipulated sessionStorage (${label})`, () => {
      cy.on('uncaught:exception', () => false);
      cy.visit(`/${locale}`, {
        onBeforeLoad(win) {
          win.sessionStorage.setItem('search-movies', value);
          win.sessionStorage.setItem('search-tv', value);
          win.sessionStorage.setItem('search-query', '"test"');
        }
      });

      cy.get(input).should('be.visible');
    });
  });
});
