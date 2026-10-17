import { HeaderPage } from '../../POM/HeaderPage.js';

describe('Accessibility — language switch focus', () => {
  const locale = 'en-US';
  const header = HeaderPage();

  it('[A11Y-28] keeps focus on the language select after switching to de-DE', () => {
    cy.visitLocale(locale);

    header.languageSelect().focus().should('be.focused').select('de-DE');

    cy.location('pathname').should('include', '/de-DE');
    cy.get('html').should('have.attr', 'lang').and('match', /^de/i);
    header.languageSelect().should('have.value', 'de-DE').and('be.focused');
  });
});
