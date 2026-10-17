import 'cypress-real-events';

describe('Accessibility — error dialog', () => {
  const locale = 'en-US';

  it('[A11Y-26] moves focus into the error dialog and closes it with Escape', () => {
    cy.visitLocale(locale, '/tv-shows/abc');

    cy.i18n(locale).then(({ messages }) => {
      cy.get('dialog.dialog-message')
        .should('be.visible')
        .and('contain', messages.invalidUrlParams);

      // A native modal dialog moves focus into itself when opened.
      cy.document().then((doc) => {
        const dialog = doc.querySelector('dialog.dialog-message');
        expect(dialog.contains(doc.activeElement), 'focus is inside the dialog').to.equal(true);
      });

      cy.realPress('Escape');

      cy.get('dialog.dialog-message').should('not.be.visible');
      cy.document().then((doc) => {
        const dialog = doc.querySelector('dialog.dialog-message');
        expect(dialog.contains(doc.activeElement), 'focus has left the dialog').to.equal(false);
      });
    });
  });
});
