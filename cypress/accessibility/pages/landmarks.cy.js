import { PAGES } from '../support/accessibility-helpers.js';

describe('Accessibility — landmarks and headings', () => {
  const locale = 'en-US';

  PAGES.forEach(({ name, path }) => {
    it(`[A11Y-09] has landmarks and a logical heading order on the ${name}`, () => {
      cy.visitLocale(locale, path);

      // Best-practice rules are not part of the default WCAG tags.
      cy.checkPageA11y({
        runOnly: {
          type: 'rule',
          values: [
            'landmark-one-main',
            'landmark-unique',
            'page-has-heading-one',
            'heading-order',
            'region'
          ]
        }
      });
    });
  });
});
