# Testing

This project uses multiple test runners for different purposes. Paths below are relative to the repository root unless used as Markdown links.

## Test Types

### Unit Tests (Vitest)

- **Framework:** Vitest (jsdom)
- **Location:** `vitest/unit/`
- **Purpose:** Fast, isolated tests for utility functions, schemas, services, stores, i18n, and route behavior with controlled dependencies
- **Coverage:** Included in coverage reports
- **Documentation:** [Unit Tests](testing/unit-tests.md)

### Integration Tests (Vitest)

- **Framework:** Vitest (jsdom) + Testing Library
- **Location:** `vitest/integration/`
- **Purpose:** Test API route handlers and pages (async server components) together with the service layer and schemas; mock the external TMDB network with `globalThis.fetch`, not the internal modules under test
- **Coverage:** Included in coverage reports
- **Documentation:** [Integration Tests](testing/integration-tests.md)

### Component Tests (Vitest browser mode)

- **Framework:** Vitest browser mode (Playwright, Chromium)
- **Location:** `vitest/component/` (`*.browser.test.{js,jsx}`)
- **Purpose:** Test individual React components in isolation in a real browser, including keyboard interaction, focus, and ARIA states
- **Coverage:** Included in coverage reports (`components/**`)
- **Documentation:** [Component Tests](testing/component-tests.md)

### Acceptance Tests (Cypress)

- **Framework:** Cypress
- **Location:** `cypress/e2e/` and `cypress/accessibility/`
- **Purpose:** User flows and end-to-end tests (e.g. homepage navigation, search, movie details) and accessibility checks
- **Coverage:** NOT included in Vitest coverage reports
- **Documentation:** [Acceptance Tests](testing/acceptance-tests.md)

### Accessibility Tests (Vitest browser mode and Cypress)

