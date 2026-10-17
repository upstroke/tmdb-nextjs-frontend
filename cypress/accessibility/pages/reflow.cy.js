import { TV_SHOW_ID } from '../support/accessibility-helpers.js';

describe('Accessibility — reflow', () => {
  const locale = 'en-US';

  [
    { name: 'homepage', path: '/' },
    { name: 'movie list', path: '/movies' },
    { name: 'TV show detail', path: `/tv-shows/${TV_SHOW_ID}` }
  ].forEach(({ name, path }) => {
    it(`[A11Y-14] reflows at 320 px without horizontal scrolling on the ${name}`, () => {
      cy.viewport(320, 640);
      cy.visitLocale(locale, path);

      cy.document().then((doc) => {
        const { scrollWidth, clientWidth } = doc.documentElement;
        expect(scrollWidth, 'document width').to.be.at.most(clientWidth);
      });
      cy.checkPageA11y();
    });
  });
});
