/**
 * Navigation acceptance tests.
 * Covers the core navigation user journey:
 * visiting the homepage, verifying the header, and
 * confirming that locale-prefixed routing is active.
 * Uses the Page Object Model (POM) — see docs/testing/page-objects.md.
 * See navigation-testplan.md for the full test plan.
 */
import { HomePage } from '../../../POM/HomePage.js';

describe('Navigation', () => {
  const locale = Cypress.env('DEFAULT_LOCALE') ?? 'en-US';
  let home;

  beforeEach(() => {
    home = new HomePage(locale);
    home.visit();
  });

  it('loads the homepage without errors', () => {
    home.assertMainExists();
  });

  it('includes the locale in the URL', () => {
    home.assertLocaleInUrl();
  });

  it('displays a visible header', () => {
    home.header.assertVisible();
  });

  it('has a language switcher in the header', () => {
    home.header.assertLanguageSwitcherExists();
  });
});
