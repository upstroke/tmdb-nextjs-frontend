/**
 * Security tests — locale middleware and detail page routes.
 *
 * middleware.js redirects paths without a locale prefix to /<locale>/<path>
 * and picks the locale from the Accept-Language header. Manipulated paths
 * and headers must never redirect to another host or cause a server error.
 *
 * Requests use the full base URL, because a request to "//evil.com" would
 * otherwise be sent to evil.com.
 *
 * See security-testplan.md for the full test plan.
 *
 * @tags @security
 */
describe('Security: routing', () => {
  const baseUrl = () => Cypress.config('baseUrl').replace(/\/$/, '');
  const sameOrigin = (location) =>
    new URL(location, baseUrl()).origin === new URL(baseUrl()).origin;
  const stackTrace = /node_modules|\.next\/server|\bat .+\(.+:\d+:\d+\)/;

  describe('locale redirect', () => {
    const paths = ['//evil.com', '/%2F%2Fevil.com', '/%5Cevil.com', '/\\evil.com', '///evil.com/x'];

    paths.forEach((path) => {
      it(`does not redirect to another host: ${path}`, () => {
        cy.request({
          url: `${baseUrl()}${path}`,
          followRedirect: false,
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status, 'status').to.be.lessThan(500);
          if (res.status >= 300 && res.status < 400) {
            const location = res.headers.location;
            expect(sameOrigin(location), `redirect to ${location}`).to.equal(true);
          }
        });
      });
    });
  });

  describe('Accept-Language header', () => {
    const values = [
      'zz',
      '*',
      'en-US;q=0.9,de;q=0.8',
      '<script>alert(1)</script>',
      '%00',
      'x'.repeat(4000)
    ];

    values.forEach((value) => {
      it(`redirects to a locale without a server error: ${value.slice(0, 30)}`, () => {
        cy.request({
          url: `${baseUrl()}/`,
          headers: { 'Accept-Language': value },
          followRedirect: false,
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status, 'status').to.be.lessThan(500);
          if (res.status >= 300 && res.status < 400) {
            const target = new URL(res.headers.location, baseUrl());
            expect(target.origin, 'origin').to.equal(new URL(baseUrl()).origin);
            expect(target.pathname, 'locale prefix').to.match(/^\/[a-z]{2}-[A-Z]{2}(\/|$)/);
          }
        });
      });
    });
  });

  describe('detail pages with invalid ids', () => {
    const ids = ['abc', '-1', '0', '1.5', '1e3', '99999999999', '%00', '<script>'];
    const sections = ['movies', 'tv-shows'];

    sections.forEach((section) => {
      ids.forEach((id) => {
        it(`/${section}/${id} returns no server error and no stack trace`, () => {
          cy.request({
            url: `/en-US/${section}/${encodeURIComponent(id)}`,
            failOnStatusCode: false
          }).then((res) => {
            expect(res.status, 'status').to.be.lessThan(500);
            expect(String(res.body), 'stack trace').to.not.match(stackTrace);
          });
        });
      });
    });
  });
});
