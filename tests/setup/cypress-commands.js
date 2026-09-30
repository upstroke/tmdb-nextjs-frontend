// Custom Cypress commands for the TMDB Next.js frontend.
//
// Naming convention: cy.visitLocale(locale, path)

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
