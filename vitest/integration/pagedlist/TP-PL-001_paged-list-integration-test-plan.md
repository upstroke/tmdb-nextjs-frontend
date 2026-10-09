# Test Plan: PagedList Integration Test

**Test Plan ID:** TP-PL-001
**Components:** `app/[locale]/movies/page.js`, `app/[locale]/tv-shows/page.js`, `components/PagedList.jsx`, `components/LoadMore.jsx`, `components/CardDefault.jsx`, `components/DialogMessage.jsx`, `app/api/[locale]/movies/route.js`, `app/api/[locale]/tv-shows/route.js`, `lib/utils/pageStateRestore.js`
**Test File:** `vitest/integration/pagedlist/paged-list.test.jsx`
**Fixture:** `vitest/fixtures/tmdb/paged-list.browser.fixtures.js` (based on `tmdb.browser.fixtures.js`)
**Test Level:** Integration Test
**Framework:** Vitest (jsdom) + React Testing Library

This test plan documents the automated integration tests in `paged-list.test.jsx`. They cover the chain list page → `createTmdbApi` → `initialData` → `PagedList` → "load more" → real API route → `createTmdbApi` → cards, plus restore from `sessionStorage`, duplicates, errors and scrolling. Real modules are wired together; only the TMDB network (`globalThis.fetch`) is mocked. Every test runs for both lists (movies and tv-shows) with `describe.each`. User journeys (clicking through pages, real routing) are covered by Cypress (`cypress/e2e`).

## Test Items

- `MoviesPage` and `TvShowsPage` (async server components, rendered via `render(await Page(...))` inside `AppLocaleProvider`)
- `GET` handlers of `app/api/[locale]/movies/route.js` and `app/api/[locale]/tv-shows/route.js`
- `PagedList`, `LoadMore`, `CardDefault`, `DialogMessage`
- `restorePagedList`, `storeCurrentPage` (`lib/utils/pageStateRestore.js`), `deduplicateMedia`
- `createTmdbApi` and the zod schemas, `lib/i18n/config`, `lib/i18n/helpers` (`getLocaleText`)
- Mocks: `next/link`, `next/image`, `globalThis.fetch`, `IntersectionObserver`, `HTMLDialogElement.showModal`, `Element.prototype.scrollIntoView`, `TMDB_API_KEY` (`vi.stubEnv`)

## Features to Be Tested

- First trending page with heading, featured item and cards
- Loading the next page through the real API route and appending the cards
- Removing cards that already exist (duplicates between pages)
- End of the list: all cards of the next page already known
- Restoring all pages up to the page stored in `sessionStorage`
- Error dialog for a failing next page and the timeout message after 15 seconds
- Missing API key and empty first page
- Scrolling to the first new card after loading
- Error dialog for a failing first page (`initialData.error` from the server page)

## Features Not to Be Tested

- Real TMDB API and real network
- Real Next.js routing and navigation to detail pages (Cypress)
- Visual styling, image loading and the layout of `CardFeatured`
- Details of single components (card content, certification badge)

## Test Approach

A fetch router answers TMDB endpoints from `paged-list.browser.fixtures.js` and forwards internal `/api/{locale}/{apiPath}?page=n` calls to the real route handler. The fixture has 3 trending pages: page 1 with three items, page 2 with the last item of page 1 again plus one new item, page 3 with one item. Error cases are triggered per page via `overrides.pages` (`'fail'` or a custom body); the timeout via `overrides.hangFrom`. The test reads the cards from `.default-card h3`, locale texts come from `getLocaleText(DEFAULT_LOCALE)`, so no text is hard-coded. Per list, `LISTS` holds the message keys for the empty state (`emptyKey`) and for the server load error (`loadErrorKey`). `IntersectionObserver` is replaced by a constructor function that exposes its callback; `showModal` of the `<dialog>` is replaced because jsdom does not implement it.

## Test Cases

Each test case is executed for `movies` and `tv-shows`.

| ID | Automated Test | Covered Behavior |
| --- | --- | --- |
| TC-PL-01 | `renders heading, featured item and the cards of the first trending page` | Heading, details request for the featured item, three cards, load more enabled, no internal API call |
| TC-PL-02 | `loads the next page through the real API route and appends the cards` | One call `/api/{locale}/{apiPath}?page=2`, four cards, button enabled, stored page `2` |
| TC-PL-03 | `does not show a card twice when the next page repeats it` | No duplicate titles after page 2 |
| TC-PL-04 | `disables load more and keeps the stored page when the next page has no new cards` | Cards unchanged, button disabled, stored page stays `1` |
| TC-PL-05 | `restores all pages up to the stored page` | Stored page `3` loads pages 2 and 3, five cards, button disabled |
| TC-PL-06 | `shows the error dialog and keeps the cards when the next page fails` | `loadMoreError` visible, cards kept, button enabled again |
| TC-PL-07 | `shows the timeout message when the next page does not answer within 15 seconds` | `loadTimeout` visible after 15 s, cards kept |
| TC-PL-08 | `shows the missing API key message without any request` | `apiKeyMissing`, no cards, no fetch |
| TC-PL-09 | `shows the empty message when the first page has no results` | Message of `noMoviesFound` / `noTvShows`, no cards |
| TC-PL-10 | `scrolls to the first new card after loading the next page` | Observed element id `{cardIdPrefix}-4`, `scrollIntoView` with `smooth` / `start` |
| TC-PL-11 | `shows the load error of the server page instead of the empty message` | `moviesLoadError` / `tvShowsLoadError` visible, no empty message, no cards |

