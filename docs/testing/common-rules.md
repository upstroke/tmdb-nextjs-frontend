# Common Test Rules

These rules apply to all automated tests in this project.

## Preparation

- First read `README.md`, `package.json`, `justfile`, `docs/testing.md`, and this file.
- Read the applicable test-level guide before creating or changing tests.
- Read the relevant existing tests, fixtures, mocks, setup utilities, and source files before proposing changes.
- Select the appropriate test level before implementation.
- Define the test subject, expected behavior, relevant risks, input classes, expected results, and intended test level before implementing a test.
- For questions about Vitest, Playwright, Svelte Testing Library, Svelte, or SvelteKit behavior that may depend on a current version, verify the current official documentation before implementing a non-obvious solution.
- Reconcile external guidance with `package.json`, the project configuration, and existing test patterns before applying it.
- If current documentation and the installed version appear to conflict, stop and report the discrepancy before making changes.

## Test Design and Maintenance

- Preserve the existing directory structure, naming conventions, and local test patterns.
- Treat existing tests as the primary source for local conventions when they do not conflict with documented project rules.
- Reuse existing fixtures, mocks, and setup utilities before creating new ones.
- Create new fixtures or mocks only when no suitable existing item can be reused or extended without creating confusion.
- Keep tests independent, deterministic, readable, and focused on one clearly described behavior.
- Keep test data concise and local when it is unique to one test. Move recurring stable domain data to `tests/fixtures/`.
- Do not use real secrets, production credentials, or uncontrolled external APIs.
- Mock or stub external technical boundaries when the selected test level requires controlled behavior.

## Change Scope and Validation

- Do not modify production code, test configuration, dependencies, environment files, or unrelated tests unless they are explicitly included in the task.
- Do not install tools or packages without prior approval.
- Run the narrowest relevant test command first, then run broader checks only when justified by the scope.
- Review the complete diff before considering a task complete.
- Report changed files, implemented or changed test cases, executed checks, skipped checks, results, and remaining risks.

## Naming and Documentation

- Use concise English test names and comments.
- Preserve stable feature IDs and test case IDs where they already exist.
- Keep executable tests and related documentation consistent.
- If a documented expectation, an existing test, and the implementation disagree, stop and report the discrepancy before changing any of them.
- If instructions at the same priority level conflict, stop and explain the conflict before making changes.
