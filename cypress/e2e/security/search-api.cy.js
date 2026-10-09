/**
 * Security tests — search API route and manipulated URLs.
 *
 * Goal: manipulated input must never produce a 5xx or crash the server.
 * A 400 or an empty result is an accepted answer.
 *
 * Requests with a query of 4 or more valid characters reach the real TMDB API
 * (server-side, cannot be intercepted) and need TMDB_API_KEY on the server.
 *
 * See security-testplan.md for the full test plan.
 *
 * @tags @security
 */
describe('Security: search API', () => {
  const locale = Cypress.env('DEFAULT_LOCALE') ?? 'en-US';
  const search = (loc, qs, options = {}) =>
    cy.request({ url: `/api/${loc}/search`, qs, failOnStatusCode: false, ...options });

  const expectNoServerError = (res) => {
    expect(res.status, 'status').to.be.lessThan(500);
  };

  it('returns an empty result for a missing query', () => {
    search(locale, {}).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.results).to.have.length(0);
    });
  });

  ['a', 'ab', 'abc', '   ', '<>'].forEach((q) => {
    it(`returns an empty result for a too short query: "${q}"`, () => {
      search(locale, { q }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.results).to.have.length(0);
      });
    });
  });

  it('returns an empty result for a query longer than 200 characters', () => {
    search(locale, { q: 'a'.repeat(201) }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.results).to.have.length(0);
    });
  });

  it('does not fail for a very long query (5000 characters)', () => {
    search(locale, { q: 'a'.repeat(5000) }).then(expectNoServerError);
  });

  it('does not fail for an extreme query (20000 characters)', () => {
    search(locale, { q: 'a'.repeat(20000) }).then(expectNoServerError);
  });

  [
    '<script>window.__xss=1</script>',
    "' OR '1'='1' --",
    '../../etc/passwd',
    '%00%00%00%00',
    '{{7*7}} ${7*7}',
    '🎬🎬🎬🎬',
    'a&page=999999&include_adult=true'
  ].forEach((q) => {
    it(`handles a special query without a server error: ${q.slice(0, 30)}`, () => {
      search(locale, { q }).then((res) => {
        expectNoServerError(res);
        if (res.status === 200) {
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.be.an('array');
        }
      });
    });
  });

  ['', 'x', 'xx-YY', 'zz', '%3Cscript%3E', 'en-US%0d%0aX-Test:1'].forEach((loc) => {
    it(`handles a manipulated locale without a server error: "${loc}"`, () => {
      search(loc, { q: 'test' }).then(expectNoServerError);
    });
  });

  it('rejects a locale longer than 10 characters with 400', () => {
    search('a'.repeat(11), { q: 'test' }).then((res) => {
      expect(res.status).to.equal(400);
    });
  });

  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach((method) => {
    it(`does not accept ${method} on the search route`, () => {
      search(locale, { q: 'test' }, { method }).then((res) => {
        expect(res.status).to.be.oneOf([404, 405]);
      });
    });
  });

  it('answers a burst of 50 invalid requests without a server error', () => {
    Cypress._.times(50, (i) => {
      search(locale, { q: `x${i}` }).then(expectNoServerError);
    });
  });

  it('does not expose the API key in the response', () => {
    search(locale, { q: 'test' }).then((res) => {
      expect(JSON.stringify(res.body)).to.not.match(/api_key|TMDB_API_KEY/i);
      expect(JSON.stringify(res.headers)).to.not.match(/api_key|TMDB_API_KEY/i);
    });
  });

  ['abc', '-1', '0', '1.5', '%3Cscript%3E'].forEach((id) => {
    ['movies', 'tv-shows'].forEach((section) => {
      it(`handles an invalid id without a server error: /${section}/${id}`, () => {
        cy.request({ url: `/${locale}/${section}/${id}`, failOnStatusCode: false }).then(
          expectNoServerError
        );
      });
    });
  });

  it('does not expose the API key in the homepage HTML', () => {
    cy.request(`/${locale}`).then((res) => {
      expect(res.body).to.not.match(/api_key=|TMDB_API_KEY/i);
    });
  });
});
