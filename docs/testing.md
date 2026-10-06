# Testing

This project uses multiple testing frameworks for different purposes:

## Test Types

### Unit Tests (Vitest)
- **Framework:** Vitest
- **Location:** `tests/unit/`
- **Purpose:** Fast, isolated tests for utility functions, services, stores, and i18n
- **Coverage:** Included in coverage reports

### Integration Tests (Vitest)
- **Framework:** Vitest
- **Location:** `tests/unit/routes/`
- **Purpose:** Test API route handlers with service integration
- **Coverage:** Included in coverage reports
- **Documentation:** [Integration Tests](testing/integration-tests.md)

### Flow Tests (Cypress)
- **Framework:** Cypress
- **Location:** `tests/cypress/acceptance/flows/`
- **Purpose:** Multi-component user flows (e.g., homepage navigation, search)
- **Coverage:** NOT included in Vitest coverage reports

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
# Run all Vitest tests (unit + integration)
npm run test

# Run Vitest with coverage
npm run test:coverage

# Run Cypress Flow/E2E tests (opens UI)
npm run test:e2e

# Run Cypress Flow/E2E tests (headless)
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
├── unit/              # Vitest tests
│   ├── utils/
│   ├── services/
│   ├── stores/
│   ├── i18n/
│   └── routes/        # Integration tests (route handlers)
└── cypress/           # Cypress tests
    ├── acceptance/
    │   └── flows/     # Flow tests (multi-component)
    ├── e2e/           # E2E tests
    ├── component/     # Component tests
    └── fixtures/
```

## When to Use Which

| Test Type | Use For |
|-----------|---------|
| **Vitest Unit** | Pure functions, utilities, services, stores |
| **Vitest Integration** | API route handlers with service integration |
| **Cypress Flow** | Multi-component user flows (navigation, search) |
| **Cypress E2E** | Complete user journeys through the UI |
| **Cypress Component** | Individual React components in isolation |

## Documentation

- [Unit Tests](testing/unit-tests.md)
- [Integration Tests](testing/integration-tests.md)
- [Component Tests](testing/component-tests.md)
- [Acceptance Tests](testing/acceptance-tests.md)
- [Flow Tests](cypress/acceptance/flows/)
- [Page Objects](testing/page-objects.md)
- [Common Rules](testing/common-rules.md)
