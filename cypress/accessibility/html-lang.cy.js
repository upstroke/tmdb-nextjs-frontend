// cypress/accessibility/html-lang.cy.js
// A11Y-23: html[lang] in the raw server response (WCAG 3.1.1).
// cy.request reads the response without running JavaScript, so a language set
// by the client after hydration would not pass.

const LOCALES = ['en-US', 'de-DE'];

describe('Accessibility: html lang in the server response', () => {
  LOCALES.forEach((locale) => {
    it(`[A11Y-23] renders lang="${locale}" on the server for /${locale}`, () => {
      cy.request(`/${locale}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.match(new RegExp(`<html[^>]*\\slang="${locale}"`, 'i'));
      });
    });
  });
});
