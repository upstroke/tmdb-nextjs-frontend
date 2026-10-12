/**
 * Accessibility acceptance tests for the main menu (HeaderMain) — WCAG 2.2 AA.
 *
 * Covers: navigation landmark, accessible names, current page, tab order,
 * keyboard activation, focus visibility and contrast, target size, and the
 * burger button on small viewports. Page-wide axe checks live in
 * ../accessibility.cy.js.
 *
 * See menu-testplan.md for the full test plan (ISTQB).
 *
 * @tags @accessibility @a11y @menu
 */
import 'cypress-real-events';
import { HeaderPage } from '../../POM/HeaderPage.js';

const header = HeaderPage();

const NAV_ITEMS = [
  { name: 'Home', id: '#nav-home', path: '' },
  { name: 'Movies', id: '#nav-movies', path: '/movies' },
  { name: 'TV shows', id: '#nav-tv', path: '/tv-shows' }
];

// Runs only the contrast rule so the current focus state is checked.
const CONTRAST_ONLY = { runOnly: { type: 'rule', values: ['color-contrast'] } };

/**
 * Moves the keyboard focus from the Cypress runner into the page under test.
 *
 * Special case of this test setup: the app runs in an iframe inside the Cypress
 * runner. After `cy.visit()` the browser focus is still in the runner UI, so a
 * real Tab press (`cy.realPress`) first reaches the runner's own controls and
 * `cy.focused()` finds nothing in the app. A real user starts in the page, so
 * a click on the top left corner of the page is the equivalent start state.
 * The click hits no focusable element and sets the starting point of the
 * sequential focus navigation, so the next Tab reaches the skip link.
 *
 * Use it only before a test that presses Tab without focusing an element first.
 *
 * @returns {void}
 */
function focusDocument() {
  cy.get('body').realClick({ position: 'topLeft' });
}

/**
 * Asserts that an element shows a visible focus indicator (outline or shadow).
 *
 * @param {JQuery<HTMLElement>} $el - Focused element.
 * @returns {void}
 */
function expectVisibleFocus($el) {
  const style = getComputedStyle($el[0]);
  const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  const hasShadow = style.boxShadow !== 'none';
  expect(hasOutline || hasShadow, 'visible focus indicator').to.equal(true);
}

describe('Accessibility - Menu', () => {
  const locale = 'en-US';

  describe('desktop', () => {
    beforeEach(() => {
      cy.viewport(1280, 800);
    });

    it('[A11Y-MENU-01] has a labelled navigation landmark', () => {
      cy.visitLocale(locale);
      cy.i18n(locale).then(({ labels }) => {
        header.navMenu().should('have.prop', 'tagName', 'NAV');
        header.navMenu().should('have.attr', 'aria-label', labels.mainNavigation);
      });
      cy.get('#menuHeader').should('have.prop', 'tagName', 'HEADER');
    });

    it('[A11Y-MENU-02] has no axe violations in the menu', () => {
      cy.visitLocale(locale);
      cy.checkPageA11y();
    });

    it('[A11Y-MENU-03] lists all links with an accessible name', () => {
      cy.visitLocale(locale);
      cy.get('#navmenu ul > li').should('have.length', NAV_ITEMS.length);
      NAV_ITEMS.forEach(({ id }) => {
        cy.get(`${id} a`).invoke('text').should('match', /\S/);
        cy.get(`${id} a i[aria-hidden="true"]`).should('exist');
      });
    });

    NAV_ITEMS.forEach(({ name, id, path }) => {
      it(`[A11Y-MENU-04] marks only the ${name} link as current page`, () => {
        cy.visitLocale(locale, path || undefined);
        cy.get(`${id} a`).should('have.attr', 'aria-current', 'page');
        cy.get('#navmenu [aria-current="page"]').should('have.length', 1);
      });
    });

    it('[A11Y-MENU-05] follows a logical tab order with visible focus', () => {
      cy.visitLocale(locale);
      focusDocument();
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'href', '#main-content');

      NAV_ITEMS.forEach(({ id }) => {
        cy.realPress('Tab');
        cy.focused().should('match', `${id} a`);
        cy.focused().then(expectVisibleFocus);
      });

      cy.realPress('Tab');
      cy.focused().should('have.id', 'typeahead-search-input');
      cy.realPress('Tab');
      cy.focused().should('have.id', 'language-select');
    });

    NAV_ITEMS.forEach(({ name, id }) => {
      it(`[A11Y-MENU-06] keeps text contrast while the ${name} link has focus`, () => {
        cy.visitLocale(locale);
        cy.get(`${id} a`).focus();
        cy.checkPageA11y(CONTRAST_ONLY);
      });
    });

    it('[A11Y-MENU-07] activates a link with Enter', () => {
      cy.visitLocale(locale);
      cy.get('#nav-movies a').focus();
      cy.realPress('Enter');
      cy.location('pathname').should('eq', `/${locale}/movies`);
      cy.get('#nav-movies a').should('have.attr', 'aria-current', 'page');
    });

    it('[A11Y-MENU-08] has a target size of at least 24 x 24 px (WCAG 2.5.8)', () => {
      cy.visitLocale(locale);
      cy.get('#navmenu a').each(($el) => {
        const { width, height } = $el[0].getBoundingClientRect();
        expect(width, 'width').to.be.at.least(24);
        expect(height, 'height').to.be.at.least(24);
      });
    });
  });

  describe('mobile', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('[A11Y-MENU-09] exposes the burger button with name and state', () => {
      cy.visitLocale(locale);
      cy.i18n(locale).then(({ labels }) => {
        cy.get('.burger-icon')
          .should('be.visible')
          .and('have.attr', 'aria-label', labels.navigationToggle)
          .and('have.attr', 'aria-controls', 'navmenu')
          .and('have.attr', 'aria-expanded', 'false');
      });
    });

    it('[A11Y-MENU-10] opens and closes the menu with the keyboard', () => {
      // HeaderMain toggles on click, so Enter and Space work. Guards against
      // a regression to onPointerDown (DEF-01), which keyboards cannot trigger.
      cy.visitLocale(locale);
      cy.get('.burger-icon').focus();

      cy.realPress('Enter');
      cy.get('.burger-icon').should('have.attr', 'aria-expanded', 'true');
      header.navMenu().should('be.visible');

      cy.realPress('Space');
      cy.get('.burger-icon').should('have.attr', 'aria-expanded', 'false');
    });

    it('[A11Y-MENU-11] has no axe violations with the open menu', () => {
      cy.visitLocale(locale);
      cy.get('.burger-icon').click();
      cy.get('.burger-icon').should('have.attr', 'aria-expanded', 'true');
      header.navMenu().should('be.visible');
      cy.checkPageA11y();
    });
  });
});
