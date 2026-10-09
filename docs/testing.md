# Testing

This project uses multiple testing frameworks for different purposes:

## Test Types

### Unit Tests (Vitest)

- **Framework:** Vitest
- **Location:** `../vitest`
- **Purpose:** Fast, isolated tests for utility functions, services, stores, and i18n
- **Coverage:** Included in coverage reports

### Integration Tests (Vitest)

- **Framework:** Vitest
- **Location:** `../vitest`
- **Purpose:** Test API route handlers with service integration
- **Coverage:** Included in coverage reports
- **Documentation:** [Integration Tests](testing/integration-tests.md)

### Acceptance Tests (Cypress)

- **Framework:** Cypress
- **Location:** `../vitest`
- **Purpose:** Fachliche User-Flows und E2E-Tests (z.B. Homepage-Navigation, Search, Movie-Details)
- **Coverage:** NOT included in Vitest coverage reports
- **Documentation:** [Acceptance Tests](testing/acceptance-tests.md)

### Component Tests (Cypress)

- **Framework:** Cypress
- **Location:** `../vitest`
- **Purpose:** Test individual React components in isolation
- **Coverage:** NOT included in Vitest coverage reports

## Running Tests

```bash
# Run all Vitest tests (unit + integration)
npm run test

# Run Vitest with coverage
npm run test:coverage

# Run Cypress Acceptance Tests (opens UI)
npm run test:e2e

# Run Cypress Acceptance Tests (headless)
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
- `node_modules/**`, `../vitest` - Dependencies and test helpers

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
    │   └── flows/     # Acceptance/Flow tests (fachliche E2E)
    ├── component/     # Component tests
    └── fixtures/
```

## When to Use Which

| Test Type              | Use For                                     |
| ---------------------- | ------------------------------------------- |
| **Vitest Unit**        | Pure functions, utilities, services, stores |
| **Vitest Integration** | API route handlers with service integration |
| **Cypress Acceptance** | Fachliche User-Flows (E2E-Tests)            |
| **Cypress Component**  | Individual React components in isolation    |

## Documentation

- [Unit Tests](testing/unit-tests.md)
- [Integration Tests](testing/integration-tests.md)
- [Acceptance Tests](testing/acceptance-tests.md)
- [Component Tests](testing/component-tests.md)
- [Page Objects](testing/page-objects.md)
- [Common Rules](testing/common-rules.md)
