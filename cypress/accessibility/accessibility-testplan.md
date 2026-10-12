# Test Plan — Accessibility

## Feature Goal

Verify WCAG 2.2 AA compliance on central pages using automated axe-core checks.

## User Story

As a user with assistive technology I can use all central pages of the
application without encountering accessibility violations.

## Covered Scenarios

| ID      | Page           | State                                        |
| ------- | -------------- | -------------------------------------------- |
| A11Y-01 | Homepage       | Page loaded, content visible                 |
| A11Y-02 | Movie list     | Page loaded with live TMDB data              |
| A11Y-03 | TV show list   | Page loaded with live TMDB data              |
| A11Y-04 | Movie detail   | Movie 155 loaded with live TMDB data         |
| A11Y-05 | TV show detail | Series 1396 with season tabs, live TMDB data |
| A11Y-06 | Error message  | Invalid id shows the error message           |
| A11Y-07 | Search         | Typeahead with stubbed search results        |

## States to Include

- Page loaded (success state)
- Error state (invalid id)
- Search results open
- Not yet covered: other open dialogs, empty search result, other locales

## Data

Lists and detail pages load their data on the server, so `cy.intercept()` cannot stub them.
A11Y-01 to A11Y-05 run against the real TMDB API and need `TMDB_API_KEY` on the server.
Movie 155 and series 1396 are well known titles; if TMDB removes one, the test fails because
of the data and not because of an accessibility violation.
Only the search request in A11Y-07 comes from the browser. It is stubbed with the response
shape of `/api/[locale]/search`.

## Run

Start the app on `http://localhost:3000` with `TMDB_API_KEY`, then run:

```bash
npm run test:e2e:a11y
```

## Rules

Tags checked: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`.

Document intentional exceptions in the spec file directly above `cy.checkPageA11y()`.
Do not disable rules broadly.

## Locale Considerations

Tests use the constant `en-US`, the same as `DEFAULT_LOCALE` in `lib/i18n/config.js`.
Do not read the locale with `Cypress.env()`: `allowCypressEnv` is `false`.
