# Test Plan — Accessibility

## Feature Goal

Verify WCAG 2.2 AA compliance on central pages using automated axe-core checks and targeted
checks for keyboard focus, live regions, search states, reflow, and hover contrast.

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
| A11Y-16 | Header         | Hover contrast of navigation links           |
| A11Y-17 | Search         | Hover contrast of a search result            |
| A11Y-18 | Header         | Contrast of the focused element              |

A11Y-08, A11Y-09, and A11Y-14 run once per page, with the page name in the test title. A11Y-16 runs
once per navigation link.

## States to Include

- Page loaded (success state)
- Error state (invalid id, failed search request)
- Search results open, empty, and failed
- Second locale (`de-DE`), reached through the language switcher and through a direct URL
- Small viewport (320 px, equals 200% zoom on a 1280 px wide screen)
- Hover and focus state of navigation links and search results
- Not yet covered: hover contrast of cards and buttons

## Dialogs

`components/DialogMessage.jsx` is the only dialog component in `components/`. A11Y-06 covers it
with the error message for an invalid id.

## Covered in Vitest

- **Typeahead keyboard handling:** Arrow keys, Enter, Escape, Home, and End.
- **Loading state of the search:** The delayed loading message.
- **Status message for missing results:** The message shown when the search finds nothing.

All three are tested in `vitest/component/typeheadsearch/TypeHeadSearch.browser.test.jsx`.
A11Y-12 only adds the axe check of the no-results state in the full page.

## Not Covered Here

- **Skip link:** The layout has no skip link, so there is nothing to test yet. Add the test with
  the feature.
- **Screen reader output:** Automated checks cannot replace a manual pass with NVDA or VoiceOver.
  See the manual checklist in `docs/testing/accessibility-audit-checklist.md`.

## Accepted Behavior

- **`html[lang]` in the server response:** `app/layout.js` sits above `[locale]`, so the server
  response does not carry the locale of the route. `LocaleSyncer` sets
  `document.documentElement.lang` on the client after hydration, for direct visits and for
  language switches. The tests check the value after hydration (A11Y-08, A11Y-15).
  A test for `lang="de-DE"` in the raw server response of `/de-DE` was run and failed, which
  confirms the behavior. The test was removed on purpose. Until hydration, screen readers and
  crawlers can see the wrong language (WCAG 3.1.1). The behavior is accepted; a fix would move
  the `<html>` element into `app/[locale]/layout.js`.

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

## Hover and Focus Contrast

`cy.trigger('mouseover')` does not apply the CSS `:hover` state, so A11Y-16 and A11Y-17 use
[cypress-real-events](https://github.com/dmtrKovalenko/cypress-real-events). It sends real mouse
and keyboard events through the Chrome DevTools Protocol and works in Chromium-based browsers
only. The npm scripts run Chrome. The spec imports the package directly with
`import 'cypress-real-events'`.

The tests run only the axe rule `color-contrast` while the pointer stays on the element
(`realHover()`) or the focus is on it (`realPress('Tab')`). The default checks in A11Y-01 to
A11Y-07 see the resting state only.

## Rules

Tags checked: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`.

A11Y-09 additionally runs the best-practice rules `landmark-one-main`, `landmark-unique`,
`page-has-heading-one`, `heading-order`, and `region`.

A11Y-16 to A11Y-18 run the rule `color-contrast` only.

Document intentional exceptions in the spec file directly above `cy.checkPageA11y()`.
Do not disable rules broadly.

## Locale Considerations

Tests use the constant `en-US`, the same as `DEFAULT_LOCALE` in `lib/i18n/config.js`.

`html[lang]` is set on the client by `LocaleSyncer` after hydration. A11Y-08 opens each page in
`en-US` and switches to `de-DE` through the language switcher (`#language-select`). A11Y-15 opens
`/de-DE` directly. Both check the value after hydration; see Accepted Behavior for the server
response.

Do not read the locale with `Cypress.env()`: `allowCypressEnv` is `false`.
