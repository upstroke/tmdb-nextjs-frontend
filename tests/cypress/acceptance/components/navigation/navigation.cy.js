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

  // -------------------------------------------------------------------------
  // NAV-01 — Homepage loads without errors
  // -------------------------------------------------------------------------
  it('[NAV-01] loads the homepage without errors', () => {
    home.assertMainExists();
  });

  // -------------------------------------------------------------------------
  // NAV-02 — Active locale is reflected in the URL
  // -------------------------------------------------------------------------
  it('[NAV-02] includes the locale in the URL', () => {
    home.assertLocaleInUrl();
  });

  // -------------------------------------------------------------------------
  // NAV-03 — Global header is visible
  // -------------------------------------------------------------------------
  it('[NAV-03] displays a visible header', () => {
    home.header.assertVisible();
  });

  // -------------------------------------------------------------------------
  // NAV-04 — Language switcher is present in the header
  // -------------------------------------------------------------------------
  it('[NAV-04] has a language switcher in the header', () => {
    home.header.assertLanguageSwitcherExists();
  });
});
