---
name: tmdb-accessibility
description: Write and maintain accessibility tests (axe, keyboard, focus, ARIA, contrast, dialogs) for the TMDB Next.js frontend to meet WCAG 2.2 AA.
version: 0.1.2
---

# TMDB Accessibility Skill

## Purpose

This skill enables the AI agent to write and maintain accessibility tests for the TMDB Next.js frontend. It ensures the application is usable by people with disabilities and complies with WCAG 2.2 AA.

## Scope

- Automated accessibility testing (`cypress-axe`, axe-core)
- Keyboard navigation and focus management
- ARIA attributes and semantics
- Color contrast checks
- Dialogs (`showModal`, focus, closing)

## Capabilities

### 1. Write Accessibility Tests (axe-core)

Accessibility specs live in `cypress/accessibility/`. The test plan is `cypress/accessibility/accessibility-testplan.md`. Use the custom commands from `cypress/support/`:

- `cy.visitLocale(locale, path)` navigates to a locale-prefixed route.
- `cy.checkPageA11y()` injects axe and checks the tags `wcag2a`, `wcag2aa`, `wcag21aa`, and `wcag22aa`.

Use the constant `en-US` as locale, the same as `DEFAULT_LOCALE` in `lib/i18n/config.js`. Do not use `Cypress.env()`: `allowCypressEnv` is `false`.

```js
// cypress/accessibility/accessibility.cy.js
describe('Accessibility — Homepage', () => {
  const locale = 'en-US';

  it('has no axe violations on the homepage', () => {
    cy.visitLocale(locale);
    cy.checkPageA11y();
  });
});
```

Document intentional exceptions explicitly. Do not disable rules broadly.

### 2. Test Keyboard Navigation and Focus

Keyboard, focus, and ARIA behavior is not tested in jsdom. Choose the test level by scope:

- **Vitest browser mode** (`vitest/component/`): keyboard, focus, and ARIA states of a single component, for example arrow-key navigation in the typeahead search. Use `@testing-library/user-event` for real key presses, and dispatch key events on the element that owns the handler.
- **Cypress** (`cypress/accessibility/`, `cypress/e2e/`): behavior that spans pages or needs the full app, such as tabs, dropdowns, and dialogs in a real page.

In Cypress, use `cy.realPress` or `cy.tab` only after the matching plugin is added to `package.json`; today neither `cypress-real-events` nor a tab plugin is installed. Without them, use `cy.get(...).focus()`, `.type('{enter}')`, `.type('{esc}')`, and `cy.focused()`.

```js
it('opens a result with Enter', () => {
  cy.visitLocale(locale);
  cy.findByRole('searchbox').type('Inception');
  cy.findAllByRole('option').first().focus().type('{enter}');
});
```

Check dialogs in Cypress: the dialog must be open and visible, focus must move into it, and it must close as expected. Vitest tests cannot check this, because jsdom has no `showModal`.

When you change an accessibility test, also update its test plan (`cypress/accessibility/accessibility-testplan.md` or the `*-testplan.md` next to the Vitest component test). See the `tmdb-testing` skill, section "Keep Tests, Test Plans and Docs in Sync".

### 3. Test Semantics and Labels

```js
it('has accessible labels', () => {
  cy.visitLocale(locale);
  cy.findByRole('searchbox').should('exist');
});
```

Use expected texts from `cy.i18n(locale)`, which reads `lib/i18n/ui.json`, instead of hard-coded strings.

### 4. Test Color Contrast

```js
it('meets WCAG AA contrast requirements', () => {
  cy.visitLocale(locale);
  cy.checkPageA11y({ runOnly: { type: 'rule', values: ['color-contrast'] } });
});
```

## Accessibility Checklist

### Development

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Errors are announced to screen readers
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast (4.5:1 for normal text)
- [ ] Headings are in logical order
- [ ] Links have descriptive text
- [ ] Dynamic content updates are announced

### Testing

- [ ] Run `cy.checkPageA11y()` on every page and after relevant interactions
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Test zoom up to 200%
- [ ] Test in high contrast mode

## Scripts

Use `npm run test:e2e` (headless) or `npm run test:e2e:open` (interactive) for Cypress. Use `npm run test:component` for Vitest browser mode component tests. The app must run on `http://localhost:3000` for Cypress. There is no separate accessibility script yet.

## Tools

- **cypress-axe / axe-core**: Automated accessibility testing
- **@testing-library/cypress**: Semantic queries (`findByRole`, `findByLabelText`)
- **@testing-library/user-event**: Real key presses in Vitest browser mode component tests

## Documentation

- **Accessibility Checklist**: [`docs/testing/accessibility-audit-checklist.md`](../../../docs/testing/accessibility-audit-checklist.md)
- **Accessibility Test Plan**: [`cypress/accessibility/accessibility-testplan.md`](../../../cypress/accessibility/accessibility-testplan.md)
- **Testing Strategy**: [`docs/testing.md`](../../../docs/testing.md)

## When to Use

Use this skill when:

- Adding new components
- Creating new pages
- Modifying existing UI
- Fixing accessibility bugs
- Preparing for accessibility audit
