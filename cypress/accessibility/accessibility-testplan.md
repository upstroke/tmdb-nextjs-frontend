# Test Plan — Accessibility

## Feature Goal

Verify WCAG 2.2 AA compliance on central pages using automated axe-core checks and targeted
checks for keyboard focus, skip link, live regions, search states, reflow, hover contrast, and
localized alternative text.

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
| A11Y-10 | Header         | Focus indicator on the skip link             |
| A11Y-11 | Search         | Result count in the live region              |
| A11Y-12 | Search         | No results message                           |
| A11Y-13 | Search         | Error message when the request fails         |
| A11Y-14 | Small viewport | 320 px width, no horizontal scrolling        |
| A11Y-15 | Homepage       | html lang after load on direct de-DE visit   |
| A11Y-16 | Header         | Hover contrast of navigation links           |
| A11Y-17 | Search         | Hover contrast of a search result            |
| A11Y-18 | Header         | Contrast of the focused skip link            |
| A11Y-19 | Lists          | Hover contrast of a card                     |
| A11Y-20 | Movie list     | Hover contrast of the load more button       |
| A11Y-21 | Movie list     | Localized poster alternative text            |
| A11Y-22 | All pages      | Skip link moves focus to the main content    |
| A11Y-23 | Homepage       | html lang in the raw server response         |
| A11Y-24 | TV show detail | Hover contrast of a season tab               |
| A11Y-25 | TV show detail | Focus contrast of a season tab               |
| A11Y-26 | Error dialog   | Focus inside dialog and Escape closes it     |
| A11Y-27 | Movie list     | Load more announces loading, appends cards, and moves focus to the first new card |
| A11Y-28 | Homepage       | Focus stays on the language select after switching to de-DE |

A11Y-08, A11Y-09, A11Y-14, and A11Y-22 run once per page, with the page name in the test title.
A11Y-16 runs once per navigation link, A11Y-19 once per list, and A11Y-21 once per tested locale
(en-US, de-DE). A11Y-23 runs once per tested locale and lives in
`cypress/accessibility/html-lang.cy.js`.

## Spec Files

| Spec file | Test cases |
| --- | --- |
| `pages/page-axe.cy.js` | A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06 |
| `pages/locale.cy.js` | A11Y-08, A11Y-15 |
| `pages/landmarks.cy.js` | A11Y-09 |
| `pages/reflow.cy.js` | A11Y-14 |
| `pages/alt-text.cy.js` | A11Y-21 |
| `search/search-axe.cy.js` | A11Y-07, A11Y-12, A11Y-13 |
| `search/search-live-region.cy.js` | A11Y-11 |
| `focus/skip-link.cy.js` | A11Y-10, A11Y-18, A11Y-22 |
| `focus/season-tabs.cy.js` | A11Y-24, A11Y-25 |
| `focus/error-dialog.cy.js` | A11Y-26 |
| `focus/language-switch.cy.js` | A11Y-28 |
| `lists/load-more.cy.js` | A11Y-27 |
| `contrast/navigation-hover.cy.js` | A11Y-16 |
| `contrast/search-hover.cy.js` | A11Y-17 |
| `contrast/cards-hover.cy.js` | A11Y-19 |
| `contrast/load-more-hover.cy.js` | A11Y-20 |
| `html-lang.cy.js` | A11Y-23 |

## States to Include

- Page loaded (success state)
- Error state (invalid id, failed search request)
- Search results open, empty, and failed
- Second locale (`de-DE`), reached through the language switcher and through a direct URL
- Small viewport (320 px, equals 200% zoom on a 1280 px wide screen)
- Hover and focus state of navigation links, search results, cards, the load more button, and
  season tabs
- Keyboard focus on the skip link, and focus moved to `#main-content` after activation
- Error dialog open, focused, and closed with Escape
- Load more loading state announced, new cards appended, and focus moved to the first new card
- Language switched while focus remains on the language select

## Dialogs

`components/DialogMessage.jsx` is the only dialog component in `components/`.

- A11Y-06 covers the error message for an invalid id with an axe check.
- A11Y-26 covers the native modal dialog behavior: focus moves into the dialog, `Escape` closes
  it, and focus leaves the dialog.

## Covered in Vitest

- **Typeahead keyboard handling:** Arrow keys, Enter, Escape, Home, and End.
- **Loading state of the search:** The delayed loading message.
- **Status message for missing results:** The message shown when the search finds nothing.
- **Skip link markup:** TC-HM-004 checks the link target and that the link comes before the burger
  button and the navigation.
- **Season tab keyboard handling:** Tablist roles, accessible name, roving tabindex, Arrow Left
  and Right with wrap-around, Home and End, focus movement between tabs, panel association, and
  keyboard navigation within the episode list.
- **Season tab loading and fallback states:** The loading message and the plain-text fallback when
  no episode data is available.

