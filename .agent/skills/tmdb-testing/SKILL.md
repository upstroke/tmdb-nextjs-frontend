# TMDB Testing Skill

## Purpose

This skill enables the AI agent to write and maintain comprehensive tests for the TMDB Next.js frontend. It covers all test levels from unit to acceptance tests.

## Scope

- Unit tests (Vitest)
- Component tests (Vitest)
- Integration tests (Cypress)
- Acceptance tests (Cypress)
- Accessibility tests (axe-core)
- Security tests (Vitest + Cypress)

## Capabilities

### 1. Write Unit Tests (Vitest)

```js
// vitest/unit/utils/formatHomepageLabel.test.js
import { formatRating } from '@/utils/format';

describe('formatHomepageLabel', () => {
  // Statement coverage: no argument uses the default empty string and returns empty.
  it('returns an empty string when called without arguments', () => {
    expect(formatHomepageLabel()).toBe('');
  });
});
```

### 2. Write Component Tests (Cypress)

```js
// vitest/component/CardDefault.browser.test.jsx
// Statement Coverage: Covers normal variables, element rendering, custom styles.
it('renders movie card with correct route, title, genres, date, rating and certification', () => {
  render(
    <CardDefault
      id={movie.id}
      mediaType="movie"
      title={movie.title}
      date={movie.releaseDate}
      rating={movie.voteAverage}
      certification={movie.certification}
      genres={genres}
      imageUrl={movie.posterUrl}
    />
  );

  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', `/en-US/movies/${movie.id}`);
  expect(screen.getByText(movie.title)).toBeInTheDocument();

  const timeElement = document.querySelector(`time[datetime="${movie.releaseDate}"]`);
  expect(timeElement).toBeInTheDocument();
});
```

### 3. Write Acceptance Tests (Cypress)

```js
// tests/cypress/acceptance/flows/search.cy.js
describe('Search Flow', () => {
  it('finds movies by title', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /search movies/i }).type('Inception{enter}');
    cy.findByText(/Inception/i).should('exist');
  });
});
```

### 4. Write Accessibility Tests

```js
// cypress/e2e/navigation/navigation.cy.js
describe('Navigation', () => {
  it('[NAV-01] loads the homepage without errors', () => {
    base.visit('en-US');
    base.assertPathname('en-US');
  });
});
```

## Test Structure

```
cypress/
│   ├── accessibility/
│   ├── e2e/
│   ├── fixtures/
│   ├── POM/
│   └── support/
│
└── vitest
    ├── component/
    ├── fixtures/
    ├── mocks/
    ├── reporters
    ├── setup
    └── unit
```

## Scripts

```bash
"dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:component": "vitest run --project browser vitest/component",
    "test:integration": "vitest run --project browser vitest/integration",
    "test:browser": "vitest run --project browser",
    "test:e2e": "cypress run --e2e --browser chrome",
    "test:e2e:open": "cypress open --e2e --browser chrome",
    "test:coverage": "vitest run --coverage"


# All tests
npm run test

# Unit tests only
npm run test:unit

# Component tests only
npm run test:component

# e2ee tests only
npm run test:e2e

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
