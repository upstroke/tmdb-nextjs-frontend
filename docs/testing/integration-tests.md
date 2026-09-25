# Integration Tests

This guide defines the project rules for Vitest integration tests. Use integration tests when multiple controlled parts of the application must work together but a full browser-level acceptance test would be unnecessary.

## Scope

Integration tests are the right choice for:

- rendered Svelte components with props, slots, and events
- route behavior with mocked load data or controlled dependencies
- interaction between components, stores, and helper modules
- accessibility-relevant rendered output that can be verified in `jsdom`
- async UI states that are driven by mocked services

Do not use an integration test when a small unit test is sufficient. Do not use it as a substitute for a real end-to-end flow that depends on browser navigation, layout, or multi-page behavior.

## General Rules

- Use Vitest together with Testing Library.
- Test behavior through the rendered UI whenever possible.
- Prefer queries by role, label, and accessible name.
- Mock network and external dependencies, but keep collaboration between local parts real.
- Assert user-visible behavior, not component internals.
- Keep each test focused on one interaction or one rendered state.

## File Location

Place integration tests under `tests/integration/`.

Typical structure:

```text
tests/integration/
  components/
  routes/
```

Choose `components/` when the subject is a reusable component. Choose `routes/` when the subject is route-specific behavior or route composition.

## Rendering and Queries

Prefer Testing Library queries in this order:

1. `getByRole`
2. `getByLabelText`
3. `getByText`
4. `getByTestId` only when no semantic query is practical

This keeps integration tests aligned with accessibility expectations and real user behavior.

## Async Behavior

When a component loads data asynchronously:

- mock the service boundary
- trigger the user action that starts loading
- wait for the resulting UI state with `findBy...` or `waitFor`
- assert loading, success, and error states where relevant

Do not assert arbitrary timeouts.

## Components Worth Integration Testing

Integration tests are especially useful for components that combine rendering, accessibility semantics, and interaction logic, for example:

- dialogs
- typeahead search
- pagination and load-more controls
- language switching
- tabs with keyboard support
- route fragments with async content loading

### TabGroupe

`TabGroupe` is a strong candidate for integration tests when it coordinates user interaction and async content states.

Relevant behaviors to cover include:

- the correct tab receives selected state and the associated panel becomes visible
- keyboard navigation works as intended, for example arrow-key movement between tabs
- accessible tab semantics are present, including tab roles and panel relationships
- async tab loading shows the expected intermediate state and then renders the loaded content
- fallback and error UI remains stable if one tab cannot load its content

If `TabGroupe` is reused across route detail areas, test the generic interaction contract once at component level and cover route-specific composition separately only where needed.

## Route Integration Tests

Route integration tests are useful when a route combines:

- load or server data
- route parameters or query parameters
- multiple local components
- restore or pagination logic
- localized rendering behavior

For route tests, mock only the external boundary and keep the route-level collaboration realistic.

## Assertions

Good integration assertions check:

- visible text and labels
- roles and accessible names
- loading and error states
- emitted effects visible in the UI
- state changes after user interaction

Avoid asserting internal function calls unless that call is itself the contract being tested.

## Accessibility

Integration tests should reinforce accessible markup.

Examples:

- tabs are queried by role
- dialogs expose title and close controls
- icon buttons have accessible names
- error messages and status messages are actually rendered in the DOM

## When to Escalate to Playwright

Move a test to acceptance level when confidence depends on:

- real routing across pages
- browser history behavior
- viewport-specific layout behavior
- focus movement that depends on the browser rather than `jsdom`
- interaction across multiple routes or application layers
