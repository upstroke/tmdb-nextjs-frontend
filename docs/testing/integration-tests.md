# Integration Tests

Integration tests verify that multiple components work together correctly. In this project, we use **Vitest** for integration testing of API route handlers.

## What Are Integration Tests?

Integration tests sit between unit tests and E2E tests:

- **Unit Tests**: Test isolated functions (e.g., a utility function)
- **Integration Tests**: Test how components work together (e.g., route handler + service + i18n)
- **E2E Tests**: Test complete user flows in a real browser

## Why Vitest for Integration Tests?

- ✅ **Fast execution** - No browser overhead
- ✅ **Direct handler testing** - Call route functions directly
- ✅ **Easy mocking** - Mock external services (TMDB API) with MSW
- ✅ **Coverage reports** - Included in Vitest coverage

## Running Integration Tests

```bash
# Run all Vitest tests (includes integration tests)
npm run test

# Run Vitest with coverage
npm run test:coverage

# Run only route handler tests
npx vitest run tests/unit/routes/
```

## Test Location

Integration tests (route handler tests) are located in:
```
tests/unit/routes/
```

## Writing Route Handler Integration Tests

Test Next.js API route handlers by calling the `GET`/`POST` function directly:

```javascript
// tests/unit/routes/movies.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/[locale]/movies/route';

// Set TMDB API key for tests
process.env.TMDB_API_KEY = 'test-key';

describe('GET /api/[locale]/movies', () => {
  const createRequest = (locale = 'en-US', page = '1') => {
    const url = page
      ? `http://localhost:3000/api/${locale}/movies?page=${page}`
      : `http://localhost:3000/api/${locale}/movies`;
    return new Request(url);
  };

  const createParams = (locale = 'en-US') => {
    return { params: Promise.resolve({ locale }) };
  };

  // Statement coverage executes the successful response path.
  it('returns 200 for valid locale and page', async () => {
    const response = await GET(createRequest('en-US', '1'), createParams('en-US'));

    expect(response.status).toBe(200);
  });

  // Branch coverage covers the invalid-locale branch.
  it('returns a 400 response when the locale is unsupported', async () => {
    const response = await GET(createRequest('invalid-locale'), createParams('invalid-locale'));

    expect(response.status).toBe(400);
  });

  // Statement coverage executes the pagination path.
  it('returns 200 for page 2 request', async () => {
    const response = await GET(createRequest('en-US', '2'), createParams('en-US'));

    expect(response.status).toBe(200);
  });
});
```

## Test Coverage

Integration tests cover:
- Route handler logic (request/response)
- Service integration (TMDB API calls)
- i18n locale handling
- Error handling and edge cases
- Pagination logic

## Integration vs Unit vs E2E Tests

| Aspect | Unit Test | Integration Test | E2E Test |
|--------|-----------|-----------------|----------|
| **Scope** | Single function | Multiple components | Complete user flow |
| **Framework** | Vitest | Vitest | Cypress |
| **Location** | `../../vitest`, `../../vitest` | `../../vitest` | `../../vitest`, `../../vitest` |
| **Speed** | Fastest | Fast | Slowest |
| **Example** | `formatDate()` utility | `GET /api/movies` handler | Homepage → Search → Movie Details |

## Best Practices

1. **Mock external services** - Use MSW to mock TMDB API responses
2. **Test all branches** - Cover success, error, and edge cases
3. **Use realistic data** - Mock responses should match real API structure
4. **Test i18n handling** - Verify locale validation and error messages
5. **Keep tests isolated** - Each test should run independently

## Coverage Reports

Integration tests are **included** in Vitest coverage reports. The covered files are:
- `app/api/**` - API route handlers
- `lib/**` - Services, utilities, stores, i18n

## Related Documentation

- [Unit Tests](unit-tests.md) - For isolated unit testing with Vitest
- [Component Tests](component-tests.md) - For React component testing with Cypress
- [Flow Tests](../acceptance/flows/) - For multi-component user flow tests with Cypress
- [Acceptance Tests](acceptance-tests.md) - For user story validation
