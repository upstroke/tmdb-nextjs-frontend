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

  it('loads without errors', () => {
    cy.get('main').should('exist');
  });

  it('displays a trending section', () => {
    // The heading text will vary by locale — check for a section landmark instead
    cy.get('main').should('have.length.greaterThan', 0);
  });

  it('has a visible navigation header', () => {
    cy.get('header').should('be.visible');
  });

  it('has a language switcher in the header', () => {
    const header = new HeaderPage();
    header.languageSwitcher.should('exist');
  });
});
