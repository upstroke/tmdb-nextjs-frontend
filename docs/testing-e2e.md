# E2E Testing with Cypress

This project uses [Cypress](https://www.cypress.io/) for end-to-end tests.

## Setup

Install Cypress (first time only):

```bash
npm install
```

## Running Tests

Always start the dev server before running Cypress:

```bash
npm run dev
```

Then in a second terminal:

```bash
# Open interactive Cypress UI
npm run cy:open

# Headless run (CI / single pass)
npm run cy:run
```

## Project Structure

```
cypress/
  e2e/          # Test files — *.cy.js
  fixtures/     # Static mock data for cy.intercept()
  support/
    commands.js # Custom commands (cy.visitLocale etc.)
    e2e.js      # Global support entry point
cypress.config.js
```

## Custom Commands

| Command | Description |
|---|---|
| `cy.visitLocale(locale, path)` | Navigate to `/{locale}{path}`, e.g. `cy.visitLocale('en-US', '/movies')` |

## Locale Handling

Routes in this app are always prefixed with the active locale (`/en-US/`, `/de-DE/`).  
Use `cy.visitLocale()` instead of `cy.visit()` to avoid hardcoding locale strings in every test.

The default locale is read from `Cypress.env('DEFAULT_LOCALE')`.  
Set it in `cypress.env.json` (not committed) or via CLI:

```bash
npx cypress run --env DEFAULT_LOCALE=de-DE
```

## Mocking API Responses

Use `cy.intercept()` to stub TMDB API routes and avoid hitting the real API in tests:

```js
cy.intercept('GET', '/api/movies/trending*', { fixture: 'trending-movies.json' }).as('trending');
cy.visitLocale('en-US');
cy.wait('@trending');
```

Fixture files live in `cypress/fixtures/`.

## CI

Cypress is configured with `retries.runMode: 2` to handle transient failures.  
Videos and screenshots are saved to `cypress/videos/` and `cypress/screenshots/`.
