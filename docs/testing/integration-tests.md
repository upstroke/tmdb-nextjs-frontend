# Integration Tests

## Purpose

Integration tests verify that real application modules work together: API route handlers, the TMDB service layer, Zod schemas, locale handling, and pages implemented as async Server Components. Mock the external TMDB network with `globalThis.fetch`, rather than replacing the internal modules whose integration is under test.

Calling a route handler directly does not by itself make a test an integration test. A handler tested with a mocked service can remain a unit test; integration tests exercise the real handler/service/schema chain or a page/section composed with real application modules.

## Location and Configuration

Tests live in `vitest/integration/` and match `**/*.test.{js,jsx}`. The `integration` project in `vitest.config.js` uses jsdom, Testing Library, and `vitest/setup/browser.jsx`. Despite that setup filename, this project runs in jsdom, not Vitest browser mode.

Do not use the old `tests/unit/routes/` path for integration tests. Isolated route tests belong under `vitest/unit/`; their location and scope remain distinct from the integration project.

## Running Tests

```bash
# Integration tests only
npm run test:integration

# All Vitest projects
npm test

# All Vitest projects with coverage
npm run test:coverage
```

These tests do not require a running Next.js server or a real TMDB API key when the external network and required environment values are controlled by the tests.

## Writing Integration Tests

1. Use shared domain fixtures from `vitest/fixtures/` where appropriate.
2. Configure `globalThis.fetch` to return realistic TMDB responses for the requested endpoints.
3. Exercise the real route, service, schemas, and/or page modules relevant to the scenario.
4. For async Server Components, call the page function with its expected parameters, await it, and render the returned element with Testing Library.
5. Assert on the rendered DOM using roles, accessible names, and text, rather than inspecting component props. For API scenarios, also assert meaningful response status and payload behavior.
6. Restore mocks and environment changes between tests.

Cover successful data flow, locale propagation, validation failures, missing data, and controlled error handling where relevant. Avoid introducing MSW or a second network-mocking pattern without inspecting the existing implementation.

## Browser Limitations

jsdom does not provide real layout or browser-native focus and dialog behavior. Do not use this suite to establish contrast, visual layout, or real modal behavior.

For pages using `DialogMessage`, stub `HTMLDialogElement.showModal` where necessary and assert the message content. Verify actual dialog visibility, focus, and Escape behavior in Cypress. Use Vitest browser mode for isolated component interactions.

## Coverage and Maintenance

Integration tests contribute to the combined Vitest coverage report. The configured includes cover `lib/**`, `app/api/**`, and `components/**`. Pages under `app/[locale]/**` can be exercised by integration tests but are not included in the coverage totals. Consult `vitest.config.js` for exact patterns, exclusions, and thresholds.

When changing a test, update its matching test plan and affected documentation in the same change. Keep test IDs, paths, descriptions, and assertions consistent.

## Related Documentation

- [Testing Strategy](../testing.md)
- [Unit Tests](unit-tests.md)
- [Component Tests](component-tests.md)
- [Acceptance Tests](acceptance-tests.md)
