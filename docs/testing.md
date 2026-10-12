# Testing

This project uses multiple test runners for different purposes:

## Test Types

### Unit Tests (Vitest)

- **Framework:** Vitest (jsdom)
- **Location:** `../vitest/unit/`
- **Purpose:** Fast, isolated tests for utility functions, services, stores, and i18n
- **Coverage:** Included in coverage reports
- **Documentation:** [Unit Tests](testing/unit-tests.md)

### Integration Tests (Vitest)

- **Framework:** Vitest (jsdom) + Testing Library
- **Location:** `../vitest/integration/`
- **Purpose:** Test API route handlers and pages (async server components) together with the service layer; only the TMDB network is mocked
- **Coverage:** Included in coverage reports
- **Documentation:** [Integration Tests](testing/integration-tests.md)

### Component Tests (Vitest browser mode)

- **Framework:** Vitest browser mode (Playwright, Chromium)
- **Location:** `../vitest/component/` (`*.browser.test.js(x)`)
- **Purpose:** Test individual React components in isolation in a real browser
- **Coverage:** Included in coverage reports (`components/**`)
- **Documentation:** [Component Tests](testing/component-tests.md)

### Acceptance Tests (Cypress)

- **Framework:** Cypress
- **Location:** `../cypress/e2e/` and `../cypress/accessibility/`
- **Purpose:** User flows and end-to-end tests (e.g. homepage navigation, search, movie details) and accessibility checks
- **Coverage:** NOT included in Vitest coverage reports
- **Documentation:** [Acceptance Tests](testing/acceptance-tests.md)

### Accessibility Tests (Cypress)

- **Framework:** Cypress with axe-core (`cypress-axe`)
- **Location:** `../cypress/accessibility/`
- **Purpose:** Automated WCAG 2.2 AA checks on the homepage, movie and TV show lists and detail pages, the error message for an invalid id, and the open search results
- **Data:** Lists and detail pages load their data on the server, so `cy.intercept()` cannot stub them; these tests use the real TMDB API and need `TMDB_API_KEY`. Only the search request is stubbed.
- **Coverage:** NOT included in Vitest coverage reports
- **Documentation:** [Accessibility test plan](../cypress/accessibility/accessibility-testplan.md)

### Security Tests (Cypress)

- **Framework:** Cypress
- **Location:** `../cypress/e2e/security/`
- **Purpose:** Manipulated input on the search, list routes, locale proxy, and detail pages; XSS; security headers; the TMDB API key must not reach the browser
- **Coverage:** NOT included in Vitest coverage reports
- **Documentation:** [Security Tests](testing/security-tests.md) and the [test plan](../cypress/e2e/security/security-testplan.md)

## Running Tests

```bash
# Run all Vitest tests
npm test

# Run a single Vitest project
npm run test:unit
npm run test:integration
npm run test:component

# Run Vitest with coverage
npm run test:coverage

# Run Cypress acceptance and accessibility tests (headless, app must run on http://localhost:3000)
npm run test:e2e

# Run only the Cypress security tests (app must run on http://localhost:3000)
npm run test:e2e:security

# Run only the Cypress accessibility tests (app must run on http://localhost:3000 with TMDB_API_KEY)
npm run test:e2e:a11y

# Open the Cypress interactive runner
npm run test:e2e:open
```

`npm run test:e2e` runs every spec matched by `specPattern` in `cypress.config.js`: `cypress/e2e/**` and `cypress/accessibility/**`.

## Lint and Format Before Tests

```bash
# ESLint, fails on any warning (--max-warnings=0)
npm run lint

# Prettier, check only
npm run format:check

# Lint + format check + all Vitest tests, run before committing
npm run check
```

The individual test scripts do not run the linter, so a focused run such as `npm run test:unit` stays fast. `npm run check` does not include Cypress, because it needs a running app.

## Coverage

Unit, integration, and component tests contribute to the coverage report (`npm run test:coverage` runs all Vitest projects). Cypress tests do not.

Coverage reports include:

- `lib/**` - Utilities, services, stores, i18n
- `app/api/**` - API route handlers
- `components/**` - React components

Coverage reports **exclude**:

- `**/*.test.js`, `**/*.test.jsx` - Test files
- `**/*.cy.js`, `**/*.cy.jsx` - Cypress tests
- `app/[locale]/**` - Pages (tested via Cypress and integration tests, but not counted)
- `app/layout.js`, `app/page.js`, `app/*.js` - Root layout and page
- `lib/stores/locale.jsx`, `components/providers/**` - Providers
- `proxy.js` and config files
- `node_modules/**`, `vitest/**` - Dependencies and test helpers

The global threshold is 80% statements.

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
├── POM/               # Page Objects
├── fixtures/          # Cypress fixtures
└── support/           # Cypress support files
```

## When to Use Which

| Test Type              | Use For                                                 |
| ---------------------- | ------------------------------------------------------- |
| **Vitest Unit**        | Pure functions, utilities, services, stores             |
| **Vitest Integration** | API route handlers and pages with service integration   |
| **Vitest Component**   | Individual React components in isolation                |
| **Cypress Acceptance** | User flows (E2E tests), keyboard, focus                 |
| **Cypress A11y**       | Automated WCAG 2.2 AA checks with axe-core              |
| **Cypress Security**   | Manipulated input, headers, redirects, API key exposure |

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
