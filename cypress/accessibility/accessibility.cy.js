/**
 * Accessibility acceptance tests — WCAG 2.2 AA.
 *
 * Uses cypress-axe to run automated axe-core checks on central pages.
 * Document intentional exceptions explicitly; do not disable rules broadly.
 *
 * See accessibility-testplan.md for the full test plan.
 *
 * @tags @accessibility @a11y
 */
describe('Accessibility — Homepage', () => {
  const locale = 'en-US';

  it('has no axe violations on the homepage', () => {
    cy.visitLocale(locale);
    cy.checkPageA11y();
  });
});
