# Integration Tests

This guide defines the project rules for Vitest integration tests. Use integration tests when multiple controlled parts of the application must work together without a browser.

Component tests are not part of Vitest. Isolated UI components are tested with Cypress Component Testing (see `acceptance-tests.md`, section "Component Tests"). Vitest covers unit tests and integration tests.

## Scope

Integration tests are the right choice for:

- route behavior with mocked load data or controlled dependencies
- interaction between stores, services, and helper modules
- data flow from mocked API responses through mapping and state logic
- async states that are driven by mocked services
- route-level composition where several local parts collaborate

Do not use an integration test when a small unit test is sufficient. Do not use it for isolated component rendering, ARIA semantics, or keyboard handling of a single component; use Cypress Component Testing instead. Do not use it as a substitute for a real end-to-end flow that depends on browser navigation, layout, or multi-page behavior.

Automated axe-core scans and browser-dependent focus behavior belong to Cypress.

## General Rules

- Use Vitest, with Testing Library only where route-level rendering is needed.
- Test behavior through observable output whenever possible.
- Prefer queries by role, label, and accessible name when rendering.
- Mock network and external dependencies, but keep collaboration between local parts real.
- Assert user-visible behavior, not internals.
- Keep each test focused on one interaction or one state.

## File Location

Place integration tests under `tests/integration/`.

Typical structure:

```text
tests/integration/
  routes/
```

Use `routes/` for route-specific behavior or route composition. There is no `components/` directory: component tests live in `tests/cypress/component/`.

## Rendering and Queries

When a route test renders output, prefer Testing Library queries in this order:

1. `getByRole`
2. `getByLabelText`
3. `getByText`
4. `getByTestId` only when no semantic query is practical

## Async Behavior

When a route or module loads data asynchronously:

- mock the service boundary
- trigger the action that starts loading
- wait for the resulting state with `findBy...` or `waitFor`
- assert loading, success, and error states where relevant

Do not assert arbitrary timeouts.

## Mocking API Requests with MSW

Integration tests use [MSW (Mock Service Worker)](https://mswjs.io/) to intercept
HTTP requests at the network level. MSW replaces the previous `vi.stubGlobal('fetch')`
approach and keeps tests realistic: the code calls `fetch` as usual, MSW
intercepts the request before it reaches the network, and returns fixture data.

### Setup

The MSW Node.js server is started globally in `tests/setup/vitest.js` and is
scoped exclusively to the `integration` Vitest project. Unit tests run in their
own project with no `setupFiles`, so MSW is never active during a unit test run.

The lifecycle hooks in `tests/setup/vitest.js` are:

- `beforeAll` → `server.listen({ onUnhandledRequest: 'warn' })`
- `afterEach` → `server.resetHandlers()` — removes per-test overrides
- `afterAll` → `server.close()`

No setup is needed inside individual test files.

### Default Handlers

`tests/mocks/msw.handlers.js` defines default responses for all internal API routes:

| Route pattern | Returns |
|---|---|
| `GET /api/:locale/movies` | `rawFixtures.moviesPopular` |
| `GET /api/:locale/movies/:id` | `rawFixtures.movieDetail` |
| `GET /api/:locale/tv` | `rawFixtures.tvPopular` |
| `GET /api/:locale/tv/:id/season` | `rawFixtures.tvSeason1` |
| `GET /api/:locale/tv/:id` | `rawFixtures.tvDetail` |
| `GET /api/:locale/search` | `rawFixtures.searchMulti` |
| `GET /api/:locale/genres/movie` | `rawFixtures.genresMovie` |
| `GET /api/:locale/genres/tv` | `rawFixtures.genresTv` |

These defaults are active for every integration test without any additional import.

### Per-Test Overrides

Use `server.use()` to override a handler for a single test. The override is
removed automatically by `server.resetHandlers()` after each test.

```js
import { server } from '$tests/mocks/msw.server.js';
import { tmdbErrorHandler } from '$tests/mocks/msw.handlers.js';

it('shows an error message when the API returns 503', async () => {
  server.use(tmdbErrorHandler('/api/en-US/movies', 503));

  // render and assert error state ...
});
```

`tmdbErrorHandler(urlPattern, status)` returns a one-off handler that responds
with a JSON error body and the given HTTP status code.

### MSW vs. cy.intercept()

| Context | Tool |
|---|---|
| Vitest integration tests | MSW (`msw.server.js`) |
| Vitest unit tests | `vi.stubGlobal('fetch')` |
| Cypress component and acceptance tests | `cy.intercept()` |

Do not use MSW in Cypress tests and do not use `cy.intercept()` in Vitest tests.

## Route Integration Tests

Route integration tests are useful when a route combines:

- load or server data
- route parameters or query parameters
- multiple local parts
- restore or pagination logic
- localized rendering behavior

For route tests, mock only the external boundary and keep the route-level collaboration realistic.

## Assertions

Good integration assertions check:

- visible text and labels where output is rendered
- loading and error states
- state changes after an action
- results of data mapping and state logic

Avoid asserting internal function calls unless that call is itself the contract being tested.

## When to Move a Test

Move a test to Cypress Component Testing when the subject is a single reusable UI component, its ARIA semantics, keyboard handling, or layout.

Move a test to Cypress acceptance level when confidence depends on:

- real routing across pages
- browser history behavior
- viewport-specific layout behavior across pages
- automated axe-core accessibility scans of full pages
- interaction across multiple routes or application layers
