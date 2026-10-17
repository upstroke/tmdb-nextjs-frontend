# Unit Tests

## Purpose

Unit tests verify isolated logic with Vitest. The `unit` project in `vitest.config.js` uses jsdom and matches `vitest/unit/**/*.test.{js,jsx}`.

## Scope

- Utilities, formatting, validation, and Zod schemas.
- Services with controlled external dependencies.
- Locale helpers, resolvers, and store logic.
- Isolated API route behavior, including validation and error handling.
- Boundary values, missing data, and malformed input.

A route test is not automatically an integration test. Use `vitest/integration/` when exercising real application modules together, such as the route, service, schemas, and page, with only the external network mocked.

Use Vitest browser mode for isolated React component behavior. Use Cypress for the running application and end-to-end flows.

## Location

Tests live under `vitest/unit/`, grouped by subject, including `i18n/`, `routes/`, `security/`, `services/`, `stores/`, and `utils/`. Shared domain fixtures belong in `vitest/fixtures/`; reuse existing mocks and setup utilities where appropriate.

Inspect existing tests such as `vitest/unit/utils/formatDate.test.js` and `vitest/unit/services/tmdb-api.test.js` before adding a new pattern. Do not assume illustrative formatting functions or fallback strings are actual application contracts.

## Running Tests

```bash
# Unit project only
npm run test:unit

# One unit test file, single run
npx vitest run --project unit vitest/unit/utils/formatDate.test.js

# All Vitest projects, not only unit tests
npm test

# Combined coverage across Vitest projects
npm run test:coverage
```

## Best Practices

- Use concise English names and Arrange-Act-Assert structure.
- Keep each test focused on clearly described behavior.
- Mock external technical boundaries and restore mocks and environment changes.
- Avoid live TMDB requests and real credentials in unit tests.
- Cover null, undefined, empty values, boundaries, and errors where relevant.
- Use fake timers when time-dependent behavior needs deterministic testing; restore them afterward.
- Assert observable outputs rather than internal implementation details.
- Update the matching test plan and affected documentation with test changes.

## Coverage

The enforced global threshold is 80% statements, not 80% for every metric or every individual test project. Unit, integration, and browser component tests contribute to the combined report. Cypress tests do not.

Consult `vitest.config.js` and [Testing Strategy](../testing.md) for exact includes, exclusions, and report settings rather than maintaining a second configuration listing here.

## Related Documentation

- [Testing Strategy](../testing.md)
- [Integration Tests](integration-tests.md)
- [Component Tests](component-tests.md)
- [Acceptance Tests](acceptance-tests.md)
- [Common Test Rules](common-rules.md)
