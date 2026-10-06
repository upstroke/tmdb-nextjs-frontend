# Testing Strategy

This project uses a comprehensive testing strategy with multiple test types to ensure code quality and application reliability.

## Test Types

### Unit Tests

**Location:** `tests/unit/`

Unit tests verify individual functions, utilities, and modules in isolation.

- **Framework:** Vitest
- **Environment:** jsdom
- **Use cases:**
  - Utility functions (e.g., sanitization, formatting)
  - Helper functions
  - Pure functions with no external dependencies
  - i18n helpers and resolvers
  - Store logic
  - Service layer functions
  - API route handlers

**Run unit tests:**
```bash
npm run test:unit
```

### Integration Tests

**Location:** `tests/integration/`

Integration tests verify multiple components working together, typically React components with their dependencies.

- **Framework:** Vitest + Testing Library
- **Environment:** jsdom
- **Use cases:**
  - Component interactions
  - State management
  - API mocking and responses
  - Multi-component workflows

**Run integration tests:**
```bash
npm run test:unit
```

### Component Tests

**Location:** `tests/cypress/component/`

Component tests render individual React components in a real browser environment for isolated testing.

- **Framework:** Cypress Component Testing
- **Environment:** Real browser (Chrome)
- **Use cases:**
  - Single component behavior
  - Props and state variations
  - User interactions within a component
  - Faster feedback than E2E (no full app boot)

**Run component tests:**
```bash
npm run test:component
```

### E2E Tests

**Location:** `tests/cypress/acceptance/`

End-to-end tests verify complete user flows through the entire application.

- **Framework:** Cypress
- **Environment:** Real browser (Chrome)
- **Use cases:**
  - Complete user journeys
  - Navigation and routing
  - Full application behavior
  - Cross-component workflows

**Run E2E tests:**
```bash
npm run test:e2e
```

## Coverage

### What's Included in Coverage Reports

**Unit + Integration Tests (Vitest):**
- All code covered by tests in `tests/unit/` and `tests/integration/`
- Reported via `npm run test:coverage`

**NOT Included:**
- Cypress Component Tests (`tests/cypress/component/`)
- Cypress E2E Tests (`tests/cypress/acceptance/`)

Cypress tests have their own separate reporting and are excluded from Vitest coverage.

## Test Commands

```bash
# Run all unit and integration tests
npm run test:unit

# Run component tests
npm run test:component

# Run E2E tests
npm run test:e2e

# Run unit tests with coverage (excludes Cypress tests)
npm run test:coverage
```

## Test File Naming Conventions

- **Unit tests:** `*.test.js` or `*.test.jsx`
- **Integration tests:** `*.test.js` or `*.test.jsx`
- **Component tests:** `*.cy.js` or `*.cy.jsx`
- **E2E tests:** `*.cy.js` or `*.cy.jsx`

## Directory Structure

```
tests/
├── unit/                    # Unit tests (Vitest)
│   ├── i18n/
│   ├── routes/              # API route handler tests
│   ├── security/
│   ├── services/
│   ├── stores/
│   └── utils/
├── integration/             # Integration tests (Vitest + Testing Library)
├── cypress/                 # Cypress tests
│   ├── acceptance/          # E2E tests
│   ├── component/           # Component tests
│   ├── fixtures/
│   └── support/
├── mocks/                   # Shared test mocks
├── setup/                   # Test setup files
└── cypress.config.js        # Cypress configuration
```

## Configuration Files

- **`vitest.config.js`** – Vitest configuration for unit and integration tests (includes coverage exclude patterns)
- **`vite.config.js`** – Vite configuration for Cypress Component Testing
- **`tests/cypress.config.js`** – Cypress configuration for E2E and component tests

## Related Documentation

- [Unit Tests](./testing/unit-tests.md)
- [Integration Tests](./testing/integration-tests.md)
- [Component Tests](./testing/component-tests.md)
- [E2E Tests](./testing/e2e-tests.md)
