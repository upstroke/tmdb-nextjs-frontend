# Common Test Rules

These rules apply to all automated tests in this project.

## Preparation

- First read `README.md`, `package.json`, `AGENTS.md`, `docs/testing.md`, and this file.
- Read the applicable Agent Skills and test-level guide before creating or changing tests.
- Read the relevant existing tests, fixtures, mocks, setup utilities, source files, and runner configuration before proposing changes.
- Select the appropriate test level before implementation.
- Define the test subject, expected behavior, relevant risks, input classes, expected results, and intended test level before implementing a test.
- For testing-library, React, or Next.js behavior that may depend on a version, verify the relevant official documentation before implementing a non-obvious solution.
- Reconcile external guidance with `package.json`, project configuration, and existing test patterns before applying it.
- If documentation and the installed version appear to conflict, stop and report the discrepancy before making changes.

## Test Design and Maintenance

- Preserve the existing directory structure, naming conventions, and local test patterns.
- Treat existing tests as the primary source for local conventions when they do not conflict with documented project rules.
- Reuse existing fixtures, mocks, and setup utilities before creating new ones.
- Create new fixtures or mocks only when no suitable existing item can be reused or extended without confusion.
- Keep tests independent, readable, and focused on one clearly described behavior. Make controlled tests deterministic.
- Keep data local when unique to one test. Shared domain fixtures belong in `vitest/fixtures/`; Cypress-specific fixtures belong in `cypress/fixtures/`.
- Keep Cypress Page Objects in `cypress/POM/`; they are not Vitest helpers.
- Never commit real secrets or production credentials.
- Unit and integration tests must control external network responses. Cypress scenarios may use live TMDB data when the relevant test plan explicitly requires it; document the API-key requirement and external-data limitations.
- Mock or stub external technical boundaries when the selected test level requires controlled behavior. Browser-side Cypress interception does not intercept server-side TMDB requests.

## Change Scope and Validation

- Do not modify production code, test configuration, dependencies, environment files, or unrelated tests unless explicitly included in the task.
- Do not install tools or packages without prior approval.
- Run the narrowest relevant test command first, then broader checks justified by the scope.
- Run `npm run validate` for lint with `--max-warnings=0`, formatting, all Vitest tests, and combined coverage before considering a test-change task fully validated. Fix lint warnings rather than leaving them.
- Use the documented validation workflow for broader regression checks. Cypress requires a managed production run and is not included in `npm run validate`.
- Review the complete diff before considering a task complete.
- Report changed files, changed test cases, executed and skipped checks, results, and remaining risks. If a check cannot be run, state that explicitly rather than implying validation passed.

## Naming and Documentation

- Use concise English test names, comments, and documentation.
- Preserve stable feature IDs and test case IDs.
- Keep executable tests, their test plans, and related documentation consistent in the same change.
- If a documented expectation, an existing test, and the implementation disagree, report the discrepancy before changing them.
- If instructions at the same priority level conflict, stop and explain the conflict before making changes.

## Related Documentation

- [Testing Strategy](../testing.md)
- [Unit Tests](unit-tests.md)
- [Integration Tests](integration-tests.md)
- [Component Tests](component-tests.md)
- [Acceptance Tests](acceptance-tests.md)
- [Page Objects](page-objects.md)
- [Security Tests](security-tests.md)