The first three are tested in `vitest/component/typeheadsearch/TypeHeadSearch.browser.test.jsx`,
TC-HM-004 in `vitest/component/headermain/HeaderMain.browser.test.jsx`, and the season tab cases
in `vitest/component/tabgroupe/TabGroupe.browser.test.jsx`.
A11Y-12 only adds the axe check of the no-results state in the full page.

## Covered in a Separate Plan

- **Main menu:** Navigation landmark, current page, tab order, keyboard activation, focus contrast,
  target size, and the burger button. See `cypress/accessibility/menu/menu-testplan.md`
  (A11Y-MENU-01 to A11Y-MENU-11).

## Not Covered Here

- **Screen reader output:** Automated checks cannot replace a manual pass with NVDA or VoiceOver.
  See the manual checklist in `docs/testing/accessibility-audit-checklist.md`.

## Server Response

- **`html[lang]` in the server response:** `app/[locale]/layout.js` renders the `<html>` element
  with the locale of the route, so the server response carries the correct language. Screen
  readers and crawlers see it before hydration (WCAG 3.1.1). A11Y-23 reads the raw response of
  `/en-US` and `/de-DE` with `cy.request`, which runs no JavaScript, and checks the `lang`
  attribute of the `<html>` tag. A11Y-08 and A11Y-15 check the value in the loaded page.

## Skip Link

`HeaderMain` renders a link with `href="#main-content"` as the first element of the header. Its
 text comes from `labels.skipToContent` in `lib/i18n/ui.json`. The link is off-screen until it
receives keyboard focus; the styles in `styles/app.scss` use `:focus-visible` only. A11Y-10 checks
that the first Tab stop is the skip link and shows a visible focus indicator. A11Y-18 checks the
color contrast of the focused link. A11Y-22 presses Tab and Enter on each page and checks that the
hash is `#main-content` and that the focus is on the `main` element (WCAG 2.4.1).

## Poster Alternative Text

`CardDefault` builds the poster alternative text from `messages.posterAlt` in `lib/i18n/ui.json`. The message contains the placeholder `{title}`, like `searchResultsCount`
contains `{count}`, so each language can use its own word order. A11Y-21 reads the message of the
locale with `cy.i18n()`, removes the placeholder, and checks that the alt text of the first poster
contains the remaining text. This catches a text from the wrong language (WCAG 3.1.2).

## Data

Lists and detail pages load their data on the server, so `cy.intercept()` cannot stub them.
The tests for lists and details run against the real TMDB API and need `TMDB_API_KEY` on the
server. Movie 155 and series 1396 are well known titles; if TMDB removes one, the test fails
because of the data and not because of an accessibility violation.

Only the search request comes from the browser. A11Y-07 and A11Y-11 to A11Y-13 stub it with the
response shape of `/api/[locale]/search`.

A11Y-20 needs a list with further pages, because the load more button is disabled on the last
page and axe skips disabled elements.

A11Y-27 stubs the browser-side request for page 2 of the movie list.

## Run

Start the app on `http://localhost:3000` with `TMDB_API_KEY`, then run:

```bash
npm run test:e2e:a11y
```

## Hover and Focus Contrast

`cy.trigger('mouseover')` does not apply the CSS `:hover` state, so A11Y-16, A11Y-17, A11Y-19,
A11Y-20, A11Y-24, and A11Y-25 use
[cypress-real-events](https://github.com/dmtrKovalenko/cypress-real-events). It sends
real mouse and keyboard events through the Chrome DevTools Protocol and works in Chromium-based
browsers only. The npm scripts run Chrome. The spec imports the package directly with
`import 'cypress-real-events'`.

The tests run only the axe rule `color-contrast` while the pointer stays on the element
(`realHover()`) or the focus is on it (`realPress('Tab')`). The default checks in A11Y-01 to
A11Y-07 see the resting state only.

## Rules

Tags checked: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`.

A11Y-09 additionally runs the best-practice rules `landmark-one-main`, `landmark-unique`,
`page-has-heading-one`, `heading-order`, and `region`.

A11Y-16 to A11Y-20 and A11Y-24 to A11Y-25 run the rule `color-contrast` only.

Document intentional exceptions in the spec file directly above `cy.checkPageA11y()`.
Do not disable rules broadly.

## Locale Considerations

Tests use the constant `en-US`, the same as `DEFAULT_LOCALE` in `lib/i18n/config.js`.

`html[lang]` is rendered by the server in `app/[locale]/layout.js`. A11Y-08 opens each page in
`en-US` and switches to de-DE through the language switcher (`#language-select`). A11Y-15 opens
`/de-DE` directly. Both check the value in the loaded page; A11Y-23 checks the raw server
response, see Server Response.

Do not read the locale with `Cypress.env()`: `allowCypressEnv` is `false`.
