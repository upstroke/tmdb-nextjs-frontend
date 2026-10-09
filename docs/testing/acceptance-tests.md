# Acceptance Tests

## Overview

Acceptance tests verify the application from the **user's perspective**. They are organized by **business functionality**, not technology.

## Test Structure

```
tests/cypress/acceptance/
├── components/      # Funktionale Abnahmetests (Components)
├── flows/           # Funktionale Abnahmetests (User Journeys)
└── accessibility/   # Accessibility Abnahmetests (WCAG)
```

**No Features folder** – Feature acceptance criteria are documented in component stories.

---

## Components

**Components** are **UI components with acceptance criteria** documented in stories.

### Examples

| Component       | User Story                                         | Test Folder               |
| --------------- | -------------------------------------------------- | ------------------------- |
| **CardDefault** | "Display movie/TV card with poster, title, rating" | `components/cardDefault/` |
| **SearchInput** | "Search for movies and TV shows"                   | `components/searchInput/` |
| **Navigation**  | "Navigate to Home, Movies, TV Shows"               | `components/navigation/`  |
| **TabGroupe**   | "Select season of a TV show"                       | `components/tabGroupe/`   |

### Structure per Component

```
components/cardDefault/
├── CardDefault-Testplan.md   # ISTQB test plan with Gherkin scenarios
└── cardDefault.cy.js         # Test implementation
```

### Example

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
      rating: 7.5
    };

    card.mount(movieData);
    card.title().should('contain.text', 'Test Movie');
    card.rating().should('contain.text', '7.5');
  });
});
```

---

## Flows

**Flows** are **user journeys** across multiple pages/components.

### Examples

| Flow                  | User Journey                                       | Test Folder                |
| --------------------- | -------------------------------------------------- | -------------------------- |
| **MovieDetail**       | "Open movie detail page from homepage"             | `flows/movieDetail/`       |
| **TvShowDetail**      | "Open TV show detail with season selection"        | `flows/tvShowDetail/`      |
| **FindAndWatchMovie** | "Search movie → View detail → See watch providers" | `flows/findAndWatchMovie/` |

### Structure per Flow

```
flows/movieDetail/
├── MovieDetail-Testplan.md   # ISTQB test plan with user journey
└── movieDetail.cy.js         # Test implementation (E2E)
```

### Example

```javascript
// tests/cypress/acceptance/flows/movieDetail/movieDetail.cy.js
describe('Movie Detail Flow', () => {
  it('opens movie detail from homepage', () => {
    cy.visitWithLocale('/', 'en-US');
    cy.interceptTmdb();

    cy.findByTestId('card-default').first().click();
    cy.url().should('include', '/movies/');
    cy.findByRole('heading', { level: 1 }).should('be.visible');
  });
});
```

---

## Accessibility

**Accessibility tests** verify WCAG 2.1/2.2 compliance. They are **acceptance tests** with special tooling.

### Examples

| Page               | A11y Test Folder              |
| ------------------ | ----------------------------- |
| **Homepage**       | `accessibility/homepage/`     |
| **Movie Detail**   | `accessibility/movieDetail/`  |
| **TV Show Detail** | `accessibility/tvShowDetail/` |

### Structure per A11y Test

```
accessibility/homepage/
├── Homepage-A11y-Testplan.md   # WCAG audit checklist
└── homepage.cy.js              # A11y test implementation
```

### Example

```javascript
// tests/cypress/acceptance/accessibility/homepage/homepage.cy.js
describe('Homepage Accessibility', () => {
  it('passes WCAG 2.1 AA audit', () => {
    cy.visitWithLocale('/', 'en-US');
    cy.checkPageA11y();
  });
});
```

---

## Component vs. Flow vs. Accessibility

| Dimension     | Component                        | Flow                         | Accessibility                        |
| ------------- | -------------------------------- | ---------------------------- | ------------------------------------ |
| **Scope**     | Single component                 | Multiple pages               | Single page                          |
| **Test-Type** | Component Testing (`cy.mount()`) | E2E Testing (`cy.visit()`)   | E2E Testing (`cy.visit()`)           |
| **Speed**     | Fast (< 5s)                      | Slower (> 10s)               | Medium (~5s)                         |
| **Focus**     | Acceptance criteria              | User journey                 | WCAG compliance                      |
| **Example**   | "Card renders title"             | "Homepage → Search → Detail" | "All elements have accessible names" |

---

## What to Test

### ✅ Test These:

- **Components**: Acceptance criteria from stories
- **Flows**: Complete user journeys
- **Accessibility**: WCAG 2.1/2.2 AA compliance
- **Critical paths**: Happy paths + important edge cases

### ❌ Don't Test:

- Implementation details
- Every possible user path (too slow)
- Visual details (use visual regression tools)
- Features already covered by component stories

---

## Best Practices

1. **Organize by business functionality** – Not technology
2. **Use Page Objects** – For reusable selectors (see [Page Objects](page-objects.md))
3. **Keep tests independent** – Each test runs alone
4. **Use realistic data** – Fixtures from `../../vitest`
5. **Assert on user-visible content** – Text, roles, labels
6. **One test plan per component/flow** – ISTQB format with Gherkin
7. **A11y tests per page** – WCAG audit checklist

---

## Running Tests

```bash
# All acceptance tests (component + flow + a11y)
npm run test:component
npm run test:e2e

# Specific component test
npx cypress run --component --spec "tests/cypress/acceptance/components/cardDefault/cardDefault.cy.js"

# Specific flow test
npx cypress run --e2e --spec "tests/cypress/acceptance/flows/movieDetail/movieDetail.cy.js"

# Specific a11y test
npx cypress run --e2e --spec "tests/cypress/acceptance/accessibility/homepage/homepage.cy.js"
```

---

## Cypress Configuration

### `cypress.config.js`

```js
export default defineConfig({
  e2e: {
    specPattern: 'tests/cypress/acceptance/**/*.cy.{js,jsx}'
    // ...
  },
  component: {
    specPattern: 'tests/cypress/acceptance/**/*.cy.{js,jsx}'
    // ...
  }
});
```

**Both patterns are identical** – tests are organized by **business functionality**, not technology.

---

## Related Documentation

- [Testing Strategy](../testing.md)
- [Component Tests](component-tests.md)
- [Page Objects](page-objects.md)
- [Accessibility Audit](accessibility-audit-checklist.md)
