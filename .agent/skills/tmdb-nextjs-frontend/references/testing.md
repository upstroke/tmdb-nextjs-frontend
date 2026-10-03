# Testing reference

This project separates testing into unit, integration, and acceptance testing.

## Unit tests

Use unit tests for isolated logic:

- Data transformations
- Formatters
- Utility functions
- Hooks where isolation is meaningful
- Small pieces of business logic

Keep unit tests fast, deterministic, and independent of network access.

## Integration tests

Use integration tests when several units cooperate:

- Component composition
- User interactions
- State transitions
- Route-level rendering
- Client/server boundaries
- Data-fetching behavior with controlled mocks

Test the resulting behavior rather than internal function calls.

## Acceptance tests

Use Cypress acceptance tests for complete user journeys:

- Navigation
- Search and discovery flows
- Media detail flows
- Keyboard navigation
- Core accessibility journeys
- Regression scenarios for previously broken behavior

## Page objects

Use page objects to encapsulate page structure and interaction:

- Keep selectors and repeated interactions in page objects.
- Expose intention-revealing methods, such as `searchFor(term)` or
  `openMovieDetails(title)`.
- Do not place implementation-specific selectors throughout test files.
- Update page objects when UI structure changes.
- Prefer accessible selectors where practical.

## Test quality rules

- One behavior per test where practical.
- Arrange, act, assert.
- Avoid brittle selectors tied to styling or text that changes often.
- Mock external boundaries, not the code under test.
- Keep fixtures realistic and reusable.
- Remove obsolete tests instead of leaving misleading coverage.
