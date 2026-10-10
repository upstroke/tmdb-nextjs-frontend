# Test Plan — Accessibility

## Feature Goal

Verify WCAG 2.2 AA compliance on central pages using automated axe-core checks.

## User Story

As a user with assistive technology I can use all central pages of the
application without encountering accessibility violations.

## Covered Scenarios

| ID      | Page     | State                        |
| ------- | -------- | ---------------------------- |
| A11Y-01 | Homepage | Page loaded, content visible |

## States to Include

- Page loaded (success state)
- Extend to: list pages, detail pages, open dialogs, error states

## Rules

Tags checked: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`.

Document intentional exceptions in the spec file directly above `cy.checkPageA11y()`.
Do not disable rules broadly.

## Locale Considerations

Tests use the constant `en-US`, the same as `DEFAULT_LOCALE` in `lib/i18n/config.js`.
Do not read the locale with `Cypress.env()`: `allowCypressEnv` is `false`.
