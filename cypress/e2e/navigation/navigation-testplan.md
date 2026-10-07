# Test Plan — Navigation

## Feature Goal

Verify that the global navigation and locale-prefixed routing work correctly
for the user in a real browser environment.

## User Story

As a visitor I can open the application, see the global header with a
language switcher, and navigate to different pages while the locale is
preserved in the URL.

## Covered Scenarios

| ID     | Scenario                                   | State   |
| ------ | ------------------------------------------ | ------- |
| NAV-01 | Homepage loads without errors              | success |
| NAV-02 | Active locale is reflected in the URL      | success |
| NAV-03 | Global header is visible                   | success |
| NAV-04 | Language switcher is present in the header | success |

## States to Include

- Success state (page loaded, content visible)

## Accessibility Considerations

See `tests/acceptance/accessibility/` for WCAG 2.2 AA checks on the homepage.

## Locale Considerations

Tests run against `DEFAULT_LOCALE` from `cypress.env.json`.
Default fallback: `en-US`.