## Detailed Test Cases

### TC-PL-01: First page

**Objective:** Verify that the list page hands its first page to `PagedList`.
**Preconditions:** `TMDB_API_KEY` is set; `sessionStorage` is empty.
**Steps:** Render the page.
**Expected Result:** Heading from `titles`, cards of page 1 in order, TMDB details request for the featured item (item 2), load more enabled, no internal API request.

### TC-PL-02: Load next page

**Objective:** Verify the chain from the button to the real API route.
**Steps:** Click load more.
**Expected Result:** Exactly one internal request for page 2, the new card is appended, the button is enabled again (`hasMore`), `sessionStorage` holds `2` under the storage key.

### TC-PL-03: Duplicates

**Objective:** Verify that cards known from page 1 are not repeated.
**Preconditions:** Page 2 contains the last card of page 1.
**Steps:** Click load more.
**Expected Result:** The list shows each title once.

### TC-PL-04: No new cards

**Objective:** Verify the end of the list when page 2 only repeats a known card.
**Steps:** Click load more.
**Expected Result:** Cards unchanged, load more disabled, stored page remains `1`.

### TC-PL-05: Restore

**Objective:** Verify restoring the scroll position after leaving the list.
**Preconditions:** `sessionStorage` holds `3` under the storage key.
**Steps:** Render the page.
**Expected Result:** Requests for pages 2 and 3 in this order, all five cards, load more disabled (page 3 is the last page).

### TC-PL-06: Failing next page

**Objective:** Verify the error handling of the route and the dialog.
**Preconditions:** TMDB answers page 2 with an error.
**Steps:** Click load more.
**Expected Result:** The route answers 500, the dialog shows `loadMoreError`, cards stay, the button is enabled for another try.

### TC-PL-07: Timeout

**Objective:** Verify the abort after 15 seconds.
**Preconditions:** The internal request for page 2 does not answer until aborted; fake timers for `setTimeout`.
**Steps:** Click load more, advance 15000 ms.
**Expected Result:** `loadTimeout` is displayed, cards stay.

### TC-PL-08: Missing API key

**Objective:** Verify the server page without key.
**Preconditions:** `TMDB_API_KEY` is empty.
**Steps:** Render the page.
**Expected Result:** `apiKeyMissing` is displayed, no cards, no request.

### TC-PL-09: Empty list

**Objective:** Verify the empty message.
**Preconditions:** TMDB returns no results for page 1.
**Steps:** Render the page.
**Expected Result:** The message for `noMoviesFound` (movies) or `noTvShows` (tv-shows) is displayed, no cards.

### TC-PL-10: Scroll to new card

**Objective:** Verify the scroll target after loading.
**Steps:** Click load more; trigger the callback of the fake observer with `isIntersecting: true`.
**Expected Result:** The observed element has the id `{cardIdPrefix}-4`; `scrollIntoView` is called with `{ behavior: 'smooth', block: 'start' }`.

### TC-PL-11: Failing first page

**Objective:** Verify that an error of the server page reaches the user (`initialData.error`).
**Preconditions:** TMDB answers page 1 of the trending endpoint with an error, so the list page catches it and passes `moviesLoadError` (movies) or `tvShowsLoadError` (tv-shows) in `initialData.error`.
**Steps:** Render the page.
**Expected Result:** The dialog shows the load error message, the empty message is not displayed, no cards are rendered.

## Pass/Fail Criteria

A test case passes when every assertion within its `it(...)` block succeeds. It fails if a card list, request URL, stored page, button state, message text or scroll call differs from the expectation.

## Risks and Limitations

- The TMDB API is mocked; changes in the real API are not detected.
- The test assumes the TV route `app/api/[locale]/tv-shows/route.js` has the same structure as the movies route.
- `HTMLDialogElement.showModal` and `IntersectionObserver` are replaced; real browser behavior is only covered by Cypress.
- Fixtures are shared by both lists and have 3 pages; a page 4 is not covered.
- The card order and the featured item (item 2 of page 1) follow `results?.[1]` in the list pages.
- TC-PL-11 fails without the line `if (initialData?.error) setError(initialData.error);` in `PagedList.jsx`.

## Execution

```bash
npx vitest run vitest/integration/pagedlist/paged-list.test.jsx
```
