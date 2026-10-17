import { HeaderPage } from '../../POM/HeaderPage.js';
import { PAGES } from '../support/accessibility-helpers.js';

const header = HeaderPage();

describe('Accessibility — locale', () => {
  const locale = 'en-US';

  PAGES.forEach(({ name, path }) => {
    it(`[A11Y-08] has no axe violations on the ${name} after switching to de-DE`, () => {
      cy.visitLocale(locale, path);

      // The switcher navigates to the same page in de-DE; the server renders
      // html[lang] for the new route.
      header.languageSelect().select('de-DE');

      cy.location('pathname').should('include', '/de-DE');
      header.languageSelect().should('have.value', 'de-DE');
      cy.get('html').should('have.attr', 'lang').and('match', /^de/i);
      cy.checkPageA11y();
    });
  });

  it('[A11Y-15] sets html lang after loading /de-DE directly', () => {
    // html[lang] is rendered by the server in app/[locale]/layout.js. The raw
    // server response is checked in A11Y-23 (html-lang.cy.js); this test checks
    // the loaded page.
    cy.visitLocale('de-DE');
    cy.get('html').should('have.attr', 'lang').and('match', /^de/i);
  });
});
