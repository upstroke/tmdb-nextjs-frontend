// Custom Cypress commands for the TMDB Next.js frontend.
//
// Naming convention: cy.visitLocale(locale, path), cy.checkPageA11y(options?), cy.i18n(locale?)

/**
 * Navigate to a locale-prefixed route.
 *
 * Routes in this app are always prefixed with the active locale,
 * e.g. /en-US/movies. Use this command instead of cy.visit() to
 * avoid hardcoding locale strings in every spec.
 *
 * @param {string} locale - e.g. 'en-US' or 'de-DE'
 * @param {string} [path='/'] - path after the locale segment
 *
 * @example
 * cy.visitLocale('en-US', '/movies');
 */
Cypress.Commands.add('visitLocale', (locale, path = '/') => {
  cy.visit(`/${locale}${path}`);
});

/**
 * Run an axe accessibility check on the current page.
 *
 * Wraps injectAxe + checkA11y with project-wide WCAG 2.2 AA defaults.
 * Document intentional exceptions explicitly in the calling spec;
 * do not disable rules broadly.
 *
 * @param {import('cypress-axe').Options} [options]
 *
 * @example
 * cy.checkPageA11y();
 * cy.checkPageA11y({ rules: { 'color-contrast': { enabled: false } } });
 */
Cypress.Commands.add('checkPageA11y', (options = {}) => {
  cy.injectAxe();
  cy.checkA11y(
    null,
    {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      ...options,
    },
    null,
    true, // log violations to the Cypress command log
  );
});

/**
 * Load UI translations for a locale directly from lib/i18n/ui.json.
 *
 * Reads the live translation file instead of duplicating strings into
 * cypress/fixtures/, so acceptance tests always use the current translations.
 *
 * Falls back to the DEFAULT_LOCALE env variable (set in cypress.config.js
 * from NEXT_PUBLIC_DEFAULT_LOCALE) when no locale argument is provided.
 *
 * The returned object shape mirrors the locale entry in ui.json:
 * { languageCode, languageShortCode, fallbacks, labels, messages, formats, titles, buttons }
 *
 * @param {string} [locale] - BCP 47 locale tag, e.g. 'en-US' or 'de-DE'.
 *   Defaults to Cypress.env('DEFAULT_LOCALE').
 * @yields {object} The translation object for the requested locale.
 *
 * @example
 * // Default locale
 * cy.i18n().then((t) => {
 *   cy.contains(t.labels.searchInput).should('exist');
 * });
 *
 * // Specific locale
 * cy.i18n('de-DE').then((t) => {
 *   cy.visitLocale('de-DE', '/movies');
 *   cy.get('[placeholder]').should('have.attr', 'placeholder', t.labels.searchInput);
 * });
 */
Cypress.Commands.add('i18n', (locale) => {
  const resolvedLocale = locale ?? Cypress.env('DEFAULT_LOCALE') ?? 'en-US';

  return cy.readFile('lib/i18n/ui.json').then((ui) => {
    const translations = ui.locales[resolvedLocale];

    if (!translations) {
      throw new Error(
        `cy.i18n(): locale "${resolvedLocale}" not found in lib/i18n/ui.json. ` +
          `Available locales: ${Object.keys(ui.locales).join(', ')}`,
      );
    }

    return translations;
  });
});
