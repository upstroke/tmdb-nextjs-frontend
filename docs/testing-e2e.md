# E2E Acceptance Testing with Cypress

This file is a quick-start reference. For the full rules see `docs/testing/acceptance-tests.md`.

## Setup

```bash
npm install
```

## Running Tests

Start the dev server first:

```bash
npm run dev
```

Then in a second terminal:

```bash
npm run cy:open       # Interactive Cypress UI
npm run cy:run        # Headless, single run
npm run test:acceptance  # Alias for CI
```

## Directory Structure

```
tests/
  acceptance/
    accessibility/
      accessibility.spec.js
      accessibility-testplan.md
    navigation/
      navigation.spec.js
      navigation-testplan.md
  fixtures/       # Shared domain test data (cy.intercept stubs)
  setup/
    cypress.js            # Cypress support entry point
    cypress-commands.js   # Custom commands
cypress.config.js
```

## Custom Commands

| Command | Description |
|---|---|
| `cy.visitLocale(locale, path)` | Navigate to `/{locale}{path}` |
| `cy.checkPageA11y(options?)` | Run axe WCAG 2.2 AA check on current page |

## Locale

Create `cypress.env.json` (not committed) to set the default locale:

```json
{ "DEFAULT_LOCALE": "en-US" }
```

Or pass via CLI:

```bash
npx cypress run --env DEFAULT_LOCALE=de-DE
```

## Mocking APIs

```js
cy.intercept('GET', '/api/movies/trending*', { fixture: 'trending-movies.json' }).as('trending');
cy.visitLocale('en-US');
cy.wait('@trending');
```

## Test Plans

Every feature directory in `tests/acceptance/` contains exactly one `*-testplan.md` next to its spec files.
