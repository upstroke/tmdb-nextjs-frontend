# Test Plan — Accessibility

## Feature Goal

Verify WCAG 2.2 AA compliance on central pages using automated axe-core checks and targeted
checks for keyboard focus, live regions, search states, and reflow.

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
| A11Y-08 | Pages (de-DE)  | Switch to de-DE with the language switcher   |
| A11Y-09 | All pages      | Landmarks and heading order (axe rules)      |
| A11Y-10 | Header         | Focus indicator on navigation links          |
| A11Y-11 | Search         | Result count in the live region              |
| A11Y-12 | Search         | No results message                           |
| A11Y-13 | Search         | Error message when the request fails         |
| A11Y-14 | Small viewport | 320 px width, no horizontal scrolling        |
| A11Y-15 | Homepage       | html lang after load on direct de-DE visit   |

A11Y-08, A11Y-09, and A11Y-14 run once per page, with the page name in the test title.

## States to Include

- Page loaded (success state)
- Error state (invalid id, failed search request)
- Search results open, empty, and failed
- Second locale (`de-DE`), reached through the language switcher and through a direct URL
- Small viewport (320 px, equals 200% zoom on a 1280 px wide screen)
- Not yet covered: other open dialogs, loading state of the search, hover contrast

## Not Covered Here

- **Typeahead keyboard handling:** Arrow keys, Enter, Escape, Home, and End are tested in
  `vitest/component/typeheadsearch/TypeHeadSearch.browser.test.jsx`.
- **Skip link:** The layout has no skip link, so there is nothing to test yet. Add the test with
  the feature.
- **Screen reader output:** Automated checks cannot replace a manual pass with NVDA or VoiceOver.
  See the manual checklist in `docs/testing/accessibility-audit-checklist.md`.

## Accepted Limitations

- **`html[lang]` in the server response:** `app/layout.js` sits above `[locale]`, so the server
  response carries the default locale for every route. `LocaleSyncer` sets
  `document.documentElement.lang` on the client after hydration, for direct visits and for
  language switches. The tests check the value after hydration (A11Y-08, A11Y-15). Until
  hydration, screen readers and crawlers can see the wrong language (WCAG 3.1.1). The risk is
  accepted; a fix would move the `<html>` element into `app/[locale]/layout.js`.

## Data

Lists and detail pages load their data on the server, so `cy.intercept()` cannot stub them.
The tests for lists and details run against the real TMDB API and need `TMDB_API_KEY` on the
server. Movie 155 and series 1396 are well known titles; if TMDB removes one, the test fails
because of the data and not because of an accessibility violation.

Only the search request comes from the browser. A11Y-07 and A11Y-11 to A11Y-13 stub it with the
response shape of `/api/[locale]/search`.

## Run

Start the app on `http://localhost:3000` with `TMDB_API_KEY`, then run:

```bash
npm run test:e2e:a11y
```

## Rules

Tags checked: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`.

A11Y-09 additionally runs the best-practice rules `landmark-one-main`, `landmark-unique`,
`page-has-heading-one`, `heading-order`, and `region`.

Document intentional exceptions in the spec file directly above `cy.checkPageA11y()`.
Do not disable rules broadly.

## Locale Considerations

Tests use the constant `en-US`, the same as `DEFAULT_LOCALE` in `lib/i18n/config.js`.

`html[lang]` is set on the client by `LocaleSyncer` after hydration. A11Y-08 opens each page in
`en-US` and switches to `de-DE` through the language switcher (`#language-select`). A11Y-15 opens
`/de-DE` directly. Both check the value after hydration; see Accepted Limitations for the server
response.

Do not read the locale with `Cypress.env()`: `allowCypressEnv` is `false`.
