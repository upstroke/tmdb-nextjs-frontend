# Acceptance Tests (E2E)

## Overview

Acceptance tests (End-to-End / E2E) verify complete user flows across multiple pages. They ensure the application works from the user's perspective.

## Tool

- **Cypress** - Browser-based testing framework

## Location

```
tests/cypress/acceptance/flows/   # E2E test files
*.cy.js                            # Test files
```

## What to Test

### ✅ Test These:

- Complete user flows (search → detail → navigate)
- Cross-page navigation
- Real browser behavior
- Critical user journeys
- Happy paths and important edge cases

### ❌ Don't Test:

- Individual components (use component tests)
- Every possible user path (too slow)
- Visual details (use visual regression tools)

## Example

```js
// tests/cypress/acceptance/flows/search.cy.js
describe('Search Flow', () => {
  it('finds and displays movie details', () => {
    // Start on homepage
    cy.visit('/');

    // Search for movie
    cy.findByRole('searchbox', { name: /search movies/i }).type('Inception{enter}');

    // Verify results appear
    cy.findByText(/Inception/i).should('be.visible');

    // Click on first result
    cy.findAllByTestId('movie-card').first().click();

    // Verify detail page loads
    cy.url().should('include', '/movie/');
    cy.findByRole('heading', { name: /Inception/i }).should('be.visible');
  });
});
```

## Best Practices

1. **Test user flows** - Not implementation details
2. **Use Page Objects** - For complex flows (see [Page Objects](./page-objects.md))
3. **Keep tests independent** - Each test should be able to run alone
4. **Use realistic data** - Fixtures from `tests/fixtures/tmdb/`
5. **Assert on user-visible content** - Text, roles, labels
6. **Minimize test count** - Few valuable tests > many trivial tests

## Running Tests

```bash
# All acceptance tests (headless)
npm run test:acceptance

# Open Cypress UI
npm run test:acceptance:ui

# Run specific test
npx cypress run --spec "tests/cypress/acceptance/flows/search.cy.js"
```

## Test Structure

```js
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup: visit page, login, etc.
  });

  it('should complete user flow', () => {
    // Test steps
  });
});
```

## Difference from Component Tests

| Component Tests      | Acceptance Tests     |
| -------------------- | -------------------- |
| Single component     | Multiple pages       |
| Isolated             | Full application     |
| Fast (< 1s)          | Slower (seconds)     |
| Mock data            | Real or fixture data |
| Implementation focus | User flow focus      |

## Documentation

- [Testing Strategy](../testing.md)
- [Component Tests](./component-tests.md)
- [Page Objects](./page-objects.md)
