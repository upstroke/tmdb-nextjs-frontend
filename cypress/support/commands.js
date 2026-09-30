// Custom Cypress commands for the TMDB Next.js frontend.
//
// Convention:
//   cy.visitLocale(locale, path)  — navigate to a locale-prefixed route
//   cy.acceptCookies()            — dismiss cookie banners if added later

/**
 * Navigate to a locale-prefixed route.
 *
 * @param {string} locale - e.g. 'en-US' or 'de-DE'
 * @param {string} [path='/'] - path after the locale segment
 */
Cypress.Commands.add('visitLocale', (locale, path = '/') => {
  cy.visit(`/${locale}${path}`);
});
