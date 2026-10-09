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

# Run Cypress acceptance tests (headless, app must run on http://localhost:3000)
npm run test:e2e

# Open the Cypress interactive runner
npm run test:e2e:open
```

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
- `middleware.js` and config files
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
├── accessibility/     # Accessibility checks
├── POM/               # Page Objects
├── fixtures/          # Cypress fixtures
└── support/           # Cypress support files
```

## When to Use Which

| Test Type              | Use For                                                  |
| ---------------------- | -------------------------------------------------------- |
| **Vitest Unit**        | Pure functions, utilities, services, stores              |
| **Vitest Integration** | API route handlers and pages with service integration    |
| **Vitest Component**   | Individual React components in isolation                 |
| **Cypress Acceptance** | User flows (E2E tests), keyboard, focus, accessibility   |

## Documentation

- [Unit Tests](testing/unit-tests.md)
- [Integration Tests](testing/integration-tests.md)
- [Acceptance Tests](testing/acceptance-tests.md)
- [Component Tests](testing/component-tests.md)
- [Page Objects](testing/page-objects.md)
- [Common Rules](testing/common-rules.md)
- [Security Tests](testing/security-tests.md)
- [Accessibility Audit Checklist](testing/accessibility-audit-checklist.md)