- **Framework:** Vitest browser mode for isolated component behavior; Cypress with axe-core (`cypress-axe`) for full-page and application checks
- **Location:** `vitest/component/`, `cypress/accessibility/`, and relevant application flows in `cypress/e2e/`
- **Purpose:** Support the WCAG 2.2 AA goal through component semantics and keyboard behavior, page-level axe checks, focus, contrast, reflow, live regions, and localized content
- **Component coverage:** TypeHeadSearch and TabGroupe behavior, plus skip-link markup, are documented under [Covered in Vitest](../cypress/accessibility/accessibility-testplan.md#covered-in-vitest)
- **Data:** Lists and detail pages load data on the server, so `cy.intercept()` cannot stub those requests; affected Cypress scenarios use the real TMDB API and need `TMDB_API_KEY`. Browser-originated requests, including search and load-more requests, can be stubbed as specified in the test plan.
- **Coverage:** Vitest component tests contribute to the configured Vitest coverage report; Cypress checks do not
- **Documentation:** [Accessibility Test Plan](../cypress/accessibility/accessibility-testplan.md) and [Manual Accessibility Audit Checklist](testing/accessibility-audit-checklist.md)

Use the project wrapper `cy.checkPageA11y()` for Cypress accessibility scans. Existing hover and keyboard scenarios use `cypress-real-events`; follow their plugin imports and Chrome event patterns. Automated checks alone do not establish full WCAG conformance.

### Security Tests (Cypress)

- **Framework:** Cypress
- **Location:** `cypress/e2e/security/`
- **Purpose:** Manipulated input on the search, list routes, locale proxy, and detail pages; XSS; security headers; the TMDB API key must not reach the browser
- **Coverage:** NOT included in Vitest coverage reports
- **Documentation:** [Security Tests](testing/security-tests.md) and the [test plan](../cypress/e2e/security/security-testplan.md)

## Complete Automated Validation

```bash
npm run validate:all
```

This runs the Vitest validation workflow, then one production build and all
configured Cypress specs, including security and accessibility. The existing
E2E runner starts the production server, waits for it, and manages shutdown
after Cypress exits. A failing command prevents later commands from starting;
this is a fail-fast workflow, not a collect-all-errors run.

Stop any manually running server on port 3000 first. A valid server-side
`TMDB_API_KEY` is required for live-data scenarios, and Chrome plus the
Playwright Chromium browser used by component tests must be available.
No separate Next.js server is needed for Vitest or coverage.

Security and accessibility are already included in the full Cypress run and
need not be invoked again separately. Manual accessibility audits are still
required; automated success does not establish full WCAG conformance.

## Running Tests

```bash
# Run all Vitest tests
npm test

# Run a single Vitest project or focused component suite
npm run test:unit
npm run test:integration
npm run test:component

# Run all Vitest projects with combined coverage; no Next.js server needed
npm run test:coverage

# Build production, manage its server, and run all Cypress specs
npm run test:e2e

# Same production lifecycle, security specs only
npm run test:e2e:security

# Same production lifecycle, accessibility specs only
npm run test:e2e:a11y

# Build and start production, then open Cypress interactively
npm run test:e2e:open

# Managed production run of one spec
npm run test:e2e -- --spec "cypress/e2e/security/routing.cy.js"
```

`npm run test:e2e` runs every spec matched by `specPattern` in `cypress.config.js`: `cypress/e2e/**` and `cypress/accessibility/**`.

## Lint and Format Before Tests

```bash
# ESLint, fails on any warning (--max-warnings=0)
npm run lint

# Prettier, check only
npm run format:check

# Prettier, rewrite files
npm run format
```

The individual test scripts do not run the linter, so a focused run such as `npm run test:unit` stays fast.

## Validation Workflow

- `npm run validate:all`: complete automated validation described above.
- `npm run validate:fast`: lint, formatting check, and unit tests. The pre-commit hook runs `npx lint-staged && npm run validate:fast`; lint-staged formats matching staged files first.
- `npm run validate`: lint, formatting check, unit tests, component tests, integration tests, and combined coverage. It does not run a production build or Cypress.
- `npm run build`: separate production-build validation.
- `bash scripts/validate.sh`: alternative sequence with lint, formatting, unit, component, integration tests, and a build, but no explicit coverage run. It is not equivalent to `npm run validate` or `npm run validate:all`.

`validate` and `validate:all` use `scripts/run-checks.mjs` for friendly progress output. They run the same underlying npm scripts and retain the fail-fast behavior.

Run one focused check through the existing validation commands:

```bash
npm run validate -- lint
npm run validate -- format
npm run validate -- unit
npm run validate -- component
npm run validate -- integration
npm run validate -- coverage

npm run validate:all -- e2e
npm run validate:all -- security
npm run validate:all -- a11y
```

For example, `npm run validate -- component` runs `npm run test:component`.

Do not start a separate server for managed E2E commands. The runner checks port
3000 before and after building, rejects occupied ports, and starts `next start`
with `NODE_ENV=production`. Do not override its baseUrl or start another server
during the run. See [Acceptance Tests](testing/acceptance-tests.md) for details.

## Coverage

Unit, integration, and component tests contribute to the coverage report (`npm run test:coverage` runs all Vitest projects). Cypress tests do not.

Coverage reports include:

- `lib/**` - Utilities, services, stores, i18n
- `app/api/**` - API route handlers
- `components/**` - React components

Coverage reports **exclude**:

- `**/*.test.js`, `**/*.test.jsx` - Test files
- `**/*.cy.js`, `**/*.cy.jsx` - Cypress tests
- `app/[locale]/**` - Pages and the root layout `app/[locale]/layout.js` (tested via Cypress and integration tests, but not counted)
- `app/*.js` - Files directly in `app/`
- `lib/stores/locale.jsx`, `components/providers/**` - Providers
- `proxy.js` and config files
- `node_modules/**`, `vitest/**` - Dependencies and test helpers

The global threshold is 80% statements, not 80% for every metric or every individual project. The coverage provider is Istanbul. Exact include/exclude patterns and report settings are defined in `vitest.config.js`.

## Test Structure

```
vitest/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── component/         # Component tests (browser mode)
├── fixtures/          # Shared domain fixtures
├── mocks/             # Shared mocks
├── setup/             # Test setup files
└── reporters/         # Custom reporters
cypress/
├── e2e/               # Acceptance / flow tests
│   └── security/      # Security tests and test plan
├── accessibility/     # Accessibility checks and test plan
├── POM/               # Cypress-specific Page Objects
├── fixtures/          # Cypress fixtures
└── support/           # Cypress support files
```

## When to Use Which

| Test Type              | Use For                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Vitest Unit**        | Isolated utilities, schemas, services, stores, and route behavior                   |
| **Vitest Integration** | Real route/service/schema and page integration with the external network mocked     |
| **Vitest Component**   | Isolated React components, including keyboard, focus, and ARIA behavior in Chromium |
| **Cypress Acceptance** | Full-application user flows and cross-page behavior                                 |
| **Cypress A11y**       | Full-page axe scans and targeted application-level accessibility checks             |
| **Cypress Security**   | Manipulated input, headers, redirects, API key exposure                             |

Use English for explanatory documentation, test names, and comments. Preserve identifiers and intentionally localized test data. Keep test plans and affected documentation in sync with test changes.

## Documentation

- [Unit Tests](testing/unit-tests.md)
- [Integration Tests](testing/integration-tests.md)
- [Acceptance Tests](testing/acceptance-tests.md)
- [Component Tests](testing/component-tests.md)
- [Page Objects](testing/page-objects.md)
- [Common Rules](testing/common-rules.md)
- [Security Tests](testing/security-tests.md)
- [Accessibility Test Plan](../cypress/accessibility/accessibility-testplan.md)
- [Accessibility Audit Checklist](testing/accessibility-audit-checklist.md)
