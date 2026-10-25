/**
 * Security tests for locale redirects and detail routes.
 * See security-testplan.md (SEC-20, SEC-21, SEC-22, SEC-24).
 * HTTP checks retain the full response-body stack-trace scan. Browser checks
 * separately establish native dialog visibility and dismissal.
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

  const rejectedIds = ['abc', '-1', '0', '1.5', '%00', '<script>'];
  const acceptedNumericInputs = ['1e3', '99999999999'];
  const sections = ['movies', 'tv-shows'];

  describe('detail route HTTP safety (SEC-22)', () => {
    sections.forEach((section) => {
      [...rejectedIds, ...acceptedNumericInputs].forEach((id) => {
        it(`/${section}/${id} returns no server error and no stack trace`, () => {
          cy.request({
            url: `/en-US/${section}/${encodeURIComponent(id)}`,
            failOnStatusCode: false
          }).then((res) => {
            expect(res.status, 'status').to.be.lessThan(500);
            const match = String(res.body).match(stackTrace);
            expect(match?.[0] ?? null, 'exposed stack trace match').to.equal(null);
          });
        });
      });
    });
  });

  describe('invalid URL dialog (SEC-24)', () => {
    sections.forEach((section) => {
      rejectedIds.forEach((id) => {
        it(`/${section}/${id} opens the invalid URL dialog and closes it with OK`, () => {
          cy.visit(`/en-US/${section}/${encodeURIComponent(id)}`);

          cy.get('dialog.dialog-message')
            .should('be.visible')
            .and('have.prop', 'open', true)
            .within(() => {
              cy.contains('p', /^Invalid URL parameters\.$/).should('be.visible');
              cy.contains('button', /^OK$/).click();
            });

          cy.get('dialog.dialog-message')
            .should('not.be.visible')
            .and('have.prop', 'open', false);
        });
      });
    });
  });
});
