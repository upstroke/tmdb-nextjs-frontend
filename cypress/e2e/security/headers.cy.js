/**
 * Security tests — response headers set in next.config.js.
 *
 * Next.js sends these headers for every path, also over plain HTTP, so they
 * can be checked on http://localhost:3000. HSTS is not tested: browsers
 * ignore it over HTTP.
 *
 * See security-testplan.md for the full test plan.
 *
 * @tags @security
 */
describe('Security: response headers', () => {
  const locale = 'en-US';
  const paths = [
    { name: 'homepage', url: `/${locale}` },
    { name: 'unknown page (404)', url: `/${locale}/this-page-does-not-exist` },
    { name: 'search API', url: `/api/${locale}/search` },
    { name: 'list API', url: `/api/${locale}/movies` }
  ];

  paths.forEach(({ name, url }) => {
    describe(name, () => {
      let headers;

      before(() => {
        cy.request({ url, failOnStatusCode: false }).then((res) => {
          headers = res.headers;
        });
      });

      it('disables content type sniffing', () => {
        expect(headers['x-content-type-options']).to.equal('nosniff');
      });

      it('blocks framing', () => {
        expect(headers['x-frame-options']).to.equal('DENY');
      });

      it('sends a restrictive Content-Security-Policy', () => {
        const csp = headers['content-security-policy'];
        expect(csp, 'CSP header').to.be.a('string');
        expect(csp).to.contain("default-src 'self'");
        expect(csp).to.contain("frame-ancestors 'none'");
        expect(csp, 'no wildcard source').to.not.match(/(^|[\s;])\*([\s;]|$)/);
      });
    });
  });
});
