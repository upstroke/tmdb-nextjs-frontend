---
name: tmdb-testing
description: Design, implement, update, or review Vitest unit and integration/component tests and Cypress acceptance and accessibility tests for the TMDB Next.js frontend, including fixtures, mocks, and page objects.
version: 0.3.0
---

# TMDB testing

## Use this skill

Use this skill when a task changes tests, fixes a defect, changes application
behavior, or asks for test strategy, coverage, mocks, fixtures, or page objects.

Read `README.md`, `package.json`, `docs/testing.md`, and the task-relevant
files under `docs/testing/` before editing. Inspect existing tests, fixtures,
mocks, and page objects nearest to the feature.

## Tools and scope

- **Vitest** runs unit tests (`tests/unit`) and integration/component tests
  (`tests/integration`, including `tests/integration/components`). It uses
  React Testing Library, `user-event`, `jsdom`, and `msw`.
- **Cypress** runs acceptance and accessibility tests in a real browser
  (`tests/cypress/`). Accessibility checks use `cypress-axe`. Cypress is
  configured for e2e specs in `tests/cypress/acceptance`; there is no Cypress
  component-testing setup.
- Do not write component or integration tests in Cypress. Do not write
  isolated logic tests in Cypress.

## Choose the test level

- Use a unit test (Vitest) for isolated functions, transformations, helpers, and
  small business rules.
- Use an integration or component test (Vitest) for component behavior, user
  interactions, state, rendering with dependencies, or controlled API behavior.
- Use a Cypress acceptance test for an end-to-end user journey, navigation,
  cross-page workflow, browser behavior, or an important regression flow.
- Use a Cypress accessibility test (`cypress-axe`) for page-level keyboard,
  focus, and automated accessibility checks in the browser.
- Use a page object when a Cypress page interaction or selector is reused or
  represents meaningful user intent.

## Coverage target and ISTQB classification (Vitest only)

The project target is at least 80% statement coverage, measured by
`npm run test:vitest:coverage` on Vitest unit and integration/component tests.

This section applies only to Vitest tests. Cypress tests carry no coverage
comment, no coverage label, and no coverage target.

Classify every Vitest `it` block according to ISTQB terminology:

- **Statement coverage**: the test executes statements at least once. Use this
  for straight-line code and for the single path through a function.
- **Branch coverage**: the test exercises a specific outcome of a decision
  (`true` or `false` of an `if`, each case of a `switch`, each side of a ternary,
  `&&`, `||`, `??`, or optional chaining fallback).

Branch coverage subsumes statement coverage: a test that covers a branch also
covers its statements, but it must still be labeled as branch coverage.

Label each Vitest `it` block with a comment directly above it:

```js
// Coverage: Statement
it('returns the title for a movie', () => { /* ... */ })

// Coverage: Branch (poster_path missing -> fallback image)
it('uses the fallback image when poster_path is missing', () => { /* ... */ })
```

Rules:

- Every Vitest `it` block carries exactly one `// Coverage:` label.
- A branch label names the decision and the outcome that is exercised.
- Cover both outcomes of each relevant decision with separate `it` blocks.
- Do not label a test as branch coverage if it exercises only one outcome and
  the other outcome has no test.
- Do not add `// Coverage:` comments to Cypress specs.

## Workflow

1. Identify the behavior to protect and the appropriate test level and tool.
2. For a bug, add a failing regression test before or with the smallest fix.
3. Reuse existing setup, fixtures, mocks, helpers, and page-object conventions.
4. Arrange test data; perform one focused user action or invocation; assert
   observable results.
5. Prefer semantic and user-facing queries over implementation-specific
   selectors.
6. Mock external boundaries rather than internal implementation details.
7. Cover relevant success, loading, empty, error, and edge cases.
8. Label each new or changed Vitest `it` block with its ISTQB coverage type.
   Do not label Cypress tests.
9. Run the narrowest relevant test command first, then broader project checks
   only when appropriate. Run Cypress (`npm run test:acceptance`) as a separate
   validation step.
10. For Vitest changes, check the statement coverage report against the 80%
    target.

## Constraints

- Keep tests deterministic and independent of live external services.
- Do not use arbitrary waits, timing-dependent assertions, or brittle styling
  selectors when a stable behavior-based option exists.
- Keep fixtures realistic, minimal, reusable, and explicit about the scenario.
- Keep page-object methods intention-revealing; do not expose incidental DOM
  structure as a test API.
- Do not mark behavior as covered without a test that demonstrates it.
- Do not add tests only to raise the coverage number; each test must protect
  observable behavior.

## Completion report

Report test level and tool chosen, scenarios covered, files changed, exact
commands run, results, and manual checks that remain. For Vitest tests, also
report the coverage type per `it` block (statement or branch) and the statement
coverage figure against the 80% target. For Cypress tests, report the scenario
and result only; do not report coverage.
