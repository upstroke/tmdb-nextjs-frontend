# Test Documentation

This file provides the high-level testing overview for the project. Read it before creating or changing tests, then continue with the common rules and the guide for the applicable test level.

## Test Levels

The project uses three automated test levels:

- Unit tests with Vitest for isolated utility, store, helper, route, and TMDB API logic
- Integration tests with Vitest for real integration only: a page or section renders with mocked data (msw) and the values reach the components
- Browser tests with Cypress for component behavior (keyboard, focus, ARIA, visibility, contrast), accessibility, and complete user flows

Component tests are not written with Vitest. jsdom has no layout and cannot check color contrast or real focus behavior.

## Accessibility Testing

The project includes automated accessibility testing to support WCAG 2.2 AA compliance.

- Accessibility checks use Cypress together with cypress-axe for automated WCAG A/AA violation detection.
- Accessibility test files are located under `tests/cypress/acceptance/accessibility/`.
- Accessibility test plans remain next to the executable specifications as `*-testplan.md` files.
- Common tags for these tests are `@accessibility` and `@a11y`.

## Test Directory Structure

```text
tests/
  cypress/
    POM/
      BasePage.js
      HeaderPage.js
      HomePage.js
    acceptance/
      accessibility/
        accessibility.spec.js
        accessibility-testplan.md
      components/
        navigation/
          navigation.spec.js
          navigation-testplan.md
      routes/
        homepage.cy.js
    fixtures/          # Cypress-specific fixture data
    support/
      commands.js
      e2e.js
      tmdb.commands.js
  integration/          # Vitest integration tests (true integration only)
  unit/                 # Vitest unit tests
  fixtures/             # Shared domain test data
  mocks/                # Technical mocks for tests
  setup/                # Vitest setup
```

- `tests/unit/` contains isolated Vitest unit tests.
- `tests/integration/` contains Vitest integration tests only. Assert on the rendered DOM (roles, text), not on props. Do not add component tests here.
- `tests/cypress/acceptance/` contains browser-based Cypress tests. Its `routes/`, `components/`, and `accessibility/` subdirectories are peer categories: `routes/` covers individual pages and their visible behavior; `components/` covers component behavior such as keyboard interaction, focus management, and ARIA states (for example navigation and tabs); `accessibility/` covers accessibility checks on pages and interaction states.
- `tests/cypress/POM/` contains Cypress page objects; see `docs/testing/page-objects.md`.
- `tests/cypress/fixtures/` holds Cypress-specific fixtures. `tests/fixtures/` holds shared domain test data; do not merge them as part of the directory migration.
- `tests/cypress/support/` contains Cypress-specific support files and commands. `tests/setup/` contains only the Vitest setup.
- `tests/mocks/` contains reusable mock support for technical dependencies.

Accessibility and navigation have a `*-testplan.md` file next to their specs. The current `routes/homepage.cy.js` does not have a nearby test plan. `cypress.config.js` discovers specs in `tests/cypress/acceptance/` matching `*.cy.js` and the existing `*.spec.js`; use `.cy.js` for new specs.

## Documentation by Test Level

Read the following files in addition to this overview:

- `docs/testing/common-rules.md` for rules shared by all automated tests
- `docs/testing/unit-tests.md` for Vitest unit-test rules
- `docs/testing/integration-tests.md` for Vitest integration-test rules
- `docs/testing/acceptance-tests.md` for Cypress browser-test rules
- `docs/testing/page-objects.md` for Cypress Page Object Model conventions

## Test Commands

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:acceptance
npm run test:acceptance:ui
npm run test:vitest:watch
npm run test:vitest:coverage
```

The `justfile` provides shortcuts for important commands, including `just test-vitest` and `just test-e2e`.

## Cypress Quick Start

Start the dev server first:

```bash
npm run dev
```

Then in a second terminal:

```bash
npm run test:acceptance:ui  # Interactive Cypress UI
npm run test:acceptance     # Headless, single run (suitable for CI)
```

### Custom Commands

| Command | Description |
|---|---|
| `cy.visitLocale(locale, path)` | Navigate to `/{locale}{path}` |
| `cy.checkPageA11y(options?)` | Run axe WCAG 2.2 AA check on current page |
| `cy.i18n(locale?)` | Load i18n translations for a locale from `lib/i18n/ui.json` (defaults to `en-US`) |

#### `cy.i18n(locale?)`

Loads the translation object for the given locale directly from `lib/i18n/ui.json` via `cy.readFile()`. This avoids duplicating translation files into `tests/cypress/fixtures/` and ensures tests always use the current translations.

```js
// Default locale (en-US)
cy.i18n().then((t) => {
  cy.contains(t.labels.searchInput).should('exist');
});

// Specific locale
cy.i18n('de-DE').then((t) => {
  cy.contains(t.labels.searchInput).should('exist');
});
```

The returned object has the shape: `{ labels, messages, titles, buttons, formats, fallbacks }`.

### Locale

The default locale is read from `NEXT_PUBLIC_DEFAULT_LOCALE` in `.env.local`. To override for a test run, create `cypress.env.json` (not committed):

```json
{ "DEFAULT_LOCALE": "en-US" }
```

Or pass via CLI:

```bash
npx cypress run --env DEFAULT_LOCALE=de-DE
```

### Mocking APIs

For example, with a fixture available in `tests/cypress/fixtures/` (replace the filename and URL with those used by the scenario):

```js
cy.intercept('GET', '/api/movies/trending*', { fixture: 'trending-movies.json' }).as('trending');
cy.visitLocale('en-US');
cy.wait('@trending');
```

## Path Aliases

Aliases are defined in `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "$tests": ["./tests"],
      "$tests/*": ["./tests/*"]
    }
  }
}
```

This allows imports such as:

```js
import { i18nMockDefault } from '$tests/mocks/i18n.mocks.js';
import { movieDetails } from '$tests/fixtures/tmdb/tmdb.fixtures.js';
```

## Test Strategy

Test coverage follows practical agile development:

1. A user story or use case describes the desired behavior.
2. Cypress acceptance tests verify complete, user-visible flows.
3. Cypress component tests verify keyboard interaction, focus management, ARIA states, and visibility of components with their own behavior (for example tabs, modals, dropdowns).
4. Vitest integration tests verify that pages or sections render with controlled dependencies and that data reaches the components.
5. Vitest unit tests protect pure utility functions, isolated logic, and relevant edge cases.
6. Accessibility tests (`cypress-axe`) verify WCAG 2.2 AA compliance for pages and interactions.

Purely presentational components get no dedicated test; integration or Cypress tests cover them.

Use the narrowest test level that provides sufficient confidence. Add a higher-level test when the behavior depends on browser interaction, routing, responsive layout, or multiple application layers.

## Coverage

Coverage is generated with Vitest and V8. The coverage report is stored in the `coverage/` directory.

Coverage numbers provide orientation and complement functional test selection. They do not replace it.

Unit tests must maintain a minimum statement coverage of 80%.

Before every commit, Husky runs the pre-commit checks automatically:

- unit tests with coverage
- formatting and ESLint checks
- integration tests

Run the same checks manually with:

```bash
npm run test:precommit
```

## Further Information

- `README.md` for project context, installation, and architecture overview
- `docs/ai-prompts.md` for AI-assisted development rules
- `docs/ai-prompt-examples.md` for example prompts
