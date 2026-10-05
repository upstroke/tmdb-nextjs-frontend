# Integration Tests

## Overview

Integration tests verify the interaction between multiple modules or services. They ensure that different parts of the application work together correctly.

## Tool

- **Vitest** with **Testing Library** and **MSW** (Mock Service Worker)

## Location

```
tests/vitest/
├── integration/     # Integration test files
└── *.test.js        # Test files
```

## What to Test

### ✅ Test These:

- Page or section rendering with mocked data
- Data flow from API → Service → Component
- Multiple components working together
- State management across components
- Real integration scenarios

### ❌ Don't Test:

- Single isolated functions (use unit tests)
- Full E2E flows (use Cypress acceptance tests)
- Pure UI components (use Cypress component tests)

## Example

```js
// tests/vitest/integration/movie-search.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/msw.handlers';
import { MovieSearch } from '@/components/MovieSearch';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('displays search results after fetching', async () => {
  render(<MovieSearch />);

  // User action
  await userEvent.type(screen.getByRole('searchbox'), 'Inception{enter}');

  // Wait for results
  await waitFor(() => {
    expect(screen.getByText(/Inception/i)).toBeInTheDocument();
  });

  // Verify data reached the component
  const movieCards = screen.getAllByTestId('movie-card');
  expect(movieCards).toHaveLength(10);
});
```

## Best Practices

1. **Mock external APIs** - Use MSW for realistic API mocking
2. **Test real integration** - Don't mock internal modules
3. **Assert on rendered output** - Check what the user sees
4. **Keep tests focused** - One integration scenario per test
5. **Use realistic test data** - Mock data should match real API responses

## Running Tests

```bash
# All integration tests
npm run test:integration

# Watch mode
npm run test:vitest:watch

# With coverage
npm run test:vitest:coverage
```

## Difference from Unit Tests

| Unit Tests             | Integration Tests         |
| ---------------------- | ------------------------- |
| Single function/module | Multiple modules together |
| Mock all dependencies  | Mock only external APIs   |
| Very fast (< 10ms)     | Fast (< 100ms)            |
| Isolated               | Real integration          |

## Documentation

- [Testing Strategy](../testing.md)
- [Unit Tests](./unit-tests.md)
- [Component Tests](./component-tests.md)
