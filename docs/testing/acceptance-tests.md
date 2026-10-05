# Acceptance Tests

This guide defines the project rules for Cypress acceptance tests. Use acceptance tests for complete user-visible flows that require a real browser and realistic navigation.

## Scope

Acceptance tests are the right choice for:

- complete user journeys across one or more pages
- navigation and routing behavior
- browser-visible loading, restore, and error flows
- locale changes across real navigation paths
- accessibility checks that should run on full pages
- regressions that are best validated in the actual browser environment

Do not use Cypress for small isolated logic or component-only behavior that can be trusted with Vitest.

## File Location

Place browser-based acceptance tests under `tests/cypress/acceptance/`:

```text
tests/cypress/
  acceptance/
    accessibility/
      accessibility.spec.js
      accessibility-testplan.md
    components/
      navigation/
        navigation.spec.js
        navigation-testplan.md
    routes/
      homepage.cy.js
  POM/                 # Cypress page objects
  fixtures/            # Cypress-specific fixture data
  support/             # Cypress entry point and commands
```

`cypress.config.js` discovers specs with `tests/cypress/acceptance/**/*.{cy,spec}.js`, so both `*.cy.js` and the legacy `*.spec.js` naming are picked up. The support file is `tests/cypress/support/e2e.js` and fixtures live in `tests/cypress/fixtures`.

## Component Tests: Vitest or Cypress?

Component tests are written with Vitest, as integration tests under `tests/integration/components/` (see `integration-tests.md`). The project does not use Cypress Component Testing; `cypress.config.js` only defines an `e2e` configuration.

`tests/cypress/acceptance/components/` is different: it holds browser-based acceptance tests for shared UI components or regions (for example navigation) whose user-visible behavior needs coverage in a real browser. These run against the running application, not against an isolated component. Isolated component behavior, including ARIA semantics and keyboard handling inside a single reusable component, belongs in Vitest.

`routes/` contains route-oriented browser journeys; `accessibility/` contains full-page and interaction-state accessibility checks.

Accessibility and navigation currently have a test plan next to their specs; `routes/homepage.cy.js` does not yet have one.

## General Rules

- Write tests from the user perspective.
- Prefer stable selectors based on role, label, and visible text.
- Keep scenarios realistic and business-oriented.
- Avoid overspecifying intermediate implementation details.
- Keep each scenario independent and repeatable.
- Use helper functions only when they improve clarity and do not hide the intent of the test.

## What to Cover

A Cypress acceptance test should cover behavior such as:

- moving between routes
- loading and restoring paginated content
- changing locale and preserving route context
- using search in realistic navigation flows
- error handling visible to real users
- accessibility scans on central pages and meaningful interaction states

## Accessibility

Use Cypress together with axe-core for automated accessibility checks on important pages and interaction states. Component-level semantics and keyboard handling are covered by Vitest integration tests; Cypress covers the full-page scans and browser-dependent focus behavior.

Typical examples:

- homepage
- list pages
- detail pages
- dialogs or menus after opening
- error states that appear after user interaction

Document intentional exceptions explicitly. Do not disable rules broadly.

## Tabs and Season Views

User-visible tabbed detail areas should be covered at acceptance level only when the behavior matters as an actual browser journey.

Good reasons to add Cypress coverage include:

- a season tab changes visible content in a way that is central to the feature
- per-tab loading affects real user flows
- routing, deep linking, or browser history interacts with the active tab
- a regression would likely be missed by component-level tests alone

If the concern is only keyboard handling, ARIA semantics, or isolated async rendering inside a reusable tab component, prefer an integration test first.

## Test Plans

Keep a `*-testplan.md` beside the executable specs for a substantial acceptance feature. Accessibility and navigation already have nearby plans; the current homepage route spec does not. A plan should describe:

- the user story or feature goal
- covered scenarios
- states that must be included, for example loading, error, and success
- special accessibility or locale considerations

Keep the plan close to the executable tests so documentation and implementation evolve together.

## Assertions

Prefer assertions against:

- visible content
- roles and accessible names
- URL changes when routing matters
- browser-visible restore behavior
- dialog, menu, or tab state as the user experiences it

Avoid assertions that only restate internal implementation details.

## Maintenance

When a new feature becomes user-visible, first decide whether confidence belongs at acceptance, integration, or unit level.

Choose Cypress when the browser is part of the behavior contract. Otherwise, keep the test lower in the stack.
