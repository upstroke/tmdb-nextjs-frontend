# Component Tests

Component tests verify **individual UI components** with acceptance criteria from stories.

## Location

```
tests/cypress/acceptance/components/   # Component test files
*.cy.js                                 # Test files (Cypress convention)
```

**Note:** Component tests are now in `acceptance/components/` – organized by **business functionality**, not technology.

---

## When to Use Component Tests

Component tests are ideal for:

- ✅ Testing individual React components in isolation
- ✅ Verifying component behavior with different props and states
- ✅ Testing user interactions within a single component
- ✅ Validating acceptance criteria from stories
- ✅ Faster feedback than Flow tests (no full app boot required)

---

## When to Use Flow Tests Instead

- **Flow Tests** (`tests/cypress/acceptance/flows/`): Complete user journeys, cross-page navigation
- **Integration Tests** (`tests/unit/routes/`): API route handlers with service integration (Vitest)
- **Unit Tests** (`tests/unit/`): Isolated utility functions, services, stores (Vitest)

---

## Example

```javascript
// tests/cypress/acceptance/components/cardDefault/cardDefault.cy.js
import { CardDefault } from '../../POM/CardDefault';

const card = CardDefault();

describe('CardDefault Component', () => {
  it('renders movie card with title and rating', () => {
    const movieData = {
      id: 123,
      mediaType: 'movie',
      title: 'Test Movie',
      rating: 7.5,
    };

    card.mount(movieData);
    card.title().should('contain.text', 'Test Movie');
    card.rating().should('contain.text', '7.5');
  });
});
```

---

## Running Tests

```bash
# All component tests
npm run test:component

# Open Cypress Component UI
npx cypress open --component

# Run specific component test
npx cypress run --component --spec "tests/cypress/acceptance/components/cardDefault/cardDefault.cy.js"
```

---

## Test Structure

```javascript
describe('Component Name', () => {
  it('should render with props', () => {
    // Mount component
    // Assert on output
  });

  it('should handle user interaction', () => {
    // Mount component
    // Simulate interaction
    // Assert on result
  });
});
```

---

## Best Practices

1. **Use Page Objects** – Reusable selectors in `tests/cypress/POM/`
2. **Test acceptance criteria** – From component stories
3. **Keep tests independent** – Each test mounts its own component instance
4. **Use realistic props** – Match story data
5. **Assert on user-visible content** – Text, roles, labels
6. **One test plan per component** – ISTQB format in `*-Testplan.md`

---

## Configuration

### Cypress Config

```js
// cypress.config.js
export default defineConfig({
  component: {
    specPattern: 'tests/cypress/acceptance/**/*.cy.{js,jsx}',
    supportFile: 'tests/cypress/support/component.js',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
```

**Note:** `specPattern` is identical for both Component and E2E tests – organized by business functionality.

---

## Related Documentation

- [Testing Strategy](../testing.md)
- [Acceptance Tests](acceptance-tests.md)
- [Page Objects](page-objects.md)
- [Unit Tests](unit-tests.md)
