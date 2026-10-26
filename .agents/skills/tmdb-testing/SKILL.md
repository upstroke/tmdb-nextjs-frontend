---
name: tmdb-testing
description: Write and maintain unit, integration, component, Cypress acceptance, accessibility, and security tests for the TMDB Next.js frontend using the project test strategy. Use when adding, changing, or fixing any test, or when a test plan needs updating.
metadata:
  version: '0.2.2'
---

# TMDB Testing Skill

## Purpose

This skill enables the AI agent to write and maintain tests for the TMDB Next.js frontend. It covers all test levels from unit to acceptance tests.

## Scope

- Unit tests (Vitest, jsdom)
- Integration tests (Vitest, jsdom)
- Component tests (Vitest browser mode, Playwright)
- Acceptance tests (Cypress)
- Accessibility tests (Vitest browser mode for isolated component behavior; Cypress + `cypress-axe` for full-application checks)
- Security tests (Cypress, see [Security Tests](../../../../docs/testing/security-tests.md) and the `tmdb-security` skill)

## Capabilities

The snippets below illustrate test design, not complete runnable files. Inspect the existing tests for actual imports, setup, fixtures, component contracts, and helper definitions before adapting them.

### 1. Write Unit Tests (Vitest)

```js
// vitest/unit/utils/formatHomepageLabel.test.js
// import the function under test from lib/utils/
describe('formatHomepageLabel', () => {
  // Statement coverage: no argument uses the default empty string and returns empty.
  it('returns an empty string when called without arguments', () => {
    expect(formatHomepageLabel()).toBe('');
  });
});
```

Unit tests do not require a separate test plan.

### 2. Write Integration Tests (Vitest)

Integration tests wire real modules together (route handler, service, Zod schemas, pages) and mock only the TMDB network (`globalThis.fetch`). Async server components are rendered with `render(await Page(...))`. Assert on the rendered DOM (roles, text).

```js
// vitest/integration/<topic>/<topic>.test.jsx
it('uses the id of a movie search result to render the movie detail page', async () => {
  // Arrange: fetch router answers TMDB endpoints from the fixture
  // Act: call the search route, then render the page with the first result id
  render(await MovieDetailPage({ params: Promise.resolve({ locale, id }) }));
  // Assert
  expect(screen.getByText(movie.title)).toBeInTheDocument();
});
```

The page `DialogMessage` calls `HTMLDialogElement.showModal`, which jsdom does not implement. Stub it in `beforeEach` and assert only the message text. Check in Cypress that the dialog is really open and visible.

### 3. Write Component Tests (Vitest browser mode)

