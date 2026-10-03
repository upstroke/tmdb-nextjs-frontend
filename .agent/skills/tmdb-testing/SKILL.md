---
name: tmdb-testing
description: Design, implement, update, or review unit, integration, and Cypress acceptance tests for the TMDB Next.js frontend, including fixtures, mocks, and page objects.
version: 0.1.0
---

# TMDB testing

## Use this skill

Use this skill when a task changes tests, fixes a defect, changes application
behavior, or asks for test strategy, coverage, mocks, fixtures, or page objects.

Read `README.md`, `package.json`, `docs/testing.md`, and the task-relevant
files under `docs/testing/` before editing. Inspect existing tests, fixtures,
mocks, and page objects nearest to the feature.

## Choose the test level

- Use a unit test for isolated functions, transformations, helpers, and small
  business rules.
- Use an integration test for component behavior, user interactions, state,
  rendering with dependencies, or controlled API behavior.
- Use a Cypress acceptance test for an end-to-end user journey, navigation,
  cross-page workflow, browser behavior, or an important regression flow.
- Use a page object when a Cypress page interaction or selector is reused or
  represents meaningful user intent.

## Workflow

1. Identify the behavior to protect and the appropriate test level.
2. For a bug, add a failing regression test before or with the smallest fix.
3. Reuse existing setup, fixtures, mocks, helpers, and page-object conventions.
4. Arrange test data; perform one focused user action or invocation; assert
   observable results.
5. Prefer semantic and user-facing queries over implementation-specific
   selectors.
6. Mock external boundaries rather than internal implementation details.
7. Cover relevant success, loading, empty, error, and edge cases.
8. Run the narrowest relevant test command first, then broader project checks
   only when appropriate.

## Constraints

- Keep tests deterministic and independent of live external services.
- Do not use arbitrary waits, timing-dependent assertions, or brittle styling
  selectors when a stable behavior-based option exists.
- Keep fixtures realistic, minimal, reusable, and explicit about the scenario.
- Keep page-object methods intention-revealing; do not expose incidental DOM
  structure as a test API.
- Do not mark behavior as covered without a test that demonstrates it.

## Completion report

Report test level chosen, scenarios covered, files changed, exact commands run,
results, and manual checks that remain.
