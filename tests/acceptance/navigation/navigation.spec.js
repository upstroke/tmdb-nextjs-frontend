/**
 * Navigation acceptance tests.
 *
 * Covers the core navigation user journey:
 * visiting the homepage, verifying the header, and
 * confirming that locale-prefixed routing is active.
 *
 * See navigation-testplan.md for the full test plan.
 */
describe('Navigation', () => {
  const locale = Cypress.env('DEFAULT_LOCALE') ?? 'en-US';

  beforeEach(() => {
    cy.visitLocale(locale);
  });

  it('loads the homepage without errors', () => {
    cy.get('main').should('exist');
  });

  it('includes the locale in the URL', () => {
    cy.url().should('include', `/${locale}`);
  });

  it('displays a visible header', () => {
    cy.get('header').should('be.visible');
  });

  it('has a language switcher in the header', () => {
    cy.get('header')
      .find(
        '[data-testid="language-switcher"], [aria-label*="language" i], [aria-label*="sprache" i]',
      )
      .should('exist');
  });
});
