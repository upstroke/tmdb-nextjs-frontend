# Component Tests

## Overview

Component tests verify that individual React components work correctly in isolation. Unlike unit tests, component tests render the actual component with its dependencies (context, providers, etc.).

## Test Levels

| Level | Tool | Path | Focus |
|-------|------|------|-------|
| **Component** | Cypress | `tests/cypress/acceptance/components/` | Individual components |
| **Acceptance** | Cypress | `tests/cypress/acceptance/flows/` | Complete user flows |

## Scripts

```bash
# All component tests
npm run test:component

# Component tests in watch mode
npm run test:component:watch
```

## Component Test Structure

### Example: SearchBar Component

```js
// tests/cypress/acceptance/components/search-bar.cy.js
describe('SearchBar Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders search input', () => {
    cy.findByRole('searchbox', { name: /search movies/i }).should('exist');
  });

  it('shows loading state during search', () => {
    cy.findByRole('searchbox', { name: /search movies/i })
      .type('Inception{enter}');
    cy.findByTestId('loading-spinner').should('exist');
  });

  it('displays search results', () => {
    cy.findByRole('searchbox', { name: /search movies/i })
      .type('Inception{enter}');
    cy.findByText(/Inception/i).should('exist');
  });
});
```

### Example: MovieCard Component

```js
// tests/cypress/acceptance/components/movie-card.cy.js
describe('MovieCard Component', () => {
  it('renders movie title and poster', () => {
    cy.mount(<MovieCard movie={mockMovie} />);
    cy.findByText(mockMovie.title).should('exist');
    cy.findByAltText(mockMovie.title).should('exist');
  });

  it('shows rating with correct stars', () => {
    cy.mount(<MovieCard movie={mockMovie} />);
    cy.findByTestId('rating-stars').should('have.length', 5);
  });
});
```

## Best Practices

### 1. Use Testing Library Queries

```js
// ✅ Good: Semantic queries
cy.findByRole('button', { name: /search/i });
cy.findByLabelText(/search movies/i);
cy.findByTestId('movie-card');

// ❌ Avoid: CSS selectors
cy.get('.search-button');
cy.get('[data-cy="search"]');
```

### 2. Test User Interactions

```js
// ✅ Good: Real user interactions
cy.findByRole('searchbox').type('Inception{enter}');
cy.findByRole('button', { name: /search/i }).click();

// ❌ Avoid: Direct DOM manipulation
cy.get('input').invoke('val', 'Inception').trigger('change');
```

### 3. Wait for Async Operations

```js
// ✅ Good: Wait for content
cy.findByText(/Inception/i); // Automatically retries

// ❌ Avoid: Fixed waits
cy.wait(1000);
```

### 4. Use Page Objects for Complex Components

```js
// tests/cypress/acceptance/pages/search-page.js
export class SearchPage {
  visit() {
    cy.visit('/');
  }

  search(query) {
    cy.findByRole('searchbox', { name: /search movies/i })
      .type(`${query}{enter}`);
  }

  getMovieCard(title) {
    return cy.findByText(new RegExp(title, 'i')).closest('[data-testid="movie-card"]');
  }
}

// In test file
import { SearchPage } from '../pages/search-page';

describe('SearchBar', () => {
  const searchPage = new SearchPage();

  it('shows results', () => {
    searchPage.visit();
    searchPage.search('Inception');
    searchPage.getMovieCard('Inception').should('exist');
  });
});
```

## Test Coverage

### Components to Test

- [ ] **SearchBar**: Input, loading state, results display
- [ ] **MovieCard**: Title, poster, rating, overview
- [ ] **MovieList**: Grid layout, empty state, pagination
- [ ] **MovieDetail**: All sections (overview, cast, reviews)
- [ ] **Navigation**: Active states, responsive behavior
- [ ] **ErrorBoundary**: Error display, recovery
- [ ] **LoadingSpinner**: Visibility, accessibility

## Accessibility Tests

```js
describe('SearchBar Accessibility', () => {
  it('has accessible label', () => {
    cy.findByLabelText(/search movies/i).should('exist');
  });

  it('announces loading state to screen readers', () => {
    cy.findByRole('searchbox').type('Inception{enter}');
    cy.findByRole('status').should('contain', 'Loading');
  });

  it('keyboard navigation works', () => {
    cy.findByRole('searchbox').type('Inception{downarrow}{enter}');
    cy.focused().should('have.attr', 'data-testid', 'movie-card');
  });
});
```

## Documentation

- **Component Tests Skill**: [`.agent/skills/tmdb-testing/SKILL.md`](../../.agent/skills/tmdb-testing/SKILL.md)
- **Testing Strategy**: [`docs/testing.md`](./testing.md)
- **Page Objects**: [`docs/testing/page-objects.md`](./page-objects.md)
