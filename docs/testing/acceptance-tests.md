# Cypress Tests: Component and Acceptance

This guide defines the project rules for Cypress tests. Cypress covers two levels: component tests for isolated UI components in a real browser, and acceptance tests for complete user-visible flows with realistic navigation. Vitest covers unit and integration tests only (see `integration-tests.md`).

## Component Tests

Use Cypress Component Testing for reusable UI components rendered in isolation in a real browser.

Good candidates:

- dialogs, menus, and typeahead search
- tabs with keyboard support (for example `TabGroupe`)
- pagination and load-more controls
- language switching controls
- ARIA semantics, focus handling, and keyboard behavior of a single component
- layout behavior of a component at specific viewport sizes

Rules:

- Mount the component with `cy.mount()`, registered in `tests/cypress/support/component.js`.
- Stub network requests with `cy.intercept()`; do not use MSW.
- Prefer selectors by role, label, and visible text.
- Test one component contract per spec: states, interactions, keyboard, and accessible names.
- Do not test full pages or multi-page flows here; use acceptance tests.

Place specs under `tests/cypress/component/`, one directory per component or component group, with the spec file named `*.cy.js`.

## Acceptance Tests

Acceptance tests are the right choice for:

- complete user journeys across one or more pages
- navigation and routing behavior
- browser-visible loading, restore, and error flows
- locale changes across real navigation paths
- accessibility checks that should run on full pages
- regressions that are best validated in the actual browser environment

Do not use Cypress for pure logic that can be trusted with Vitest unit tests.

## File Location

Place Cypress tests under `tests/cypress/`:

```text
tests/cypress/
  component/
    tab-groupe/
      tab-groupe.cy.js
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
  support/             # e2e.js, component.js, component-index.html
```

`cypress.config.js` defines two configurations:

- `e2e` discovers specs with `tests/cypress/acceptance/**/*.{cy,spec}.js` and uses `tests/cypress/support/e2e.js`.
- `component` discovers specs with `tests/cypress/component/**/*.cy.{js,jsx}` and uses `tests/cypress/support/component.js` and `tests/cypress/support/component-index.html`.

`acceptance/components/` contains browser-based acceptance tests for shared UI regions (for example navigation) running against the real application. It is not the place for isolated component tests; those live in `tests/cypress/component/`. `routes/` contains route-oriented browser journeys; `accessibility/` contains full-page and interaction-state accessibility checks.

Accessibility and navigation currently have a test plan next to their specs; `routes/homepage.cy.js` does not yet have one.

## General Rules

- Write tests from the user perspective.
- Prefer stable selectors based on role, label, and visible text.
- Keep scenarios realistic and business-oriented.
- Avoid overspecifying intermediate implementation details.
- Keep each scenario independent and repeatable.
- Use helper functions only when they improve clarity and do not hide the intent of the test.

## What to Cover in Acceptance Tests

A Cypress acceptance test should cover behavior such as:

- moving between routes
- loading and restoring paginated content
- changing locale and preserving route context
- using search in realistic navigation flows
- error handling visible to real users
- accessibility scans on central pages and meaningful interaction states

## Accessibility

Use Cypress together with axe-core for automated accessibility checks. Component tests verify semantics, keyboard handling, and focus of a single component; acceptance tests run full-page scans and verify browser-dependent focus behavior on important pages and interaction states.

Typical acceptance examples:

- homepage
- list pages
- detail pages
- dialogs or menus after opening
- error states that appear after user interaction

Document intentional exceptions explicitly. Do not disable rules broadly.

## Tabs and Season Views

The generic interaction contract of a reusable tab component (selected state, keyboard navigation, tab roles, panel relationships, async tab loading, error fallback) is covered by a Cypress component test.

Add acceptance coverage only when the behavior matters as an actual browser journey, for example:

- a season tab changes visible content in a way that is central to the feature
- per-tab loading affects real user flows
- routing, deep linking, or browser history interacts with the active tab

## Test Plans

Keep a `*-testplan.md` beside the executable specs for a substantial feature. Accessibility and navigation already have nearby plans; the current homepage route spec does not. A plan should describe:

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

When a new feature becomes user-visible, first decide the level:

- unit (Vitest): pure logic
- integration (Vitest): modules and routes with mocked APIs, no browser
- component (Cypress): one UI component in isolation in a browser
- acceptance (Cypress): complete flows across pages

Keep the test as low in this list as the behavior allows.
