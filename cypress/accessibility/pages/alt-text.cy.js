import { formatMessage } from '../../../lib/i18n/format.js';

describe('Accessibility — localized alternative text', () => {
  ['en-US', 'de-DE'].forEach((testLocale) => {
    it(`[A11Y-21] uses the localized poster alt text on the ${testLocale} movie list`, () => {
      cy.visitLocale(testLocale, '/movies');

      cy.i18n(testLocale).then(({ messages }) => {
        const prefix = formatMessage(messages.posterAlt, { title: '' }).trim();
        cy.get('a.default-card img').first().should('have.attr', 'alt').and('include', prefix);
      });
    });
  });
});
