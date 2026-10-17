import { MOVIE_ID, TV_SHOW_ID } from '../support/accessibility-helpers.js';

describe('Accessibility — page axe checks', () => {
  const locale = 'en-US';

  it('[A11Y-01] has no axe violations on the homepage', () => {
    cy.visitLocale(locale);
    cy.checkPageA11y();
  });

  it('[A11Y-02] has no axe violations on the movie list', () => {
    cy.visitLocale(locale, '/movies');
    cy.checkPageA11y();
  });

  it('[A11Y-03] has no axe violations on the TV show list', () => {
    cy.visitLocale(locale, '/tv-shows');
    cy.checkPageA11y();
  });

  it('[A11Y-04] has no axe violations on a movie detail page', () => {
    cy.visitLocale(locale, `/movies/${MOVIE_ID}`);
    cy.checkPageA11y();
  });

  it('[A11Y-05] has no axe violations on a TV show detail page with season tabs', () => {
    cy.visitLocale(locale, `/tv-shows/${TV_SHOW_ID}`);
    cy.checkPageA11y();
  });

  it('[A11Y-06] has no axe violations on the error message for an invalid id', () => {
    cy.visitLocale(locale, '/tv-shows/abc');

    cy.i18n(locale).then(({ messages }) => {
      cy.contains(messages.invalidUrlParams).should('be.visible');
    });
    cy.checkPageA11y();
  });
});
