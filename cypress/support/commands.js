// Custom Cypress commands for the TMDB Next.js frontend.
//
// Convention:
//   cy.visitLocale(locale, path)  — navigate to a locale-prefixed route
//   cy.i18n(locale)               — load i18n translations for a locale
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

/**
 * Load i18n translations for a given locale directly from lib/i18n/ui.json.
 *
 * @param {string} [locale='en-US'] - locale code, e.g. 'en-US' or 'de-DE'
 * @returns {Cypress.Chainable<object>} the locale object
 */
Cypress.Commands.add('i18n', (locale = 'en-US') => {
  return cy.readFile('lib/i18n/ui.json').then((ui) => ui.locales[locale]);
});
