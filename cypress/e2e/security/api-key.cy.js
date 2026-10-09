/**
 * Security tests — TMDB API key must stay on the server.
 *
 * The key is only added in lib/services/tmdb-api.js, which runs in the search
 * route and in server components. These tests check what the browser sees:
 * its network traffic, the page HTML, and the loaded JavaScript bundles.
 *
 * The name TMDB_API_KEY alone is allowed in bundles: it appears in the
 * apiKeyMissing i18n messages ("TMDB_API_KEY is missing"). A leak means the
 * query parameter `api_key=` or the key value itself.
 *
 * Optional: set CYPRESS_TMDB_API_KEY to also search for the exact key value.
 * The value is read with cy.env() because allowCypressEnv is false.
 *
 * See security-testplan.md for the full test plan.
 *
 * @tags @security
 */
describe('Security: API key exposure', () => {
  const locale = 'en-US';
  const keyPattern = /api_key/i;
  const leakPattern = /api_key=/i;

  /** Fails if the text matches the pattern or, when known, contains the key value. */
  function expectNoKey(text, where, keyValue, pattern = keyPattern) {
    expect(text, `${where}: key parameter`).to.not.match(pattern);
    if (keyValue) {
      expect(text.includes(keyValue), `${where}: key value`).to.equal(false);
    }
  }

  it('sends no browser request with the key or directly to TMDB', () => {
    const urls = [];
    cy.intercept('**', (req) => {
      urls.push(req.url);
    });

    cy.visitLocale(locale);
    cy.get('#typeahead-search-input').type('inception', { delay: 0 });
    cy.get('#typeahead-search-results', { timeout: 15000 }).should('exist');

    cy.env(['TMDB_API_KEY']).then(({ TMDB_API_KEY: keyValue }) => {
      expect(urls.length, 'recorded requests').to.be.greaterThan(0);
      urls.forEach((url) => {
        expect(url, url).to.not.match(keyPattern);
        expect(url, url).to.not.match(/themoviedb\.org/);
        if (keyValue) expect(url.includes(keyValue), url).to.equal(false);
      });
    });
  });

  it('does not contain the key in the homepage HTML', () => {
    cy.request(`/${locale}`).then((res) => {
      cy.env(['TMDB_API_KEY']).then(({ TMDB_API_KEY: keyValue }) => {
        expectNoKey(res.body, 'homepage HTML', keyValue, leakPattern);
      });
    });
  });

  it('does not contain the key in the loaded JavaScript bundles', () => {
    cy.request(`/${locale}`).then((res) => {
      const scripts = [
        ...new Set(res.body.match(/\/_next\/static\/[^"'\s\\]+\.js/g) ?? [])
      ];
      expect(scripts.length, 'script files found').to.be.greaterThan(0);

      cy.env(['TMDB_API_KEY']).then(({ TMDB_API_KEY: keyValue }) => {
        cy.wrap(scripts).each((path) => {
          cy.request(path).then((script) => {
            expectNoKey(String(script.body), path, keyValue, leakPattern);
          });
        });
      });
    });
  });

  it('does not contain the key in search API response headers or body', () => {
    cy.request({
      url: `/api/${locale}/search`,
      qs: { q: 'inception' },
      failOnStatusCode: false
    }).then((res) => {
      cy.env(['TMDB_API_KEY']).then(({ TMDB_API_KEY: keyValue }) => {
        expectNoKey(JSON.stringify(res.body), 'search body', keyValue);
        expectNoKey(JSON.stringify(res.headers), 'search headers', keyValue);
      });
    });
  });
});
