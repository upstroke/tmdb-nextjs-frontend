/**
 * Security tests — paginated list API routes used by PagedList.
 *
 * Routes: /api/<locale>/movies, /api/<locale>/trending, /api/<locale>/tv-shows
 *
 * Current behavior of the routes:
 * - Invalid locale (length not 2 to 10) -> 400.
 * - Invalid page or type -> falls back to page 1 (200).
 * - TMDB error (for example page > 500) -> 500 with a JSON error body.
 *
 * Goal: manipulated input must never produce a 5xx. The page limit tests
 * are expected to fail until ListQuerySchema limits `page` (TMDB allows 500).
 *
 * Requests reach the real TMDB API (server-side) and need TMDB_API_KEY.
 *
 * See security-testplan.md for the full test plan.
 *
 * @tags @security
 */
describe('Security: list API routes', () => {
  const locale = 'en-US';
  const routes = ['movies', 'trending', 'tv-shows'];

  const get = (route, qs = {}, loc = locale, options = {}) =>
    cy.request({ url: `/api/${loc}/${route}`, qs, failOnStatusCode: false, ...options });

  routes.forEach((route) => {
    describe(`/api/<locale>/${route}`, () => {
      it('returns cards for a valid request', () => {
        get(route, { page: 1 }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.cards).to.be.an('array');
          expect(res.body.error).to.equal(null);
        });
      });

      [undefined, 'abc', '0', '-1', '1.5', '', '%00', '1e3x', '<script>'].forEach((page) => {
        it(`falls back to page 1 for an invalid page: ${JSON.stringify(page)}`, () => {
          get(route, page === undefined ? {} : { page }).then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body.page).to.equal(1);
          });
        });
      });

      it('falls back to page 1 for an unknown type', () => {
        get(route, { page: 2, type: 'bogus' }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.page).to.equal(1);
        });
      });

      ['501', '10000', '999999999', '99999999999999999999'].forEach((page) => {
        it(`does not return a server error for a page above the TMDB limit: ${page}`, () => {
          get(route, { page }).then((res) => {
            expect(res.status, 'status').to.be.lessThan(500);
          });
        });
      });

      it('ignores additional query parameters', () => {
        get(route, { page: 1, api_key: 'x', language: 'de', include_adult: true }).then((res) => {
          expect(res.status).to.equal(200);
          expect(JSON.stringify(res.body)).to.not.match(/api_key/i);
        });
      });

      it('rejects a locale longer than 10 characters with 400', () => {
        get(route, { page: 1 }, 'a'.repeat(11)).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.cards).to.have.length(0);
        });
      });

      ['x', 'xx-YY', '%3Cscript%3E', 'en-US%0d%0aX-Test:1'].forEach((loc) => {
        it(`handles a manipulated locale without a server error: "${loc}"`, () => {
          get(route, { page: 1 }, loc).then((res) => {
            expect(res.status, 'status').to.be.lessThan(500);
          });
        });
      });

      ['POST', 'PUT', 'DELETE', 'PATCH'].forEach((method) => {
        it(`does not accept ${method}`, () => {
          get(route, { page: 1 }, locale, { method }).then((res) => {
            expect(res.status).to.be.oneOf([404, 405]);
          });
        });
      });
    });
  });
});
