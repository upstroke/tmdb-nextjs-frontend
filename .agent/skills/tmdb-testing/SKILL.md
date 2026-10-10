---
name: tmdb-testing
description: Write and maintain unit, integration, component, Cypress acceptance, accessibility, and security tests for the TMDB Next.js frontend using the project test strategy.
version: 0.1.0
---

# TMDB Testing Skill

## Purpose

This skill enables the AI agent to write and maintain tests for the TMDB Next.js frontend. It covers all test levels from unit to acceptance tests.

## Scope

- Unit tests (Vitest, jsdom)
- Integration tests (Vitest, jsdom)
- Component tests (Vitest browser mode, Playwright)
- Acceptance tests (Cypress)
- Accessibility tests (Cypress + `cypress-axe`)
- Security tests (Cypress, see [Security Tests](../../../docs/testing/security-tests.md) and the `tmdb-security` skill)

## Capabilities

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

Do not write component tests in jsdom: it has no layout and cannot check color contrast or real focus behavior.

### 4. Write Acceptance Tests (Cypress)

```js
// cypress/e2e/search/search.cy.js
describe('Search Flow', () => {
  it('finds movies by title', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /search movies/i }).type('Inception{enter}');
    cy.findByText(/Inception/i).should('exist');
  });
});
```

Use Page Objects from `cypress/POM/` for complex flows.

```js
// cypress/e2e/navigation/navigation.cy.js
describe('Navigation', () => {
  it('[NAV-01] loads the homepage without errors', () => {
    base.visit('en-US');
    base.assertPathname('en-US');
  });
});
```

### 5. Write Accessibility Tests (Cypress)

See the `tmdb-accessibility` skill for keyboard, focus, ARIA, and contrast tests.

```js
// cypress/accessibility/accessibility.cy.js
describe('Accessibility: Homepage', () => {
  it('has no detectable accessibility violations', () => {
    cy.visitLocale('en-US');
    cy.checkPageA11y();
  });
});
```

Test keyboard interaction, focus management, and ARIA states in Cypress, for example tabs, modals, and dropdowns.

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

The folder structure and the npm scripts are described only in [`docs/testing.md`](../../../docs/testing.md) and [`README.md`](../../../README.md). Do not copy them into this skill.

## Best Practices

1. **Use Testing Library queries by priority**: `findByRole` first, then `findByLabelText` and `findByText`; use `findByTestId` only when no accessible query fits.
2. **Test user interactions**: Real clicks, typing, navigation
3. **Wait for content**: Use `findBy*` queries instead of `cy.wait()`
4. **Page objects**: For complex flows, use the page object pattern
5. **Accessibility first**: Run `cy.checkA11y()` on every page and after relevant interactions
6. **Test plans**: Keep the test plan of an integration test in sync with its test file

## Documentation

- **Testing Strategy**: [`docs/testing.md`](../../../docs/testing.md)
- **Unit Tests**: [`docs/testing/unit-tests.md`](../../../docs/testing/unit-tests.md)
- **Integration Tests**: [`docs/testing/integration-tests.md`](../../../docs/testing/integration-tests.md)
- **Component Tests**: [`docs/testing/component-tests.md`](../../../docs/testing/component-tests.md)
- **Acceptance Tests**: [`docs/testing/acceptance-tests.md`](../../../docs/testing/acceptance-tests.md)
- **Accessibility**: [`docs/testing/accessibility-audit-checklist.md`](../../../docs/testing/accessibility-audit-checklist.md)
- **Security Tests**: [`docs/testing/security-tests.md`](../../../docs/testing/security-tests.md)
- **Page Objects**: [`docs/testing/page-objects.md`](../../../docs/testing/page-objects.md)
- **Common Rules**: [`docs/testing/common-rules.md`](../../../docs/testing/common-rules.md)

## When to Use

Use this skill when:

- Adding new components
- Implementing new features
- Fixing bugs
- Refactoring code
- Adding new pages or routes
