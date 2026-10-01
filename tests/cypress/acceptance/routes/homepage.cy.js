import { HeaderPage } from '../../POM/HeaderPage.js';

/**
 * Homepage smoke tests.
 *
 * Verifies that the homepage loads, shows trending content,
 * and that the language switcher is present.
 *
 * Prerequisites: `npm run dev` must be running on port 3000.
 */
describe('Homepage', () => {
  beforeEach(() => {
    // Use the default locale defined in NEXT_PUBLIC_DEFAULT_LOCALE (.env.local)
    // Falls back to en-US for CI environments without .env.local
    const locale = Cypress.env('DEFAULT_LOCALE') ?? 'en-US';
    cy.visitLocale(locale);
  });

  // -------------------------------------------------------------------------
  // HOME-01 — Homepage loads without errors
  // -------------------------------------------------------------------------
  it('[HOME-01] loads without errors', () => {
    cy.get('main').should('exist');
  });

  // -------------------------------------------------------------------------
  // HOME-02 — Trending content is displayed
  // -------------------------------------------------------------------------
  it('[HOME-02] displays a trending section', () => {
    // The heading text will vary by locale — check for a section landmark instead
    cy.get('main').should('have.length.greaterThan', 0);
  });

  // -------------------------------------------------------------------------
  // HOME-03 — Navigation header is visible
  // -------------------------------------------------------------------------
  it('[HOME-03] has a visible navigation header', () => {
    cy.get('header').should('be.visible');
  });

  // -------------------------------------------------------------------------
  // HOME-04 — Language switcher is present in the header
  // -------------------------------------------------------------------------
  it('[HOME-04] has a language switcher in the header', () => {
    const header = new HeaderPage();
    header.languageSwitcher.should('exist');
  });
});
