# Page Objects for Acceptance Tests

## Purpose

Page Objects encapsulate reusable Cypress selectors and interactions for a page or logical flow. They help keep acceptance tests readable and reduce duplicated UI knowledge.

## Location and Scope

Cypress Page Objects live in `cypress/POM/`. Existing objects include `BasePage.js`, `HomePage.js`, `HeaderPage.js`, `ListPage.js`, and `CardDefault.js`. They are Cypress-specific helpers, not shared Vitest utilities.

Use them in Cypress application-level tests where they simplify repeated behavior. Do not import Cypress Page Objects into Vitest unit, integration, or component tests.

## Existing Factory Pattern

The existing `HomePage` and `BasePage` objects are factory functions, not classes. Call them without `new`, and use the methods actually returned by the factory.

The following illustrates usage from a spec directly under `cypress/e2e/`:

```js
import { HomePage } from '../POM/HomePage';

const homePage = HomePage();

describe('Homepage', () => {
  it('shows the homepage content', () => {
    homePage.visit('en-US');
    homePage.page().should('be.visible');
  });
});
```

Adjust the relative import to the actual spec location. `HomePage.visit(locale)` requires an explicit locale; do not assume all Page Objects have the same default or return value.

## Rules

1. Inspect the existing object and its callers before extending it. Preserve the local factory pattern.
2. Group selectors and interactions by a coherent page or responsibility; do not create an abstraction for every assertion.
3. Prefer role, accessible-name, text, and label queries where appropriate. The Testing Library label query is `findByLabelText`, not `findByLabel`. Preserve useful existing selectors unless changing them is part of the task.
4. Return Cypress chains from query helpers when callers need to assert on them. Do not assume action helpers return `this` or support fluent chaining.
5. Keep scenario-specific assertions in specs. Existing reusable assertion helpers, such as `BasePage.assertPathname()` and `HomePage.assertTitleVisible()`, are part of the current implementation; do not refactor them merely to match a blanket no-assertions rule.
6. Check what a helper actually asserts. `HomePage.assertTitleVisible()` currently checks visibility of the page container, not a heading.
7. Update affected callers and test plans whenever a helper's contract changes.

## Boundaries

Vitest browser tests cover isolated components. Integration tests exercise real application modules with controlled external network responses. Cypress Page Objects support the running application's acceptance, accessibility, or security scenarios where appropriate.

## Related Documentation

- [Acceptance Tests](acceptance-tests.md)
- [Component Tests](component-tests.md)
- [Testing Strategy](../testing.md)
- [Common Test Rules](common-rules.md)
