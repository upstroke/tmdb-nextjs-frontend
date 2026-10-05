# Component Tests

## Overview

Component tests verify individual React components in isolation. They ensure components render correctly and handle user interactions properly.

## Tool

- **Cypress Component Testing** - Fast, browser-based component testing

## Location

```
tests/cypress/component/
├── components/    # Component test files
└── *.cy.js        # Test files
```

## What to Test

### ✅ Test These:
- Component rendering with props
- User interactions (clicks, typing, etc.)
- State changes and re-renders
- Conditional rendering
- Event handlers

### ❌ Don't Test:
- Implementation details
- Child component internals (mock them)
- API calls (mock services)
- Full user flows (use acceptance tests)

## Example

```js
// tests/cypress/component/MovieCard.cy.js
import { MovieCard } from '@/components/MovieCard';

describe('MovieCard', () => {
  const mockMovie = {
    id: 1,
    title: 'Inception',
    poster_path: '/inception.jpg',
    vote_average: 8.5,
    release_date: '2010-07-16',
  };

  it('renders movie information', () => {
    cy.mount(<MovieCard movie={mockMovie} />);
    
    cy.findByText('Inception').should('be.visible');
    cy.findByText('8.5').should('be.visible');
    cy.findByAltText('Inception poster').should('have.attr', 'src');
  });

  it('calls onClick when clicked', () => {
    const onClick = cy.stub().as('handleClick');
    cy.mount(<MovieCard movie={mockMovie} onClick={onClick} />);
    
    cy.findByTestId('movie-card').click();
    cy.get('@handleClick').should('have.been.calledOnce');
  });

  it('shows fallback for missing poster', () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: null };
    cy.mount(<MovieCard movie={movieWithoutPoster} />);
    
    cy.findByAltText('Inception poster')
      .should('have.attr', 'src')
      .and('include', '/movie-placeholder.svg');
  });
});
```

## Best Practices

1. **Mount one component** - Test the component in isolation
2. **Use realistic props** - Match real data structure
3. **Test user interactions** - Clicks, typing, selections
4. **Assert on visible content** - What the user sees
5. **Mock children and APIs** - Keep tests focused
6. **Use data-testid** - For stable selectors

## Running Tests

```bash
# All component tests (headless)
npm run test:component

# Open Cypress UI
npm run test:component:ui

# Run specific test
npx cypress run --component --spec "tests/cypress/component/MovieCard.cy.js"
```

## Test Structure

```js
describe('ComponentName', () => {
  it('does something', () => {
    cy.mount(<Component prop={value} />);
    // Assertions
  });
});
```

## Difference from Acceptance Tests

| Component Tests | Acceptance Tests |
|-----------------|------------------|
| Single component | Multiple pages |
| Isolated | Full application |
| Fast (< 1s) | Slower (seconds) |
| Mock data | Real or fixture data |
| Implementation focus | User flow focus |

## Documentation

- [Testing Strategy](../testing.md)
- [Acceptance Tests](./acceptance-tests.md)
- [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview)
