# Component Tests

## Purpose

Component tests verify individual React components in isolation in a real browser: rendered content, props, state changes, keyboard interaction, focus management, and ARIA states. Use Vitest browser mode with Playwright and Chromium, not Cypress component testing or jsdom.

Do not add tests for purely presentational components when integration or Cypress tests already cover them. Assert on user-visible behavior rather than implementation details.

## Location and Configuration

Tests live in `vitest/component/` and match `**/*.browser.test.{js,jsx}`. The `browser` project in `vitest.config.js` enables the Playwright browser provider with Chromium and loads `vitest/setup/browser.jsx`. Reuse the existing setup and component test conventions.

## Running Tests

```bash
# Component tests only
npm run test:component

# One component's browser tests
npx vitest run --project browser vitest/component/typeheadsearch/TypeHeadSearch.browser.test.jsx

# All Vitest projects with coverage
npm run test:coverage
```

Component tests do not require a separately running Next.js application. Playwright must have the configured Chromium browser available.

## Existing Examples

- `vitest/component/typeheadsearch/TypeHeadSearch.browser.test.jsx`: search keyboard handling and status messages.
- `vitest/component/tabgroupe/TabGroupe.browser.test.jsx`: tab semantics, keyboard navigation, focus movement, and loading/fallback states.
- `vitest/component/headermain/HeaderMain.browser.test.jsx`: header behavior and skip-link markup.

Inspect these tests before introducing a new test pattern. Keep each test independent, use realistic props, and query by role or accessible name where possible.

## Boundaries

- Unit tests cover isolated logic, services, utilities, stores, and schemas.
- Integration tests connect real modules, such as route handlers, the TMDB service, schemas, and server-rendered pages, while mocking the external network.
- Component tests cover isolated UI behavior in Chromium.
- Cypress acceptance tests cover the running application and cross-page user flows.
- Cypress accessibility tests add full-page axe scans and targeted application-level checks; manual audits complement automation.

Component-level accessibility checks are part of the strategy, not a replacement for full-page or manual checks. See the accessibility test plan's Covered in Vitest section.

## Coverage and Maintenance

Component tests contribute to the shared Vitest coverage report for `components/**`, subject to the exclusions in `vitest.config.js`. Run `npm run test:coverage` for the combined report.

When adding, changing, or removing a test, update its matching test plan and affected documentation in the same change. Keep test IDs, descriptions, paths, and assertions consistent.

## Related Documentation

- [Testing Strategy](../testing.md)
- [Integration Tests](integration-tests.md)
- [Acceptance Tests](acceptance-tests.md)
- [Unit Tests](unit-tests.md)
- [Accessibility Test Plan](../../cypress/accessibility/accessibility-testplan.md)
- [Manual Accessibility Audit Checklist](accessibility-audit-checklist.md)
