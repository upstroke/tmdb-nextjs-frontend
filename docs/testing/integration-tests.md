# Integration Tests

Integration tests verify that multiple parts of your application work together correctly. In this project, we use **Cypress** for integration testing.

## Why Cypress for Integration Tests?

- ✅ **Real HTTP requests** - Tests run against the actual application server
- ✅ **Full stack testing** - Tests the complete request/response cycle
- ✅ **Browser automation** - Tests run in a real browser environment
- ✅ **Consistent tooling** - Same framework as E2E and component tests

## Running Integration Tests

```bash
# Open Cypress UI (recommended for development)
npm run test:e2e

# Run Cypress tests headless (CI/CD)
npm run test:e2e:headless

# Run specific integration test file
npx cypress run --spec "tests/cypress/e2e/api/*.cy.js"
```

## Test Location

Integration tests are located in:
```
tests/cypress/e2e/api/
```

## Writing API Integration Tests

Use `cy.request()` to test API endpoints directly:

```javascript
// tests/cypress/e2e/api/movies.cy.js
describe('API Routes', () => {
  describe('GET /api/[locale]/movies', () => {
    it('returns 200 for valid locale', () => {
      cy.request('/api/en-US/movies')
        .its('status')
        .should('eq', 200);
    });

    it('returns 400 for invalid locale', () => {
      cy.request({
        url: '/api/invalid-locale/movies',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('returns movies array in response body', () => {
      cy.request('/api/en-US/movies')
        .its('body')
        .should('have.property', 'movies')
        .and('be.an', 'array');
    });
  });
});
```

## Test Coverage

Integration tests cover:
- API route endpoints (request/response)
- Multi-step user flows
- Cross-component interactions
- External service integration (TMDB API)

## Integration vs E2E Tests

| Aspect | Integration Test | E2E Test |
|--------|-----------------|----------|
| **Scope** | Single feature or API | Complete user journey |
| **UI** | Optional (API-only possible) | Full UI interaction |
| **Speed** | Faster | Slower |
| **Example** | Test `/api/movies` endpoint | Search → View Details → Add to Watchlist |

## Best Practices

1. **Use page objects** for complex flows (see `page-objects.md`)
2. **Keep tests independent** - each test should run in isolation
3. **Use fixtures** for test data (see Cypress fixtures)
4. **Test error states** - verify 4xx and 5xx responses
5. **Mock external services** when appropriate (MSW for Cypress)

## Coverage Reports

Integration tests are **NOT** included in Vitest coverage reports. They are tracked separately by Cypress.

## Related Documentation

- [Unit Tests](unit-tests.md) - For isolated unit testing with Vitest
- [Component Tests](component-tests.md) - For React component testing
- [Acceptance Tests](acceptance-tests.md) - For user story validation