```js
// Schematic component test; follow the existing component's actual contract.
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

Do not write component tests in jsdom: it has no layout and cannot check color contrast or real focus behavior.

### 4. Write Acceptance Tests (Cypress)

```js
// Schematic search flow; use the existing locale and network setup.
describe('Search Flow', () => {
  it('finds movies by title', () => {
    cy.visitLocale('en-US');
    cy.findByRole('searchbox', { name: /search movies/i }).type('Inception{enter}');
    cy.findByText(/Inception/i).should('exist');
  });
});
```

Use Page Objects from `cypress/POM/` for complex flows.

```js
// Schematic navigation example; initialize base with the existing BasePage factory.
describe('Navigation', () => {
  it('[NAV-01] loads the homepage without errors', () => {
    base.visit('en-US');
    base.assertPathname('en-US');
  });
});
```

### 5. Write Accessibility Tests

See the `tmdb-accessibility` skill for keyboard, focus, ARIA, and contrast tests.

```js
// Schematic full-page accessibility check.
describe('Accessibility: Homepage', () => {
  it('has no detectable accessibility violations', () => {
    cy.visitLocale('en-US');
    cy.checkPageA11y();
  });
});
```

Use Vitest browser mode for keyboard interaction, focus management, and ARIA states of an isolated component, including TypeHeadSearch and TabGroupe. Use Cypress for page-level and full-application behavior, including dialogs, cross-page navigation, and interactions that require the running app. See the accessibility test plan's Covered in Vitest section.

### 6. Write Security Tests (Cypress)

Security specs live in `cypress/e2e/security/`. Manipulated input must give a `400`, an empty result, or a fallback to defaults, never a `5xx`. Read the `tmdb-security` skill and the test plan before adding a test.

```js
// cypress/e2e/security/list-api.cy.js
describe('Security: list API routes', () => {
  it('does not return a server error for a page above the TMDB limit', () => {
    cy.request({ url: '/api/en-US/movies', qs: { page: 501 }, failOnStatusCode: false }).then(
      (res) => {
        expect(res.status).to.be.lessThan(500);
      }
    );
  });
});
```

Do not use `Cypress.env()` in specs. `allowCypressEnv` is `false`, so read env values with `cy.env()`.

## Test Structure and Scripts

The folder structure and the npm scripts are described in [`docs/testing.md`](../../../../docs/testing.md) and [`README.md`](../../../../README.md). Refer to them instead of maintaining another complete inventory in this skill.

## Keep Tests, Test Plans and Docs in Sync

Whenever you fix, change, add, or delete an integration, component, acceptance, accessibility, or security test, update the matching documentation in the same change. Do this when a test fails because the component behavior changed, and also when you only repair a test.

Unit tests do not require a separate test plan. When a unit test changes, update affected documentation only when the documented behavior, commands, structure, or project rules change.

1. **Test plan**: For integration, component, acceptance, accessibility, and security tests, open the test plan next to the test file (for example `vitest/component/typeheadsearch/typeheadsearch-testplan.md`). Update the test case table, the detailed test case, the features to be tested, and the risks and limitations.
2. **Paths and commands**: The test file path and the execution command in the plan must match the real file location.
3. **IDs**: Keep existing test case IDs stable. A new test gets the next free number. A removed test is deleted from the plan.
4. **Names**: The test name, the code comment, and the plan entry must describe the same behavior. If the assertion and the name disagree, fix the test or the name.
5. **Behavior changes**: If the behavior itself changed, also check `README.md`, `AGENTS.md`, `docs/testing.md`, `docs/testing/*.md`, and the accessibility checklist.
6. **Related tests**: Search for other tests that rely on the same behavior (selectors, text, key events) and adapt them before the next test run.
7. **Summary**: Name the updated test plan and docs in the commit message or pull request description.

## Best Practices

1. **Use Testing Library queries by priority**: `findByRole` first, then `findByLabelText` and `findByText`; use `findByTestId` only when no accessible query fits.
2. **Test user interactions**: Real clicks, typing, navigation.
3. **Wait for content**: Use retryable queries and assertions; avoid arbitrary time-based waits. Use request aliases when waiting for a specific Cypress network request.
4. **Page objects**: Use existing Cypress Page Objects for complex application flows, not as Vitest helpers.
5. **Accessibility first**: Use the project wrapper `cy.checkPageA11y()` on pages and after relevant interactions in accessibility scenarios; do not substitute direct axe calls without inspecting the wrapper and test requirements.
6. **Test plans**: Keep the test plan of every integration, component, acceptance, accessibility, and security test file in sync with its test file. Unit tests do not require a separate test plan; see [Keep Tests, Test Plans and Docs in Sync](#keep-tests-test-plans-and-docs-in-sync).

## Documentation

- **Testing Strategy**: [`docs/testing.md`](../../../../docs/testing.md)
- **Unit Tests**: [`docs/testing/unit-tests.md`](../../../../docs/testing/unit-tests.md)
- **Integration Tests**: [`docs/testing/integration-tests.md`](../../../../docs/testing/integration-tests.md)
- **Component Tests**: [`docs/testing/component-tests.md`](../../../../docs/testing/component-tests.md)
- **Acceptance Tests**: [`docs/testing/acceptance-tests.md`](../../../../docs/testing/acceptance-tests.md)
- **Accessibility**: [`docs/testing/accessibility-audit-checklist.md`](../../../../docs/testing/accessibility-audit-checklist.md)
- **Accessibility Test Plan**: [`cypress/accessibility/accessibility-testplan.md`](../../../../cypress/accessibility/accessibility-testplan.md)
- **Security Tests**: [`docs/testing/security-tests.md`](../../../../docs/testing/security-tests.md)
- **Page Objects**: [`docs/testing/page-objects.md`](../../../../docs/testing/page-objects.md)
- **Common Rules**: [`docs/testing/common-rules.md`](../../../../docs/testing/common-rules.md)

## When to Use

Use this skill when:

- Adding new components
- Implementing new features
- Fixing bugs
- Fixing or changing failing tests
- Refactoring code
- Adding new pages or routes
