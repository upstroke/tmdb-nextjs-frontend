# TMDB Testing Skill

## Purpose

This skill enables the AI agent to write and maintain comprehensive tests for the TMDB Next.js frontend. It covers all test levels from unit to acceptance tests.

## Scope

- Unit tests (Vitest)
- Component tests (Cypress)
- Integration tests (Cypress)
- Acceptance tests (Cypress)
- Accessibility tests (axe-core)
- Security tests (Vitest + Cypress)

## Capabilities

### 1. Write Unit Tests (Vitest)

```js
// tests/vitest/utils/format.test.js
import { formatRating } from '@/utils/format';

describe('formatRating', () => {
  it('formats rating to one decimal', () => {
    expect(formatRating(8.5)).toBe('8.5');
  });

  it('handles null rating', () => {
    expect(formatRating(null)).toBe('N/A');
  });
});
```

### 2. Write Component Tests (Cypress)

```js
// tests/cypress/acceptance/components/movie-card.cy.js
describe('MovieCard Component', () => {
  it('renders movie title and poster', () => {
    cy.mount(<MovieCard movie={mockMovie} />);
    cy.findByText(mockMovie.title).should('exist');
    cy.findByAltText(mockMovie.title).should('exist');
  });
});
```

### 3. Write Acceptance Tests (Cypress)

```js
// tests/cypress/acceptance/flows/search.cy.js
describe('Search Flow', () => {
  it('finds movies by title', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /search movies/i })
      .type('Inception{enter}');
    cy.findByText(/Inception/i).should('exist');
  });
});
```

### 4. Write Accessibility Tests

```js
// tests/cypress/acceptance/accessibility/homepage.cy.js
describe('Homepage Accessibility', () => {
  it('has no accessibility violations', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

## Test Structure

```
tests/
├── vitest/              # Unit tests
│   ├── utils/
│   └── security/
└── cypress/
    └── acceptance/
        ├── components/  # Component tests
        ├── flows/       # Acceptance tests
        └── accessibility/
```

## Scripts

```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# Component tests only
npm run test:component

# Acceptance tests only
npm run test:acceptance

# Accessibility audit
npm run test:a11y

# Security tests
npm run test:security
```

## Best Practices

1. **Use Testing Library queries**: `findByRole`, `findByLabelText`, `findByTestId`
2. **Test user interactions**: Real clicks, typing, navigation
3. **Wait for content**: Use `findBy*` queries instead of `cy.wait()`
4. **Page objects**: For complex flows, use page object pattern
5. **Accessibility first**: Run axe-core on every page

## Documentation

- **Testing Strategy**: [`docs/testing.md`](../../docs/testing.md)
- **Unit Tests**: [`docs/testing/unit-tests.md`](../../docs/testing/unit-tests.md)
- **Component Tests**: [`docs/testing/component-tests.md`](../../docs/testing/component-tests.md)
- **Acceptance Tests**: [`docs/testing/acceptance-tests.md`](../../docs/testing/acceptance-tests.md)
- **Accessibility**: [`docs/testing/accessibility-audit-checklist.md`](../../docs/testing/accessibility-audit-checklist.md)
- **Security Tests**: [`docs/testing/security-tests.md`](../../docs/testing/security-tests.md)
- **Page Objects**: [`docs/testing/page-objects.md`](../../docs/testing/page-objects.md)

## When to Use

Use this skill when:
- Adding new components
- Implementing new features
- Fixing bugs
- Refactoring code
- Adding new pages or routes
