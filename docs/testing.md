# Testing

This project uses multiple testing frameworks for different purposes:

## Test Types

### Unit Tests (Vitest)
- **Framework:** Vitest
- **Location:** `tests/unit/`
- **Purpose:** Fast, isolated tests for utility functions, services, stores, and i18n
- **Coverage:** Included in coverage reports

### Route Handler Tests (Vitest)
- **Framework:** Vitest
- **Location:** `tests/unit/routes/`
- **Purpose:** Test Next.js API route handlers in isolation
- **Coverage:** Included in coverage reports (only `app/api/**` routes)

### Integration Tests (Cypress)
- **Framework:** Cypress
- **Location:** `tests/cypress/e2e/api/`
- **Purpose:** API endpoint tests and multi-step flows
- **Coverage:** NOT included in Vitest coverage reports
- **Documentation:** [Integration Tests](testing/integration-tests.md)

### E2E Tests (Cypress)
- **Framework:** Cypress
- **Location:** `tests/cypress/e2e/`
- **Purpose:** Complete user journeys through the UI
- **Coverage:** NOT included in Vitest coverage reports

### Component Tests (Cypress)
- **Framework:** Cypress
- **Location:** `tests/cypress/component/`
- **Purpose:** Test individual React components in isolation
- **Coverage:** NOT included in Vitest coverage reports

## Running Tests

```bash
# Run all Vitest tests (unit + route handlers)
npm run test

# Run Vitest with coverage
npm run test:coverage

# Run Cypress E2E/Integration tests (opens UI)
npm run test:e2e

# Run Cypress E2E/Integration tests (headless)
npm run test:e2e:headless

# Run Cypress Component Tests
npm run test:component
```

## Coverage

Coverage reports include:
- `lib/**` - Utilities, services, stores, i18n
- `app/api/**` - API route handlers

Coverage reports **exclude**:
- `**/*.test.js`, `**/*.test.jsx` - Test files
- `**/*.cy.js`, `**/*.cy.jsx` - Cypress tests
- `app/[locale]/**` - Pages (tested via Cypress only)
- `app/layout.js`, `app/page.js` - Root layout and page
- `node_modules/**`, `tests/**` - Dependencies and test helpers

## Test Structure

```
tests/
├── unit/              # Vitest unit tests
│   ├── utils/
│   ├── services/
│   ├── stores/
│   ├── i18n/
│   └── routes/        # API route handler tests
└── cypress/           # Cypress tests
    ├── e2e/           # E2E and integration tests
    │   └── api/       # API integration tests
    ├── component/     # Component tests
    └── fixtures/
```

## When to Use Which

| Test Type | Use For |
|-----------|---------|
| **Vitest Unit** | Pure functions, utilities, services, stores |
| **Vitest Route** | API route handler logic (request/response) |
| **Cypress Integration** | API endpoints via HTTP, multi-step flows |
| **Cypress E2E** | Complete user journeys through the UI |
| **Cypress Component** | Individual React components in isolation |

## Documentation

- [Unit Tests](testing/unit-tests.md)
- [Integration Tests](testing/integration-tests.md)
- [Component Tests](testing/component-tests.md)
- [Acceptance Tests](testing/acceptance-tests.md)
- [Page Objects](testing/page-objects.md)
- [Common Rules](testing/common-rules.md)
