---
name: tmdb-accessibility
description: Write and maintain accessibility tests (axe, keyboard, focus, ARIA, contrast, dialogs) for the TMDB Next.js frontend to meet WCAG 2.2 AA. Use when adding or changing UI, keyboard navigation, focus handling, ARIA, or accessibility tests.
metadata:
  version: '0.1.3'
---

# TMDB Accessibility Skill

## Purpose

This skill enables the AI agent to write and maintain accessibility tests for the TMDB Next.js frontend. It supports the project's WCAG 2.2 AA goal. Passing automated checks alone does not establish full WCAG conformance; manual audits remain necessary.

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
// Schematic homepage check; reuse the existing spec and network setup.
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

Do not use jsdom to establish real browser focus, layout, or native dialog behavior. Choose the test level by scope:

- **Vitest browser mode** (`vitest/component/`): keyboard, focus, and ARIA states of a single component, including TypeHeadSearch and TabGroupe. Follow the existing browser tests and their user-event setup; dispatch events to the element that owns the handler.
- **Cypress** (`cypress/accessibility/`, `cypress/e2e/`): behavior that spans pages or needs the full app, including dialogs and application-level navigation.

`cypress-real-events` is installed. Reuse the existing specs' plugin imports and `cy.realPress()` or `cy.realHover()` patterns for actual keyboard focus and CSS hover checks in Chrome. Do not assume a separate `cy.tab()` plugin is available. Programmatic `.focus()` may establish a starting state but does not by itself test Tab navigation.

Verify actual dialog visibility, focus movement, Escape handling, and closing in the existing Cypress scenarios. The missing `showModal` implementation is a jsdom limitation, not a limitation of Vitest browser mode. jsdom integration tests may stub the method and assert message content, but they do not establish native modal behavior.

When you change an accessibility test, also update its test plan (`cypress/accessibility/accessibility-testplan.md` or the `*-testplan.md` next to the Vitest component test). See the `tmdb-testing` skill, section "Keep Tests, Test Plans and Docs in Sync".

### 3. Test Semantics and Labels

Check meaningful accessible names, not only the presence of a role. Use expected localized texts from `cy.i18n(locale)`, which reads `lib/i18n/ui.json`, instead of hard-coded strings. Follow existing component and page tests for state and relationship assertions.

### 4. Test Color Contrast

Use `cy.checkPageA11y()` and follow the existing contrast specs for rule-specific options. Check resting, hover, and focus states where relevant. Synthetic mouse events do not establish CSS `:hover`; use the existing `cypress-real-events` pattern. Keep the checked states and scenario IDs in the accessibility test plan.

## Accessibility Checklist

### Development

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Informative images have meaningful alternative text and decorative images do not add noise
- [ ] Forms have labels
- [ ] Errors are announced to screen readers
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast (4.5:1 for normal text)
- [ ] Headings are in logical order
- [ ] Links have descriptive text
- [ ] Dynamic content updates are announced

### Testing

- [ ] Run `cy.checkPageA11y()` on pages and after relevant interactions in accessibility scenarios
- [ ] Test with keyboard only (no mouse)
- [ ] Test with a screen reader (NVDA/VoiceOver)
- [ ] Test text resizing to 200% and reflow at 320 CSS pixels separately
- [ ] Test in high contrast mode

Use the linked manual audit checklist for the fuller set of checks and audit records.

## Scripts

Use `npm run test:e2e:a11y` for the Cypress accessibility suite, `npm run test:e2e` for all configured Cypress E2E specs, or `npm run test:e2e:open` for the interactive runner. Use `npm run test:component` for Vitest browser mode component tests.

Cypress requires the app to run separately on `http://localhost:3000`. List and detail accessibility scenarios use live TMDB data and need a valid server-side `TMDB_API_KEY`. `npm run validate:a11y` builds the app before running the accessibility suite but does not start the server.

## Tools

- **cypress-axe / axe-core**: Automated accessibility testing
- **@testing-library/cypress**: Semantic queries (`findByRole`, `findByLabelText`)
- **@testing-library/user-event**: User interactions in Vitest browser mode component tests
- **cypress-real-events**: Native browser events for Cypress hover and keyboard checks

## Documentation

- **Accessibility Checklist**: [`docs/testing/accessibility-audit-checklist.md`](../../../../docs/testing/accessibility-audit-checklist.md)
- **Accessibility Test Plan**: [`cypress/accessibility/accessibility-testplan.md`](../../../../cypress/accessibility/accessibility-testplan.md)
- **Testing Strategy**: [`docs/testing.md`](../../../../docs/testing.md)

## When to Use

Use this skill when:

- Adding new components
- Creating new pages
- Modifying existing UI
- Fixing accessibility bugs
- Preparing for accessibility audit
