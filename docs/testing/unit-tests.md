# Unit Tests

## Overview

Unit tests verify individual functions, utilities, and services in isolation. They are the fastest tests and form the base of the test pyramid.

## Tool

- **Vitest** - Fast, Jest-compatible test runner

## Location

```
tests/unit/
├── i18n/            # i18n helper tests
├── routes/          # API route handler tests (Integration)
├── security/        # Security unit tests
├── services/        # Service layer tests
├── stores/          # Store logic tests
├── utils/           # Utility function tests
└── *.test.js        # Test files
```

## What to Test

### ✅ Test These:

- Utility functions (formatting, validation, sanitization)
- Zod schemas (validation logic)
- Service functions (API data transformation)
- i18n helpers and resolvers
- Store logic
- API route handlers (Integration Tests)
- Pure functions (no side effects)
- Edge cases and error handling

### ❌ Don't Test:

- React components (use Cypress component tests)
- DOM manipulation (use Cypress)
- Integration behavior (use integration tests for routes)
- Acceptance user flows (use Cypress Acceptance tests)

## Example

```js
// tests/unit/utils/format.test.js
import { formatRating, formatDate } from '@/utils/format';

describe('formatRating', () => {
  it('formats rating to one decimal', () => {
    expect(formatRating(8.5)).toBe('8.5');
  });

  it('handles null rating', () => {
    expect(formatRating(null)).toBe('N/A');
  });

  it('rounds to one decimal', () => {
    expect(formatRating(8.567)).toBe('8.6');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
  });

  it('handles invalid date', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });
});
```

## Best Practices

1. **Test one thing per test** - Keep tests focused
2. **Use descriptive names** - `it('formats rating to one decimal')`
3. **Arrange-Act-Assert pattern**:
   ```js
   it('formats rating', () => {
     // Arrange
     const rating = 8.5;

     // Act
     const result = formatRating(rating);

     // Assert
     expect(result).toBe('8.5');
   });
   ```
4. **Test edge cases** - null, undefined, empty strings, boundary values
5. **Keep tests fast** - No API calls, no database, no timers
6. **Use mocks for external dependencies** - Mock services, stores, i18n

## Running Tests

```bash
# All unit tests (includes integration tests)
npm run test

# With coverage (excludes Cypress tests)
npm run test:coverage

# Specific file
npx vitest tests/unit/utils/format.test.js
```

## Coverage

- **Goal**: 80% globally (branches, functions, lines, statements)
- **Enforced via**: `vitest.config.js`
- **Excluded from coverage**:
  - Cypress Component Tests (`../../vitest`)
  - Cypress Acceptance Tests (`../../vitest`)
  - Test setup files (`../../vitest`)
  - Test mocks (`../../vitest`)

## Related Documentation

- [Testing Strategy](../testing.md)
- [Integration Tests](integration-tests.md)
- [Component Tests](component-tests.md)
- [Acceptance Tests](acceptance-tests.md)
