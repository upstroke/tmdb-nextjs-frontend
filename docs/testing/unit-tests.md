# Unit Tests

## Overview

Unit tests verify individual functions, utilities, and services in isolation. They are the fastest tests and form the base of the test pyramid.

## Tool

- **Vitest** - Fast, Jest-compatible test runner

## Location

```
tests/vitest/
├── utils/           # Utility function tests
├── services/        # Service layer tests
├── schemas/         # Zod schema tests
├── security/        # Security unit tests
└── *.test.js        # Test files
```

## What to Test

### ✅ Test These:
- Utility functions (formatting, validation, sanitization)
- Zod schemas (validation logic)
- Service functions (API data transformation)
- Pure functions (no side effects)
- Edge cases and error handling

### ❌ Don't Test:
- React components (use Cypress component tests)
- DOM manipulation (use Cypress)
- Integration behavior (use integration tests)

## Example

```js
// tests/vitest/utils/format.test.js
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

## Running Tests

```bash
# All unit tests
npm run test:unit

# Watch mode
npm run test:vitest:watch

# With coverage
npm run test:vitest:coverage

# Specific file
npx vitest tests/vitest/utils/format.test.js
```

## Coverage

- **Goal**: 80% globally (branches, functions, lines, statements)
- **Enforced via**: `vitest.config.js`

## Documentation

- [Testing Strategy](../testing.md)
- [Integration Tests](./integration-tests.md)
- [Security Tests](./security-tests.md)
