# Accessibility Test Strategy

## Component-level accessibility coverage

Some interactive components are covered by Vitest browser tests instead of
dedicated Cypress accessibility specs:

- `TabGroupe`: tablist roles, accessible name, roving tabindex, keyboard
  navigation with wrap-around, focus movement, panel association, loading
  state and plain-text fallback.
- `TypeHeadSearch`: search input and result keyboard/focus behaviour.

These Vitest browser tests are part of the accessibility test strategy. They
cover component-level behaviour that is best verified in isolation.

Cypress remains responsible for page-level and integration-level
accessibility checks, including axe scans, landmarks, heading order, reflow,
locale switching, live regions, dialogs and load-more behaviour.
