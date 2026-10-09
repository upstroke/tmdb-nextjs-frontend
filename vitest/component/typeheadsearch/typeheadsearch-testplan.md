# Test Plan: TypeHeadSearch Component Test

**Test Plan ID:** TP-THS-001
**Component:** `components/TypeHeadSearch.jsx`
**Test File:** `vitest/component/TypeHeadSearch.browser.test.jsx`
**Test Level:** Component Test
**Framework:** Vitest Browser Mode + React Testing Library + user-event

This test plan documents the automated browser component tests implemented in `TypeHeadSearch.browser.test.jsx`. It covers persisted-query restoration, debounced search requests, minimum query length behavior, error and empty-result states, keyboard navigation, result activation, fallback values, router navigation, and closing behavior.

## Test Items

- `components/TypeHeadSearch.jsx`
- `next/navigation` router mock: `replace`, `push`, `prefetch`
- Mocked locale store: `useLocale`, `useI18n`
- `globalThis.fetch`
- `window.top.sessionStorage`
- `Element.prototype.scrollIntoView`
- `mockSearchResults` data fixture

## Features to Be Tested

- Restoring a saved query and saved results from `sessionStorage`
- Rendering movie and TV search suggestions
- Debouncing a query before calling the search API
- Enforcing the four-character minimum search threshold
- Clearing results and persisted search data below the threshold
- Empty-result and backend-error messages
- Keyboard result navigation with `ArrowDown`, `ArrowUp`, `Home`, and `End`
- Closing results with `Escape`
- Rendering fallback content for missing title, date, rating, and poster data
- Rendering an invalid date and a zero rating
- Navigation by `Enter` on a selected result
- Navigation after clicking a TV-show result
- Closing the results after an outside click
- Restoring input focus when `Escape` is pressed with no visible results

## Features Not to Be Tested

- Real Next.js router behavior
- Real backend search API and API response schema
- Visual styling, animations, and responsive layout
- Image loading and image optimization
- Search-result ranking quality
- Screen-reader output with real assistive technology

## Test Approach

The suite uses mocked router, locale, fetch, and browser-storage dependencies to test the component contract in isolation: inputs, displayed output, side effects, and error behavior. It follows an Arrange–Act–Assert structure using asynchronous assertions where DOM updates depend on timers or Promises. [web:701][web:687]

The keyboard scenarios are aligned with the ARIA combobox pattern: the input remains the interaction point, `ArrowDown` and `ArrowUp` move the active option, `Home` and `End` select boundary options, `Escape` dismisses the popup, and `Enter` activates an already selected option. [web:698][web:699]

## Test Cases

| ID        | Automated Test                                                                                         | Covered Behavior                                                                                                      |
|-----------|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| TC-THS-01 | `mounts, restores data from sessionStorage, and opens suggestions grid layer upon entering query keys` | Restores query and cached movie results from `sessionStorage`; renders a result option with year and formatted rating |
| TC-THS-02 | `debounces input queries, triggers backend API requests, and lists suggestions successfully`           | Debounces a four-character query and calls `/api/en-US/search?q=Batm`                                                 |
| TC-THS-03 | `collapses the dropdown layer instantly when input falls below 4 characters`                           | Removes visible suggestions after the query is reduced below four characters                                          |
| TC-THS-04 | `purges the sessionStorage cache when character thresholds are under-run`                              | Removes stored query data after a previously populated query is reduced below four characters                         |
| TC-THS-05 | `handles backend server network crashes and empty results sets elegantly`                              | Displays `No results found` for empty results and `Search request failed.` for an unsuccessful API response           |
| TC-THS-06 | `navigates through search results using keyboard only`                                                 | Preserves input focus while moving active selection down, down, then up                                               |
| TC-THS-07 | `navigates to first and last search results using Home/End keys`                                       | Selects first result with `Home` and last result with `End`, while retaining input focus                              |
| TC-THS-08 | `closes search results using Escape key`                                                               | Hides the results dropdown with `Escape`, preserves query value, and retains input focus                              |
| TC-THS-09 | `closes the results panel on Escape by hiding the rendered listbox`                                    | Exercises global Escape handling while the listbox is rendered and open                                               |
| TC-THS-10 | `renders fallback values for incomplete movie search results`                                          | Renders unavailable poster, title, date, and rating fallback values                                                   |
| TC-THS-11 | `renders an empty year for invalid dates and marks a zero rating as not available styled`              | Preserves invalid date in `datetime`, renders no year, and styles rating `0.0` as unavailable                         |
| TC-THS-12 | `navigates to the focused result when Enter is pressed`                                                | Selects a movie via `ArrowDown` and navigates with `Enter` to `/en-US/movies/101`                                     |
| TC-THS-13 | `navigates to a TV show when its result is clicked`                                                    | Verifies TV-show link and click navigation to `/en-US/tv-shows/72705`                                                 |
| TC-THS-14 | `closes the results when clicking outside`                                                             | Hides the open result listbox after clicking `document.body`                                                          |
| TC-THS-15 | `restores focus to the input when Escape is pressed without visible results`                           | Keeps or restores focus to the combobox when Escape is pressed without visible results                                |

## Detailed Test Cases

### TC-THS-01: Restore persisted search results

**Objective:**
Verify that the component restores a saved query and cached search results from browser session storage.

**Preconditions:**

- `sessionStorage` contains `search-query` with `Spid`.
- `sessionStorage` contains one cached movie result.
- `search-results-closed` is `false`.

**Steps:**

1. Render `TypeHeadSearch`.
2. Focus the combobox.
3. Locate the restored `Spider-Man` option.

**Expected Result:**

- A result option containing `Spider-Man` is rendered.
- The result includes `2026`.
- The displayed rating contains `8.4`.

### TC-THS-02: Debounce search request

**Objective:**
Verify that a valid query triggers a debounced API request.

**Preconditions:**

- Fake timers are enabled.
- Fetch mock is configured for a successful result.

**Steps:**

1. Render `TypeHeadSearch`.
2. Enter `Batm` into the combobox.
3. Advance timers by 350 milliseconds.

**Expected Result:**

- Fetch is called with a URL containing `/api/en-US/search?q=Batm`.
- Fetch receives an options object.

### TC-THS-03: Collapse suggestions below minimum length

**Objective:**
Verify that visible suggestions are removed when the query becomes shorter than four characters.

**Preconditions:**

- Cached `Spider-Man` result is available.
- Search results are configured as open.

**Steps:**

1. Render the component and focus the combobox.
2. Enter `Spiderman` and verify that `Spider-Man` appears.
3. Change the query to `S`.

**Expected Result:**

- `Spider-Man` is no longer visible.

### TC-THS-04: Purge persisted cache below minimum length

**Objective:**
Verify that persisted search data is removed after the query falls below the required length.

**Preconditions:**

- `sessionStorage` contains a query and cached movie results.
- Fake timers are enabled after results are displayed.

**Steps:**

1. Render and focus the component.
2. Enter `Spiderman` and verify results.
3. Change the query to `S`.
4. Advance timers by 350 milliseconds.

**Expected Result:**

- `sessionStorage.getItem('search-query')` returns `null`.

### TC-THS-05: Show empty and error states

**Objective:**
Verify user feedback for an empty result set and an unsuccessful backend response.

**Preconditions:**

- Fake timers are enabled.
- First fetch response returns empty `movies` and `tvShows`.
- Second fetch response returns `ok: false`.

**Steps:**

1. Enter `UnknownQuery`.
2. Advance timers by 350 milliseconds.
3. Enter `CrashQuery`.
4. Advance timers by 350 milliseconds.

**Expected Result:**

- `No results found` is displayed for the empty result set.
- `Search request failed.` is displayed for the unsuccessful response.

### TC-THS-06: Navigate results with Arrow keys

**Objective:**
Verify keyboard-only result navigation without moving focus away from the combobox.

**Preconditions:**

- Default mock search results contain one movie and one TV show.

**Steps:**

1. Render the component.
2. Use Tab to focus the combobox.
3. Enter `Spid`.
4. Press `ArrowDown` twice.
5. Press `ArrowUp` once.

**Expected Result:**

- After first `ArrowDown`, the movie option is selected.
- After second `ArrowDown`, the TV-show option is selected.
- After `ArrowUp`, the movie option is selected again.
- Input focus remains on the combobox throughout.

### TC-THS-07: Navigate results with Home and End

**Objective:**
Verify boundary navigation through available suggestions.

**Preconditions:**

- Default mock search results contain one movie and one TV show.

**Steps:**

1. Render the component.
2. Focus the combobox and enter `Spid`.
3. Press `Home`.
4. Press `End`.

**Expected Result:**

- `Home` selects the first result.
- `End` selects the last result.
- Input focus remains on the combobox.

### TC-THS-08: Close results with Escape

**Objective:**
Verify that Escape hides visible results without clearing the query.

**Preconditions:**

- The combobox contains `Spid`.
- Search results are visible.

**Steps:**

1. Press `Escape`.

**Expected Result:**

- The `.results-dropdown` receives the `hidden` attribute.
- The combobox still contains `Spid`.
- Focus remains on the combobox.

### TC-THS-09: Process global Escape with visible listbox

**Objective:**
Exercise the Escape handler when the listbox is visible and the event is dispatched on `window`.

**Preconditions:**

- Search results for `Spider` are loaded.
- The listbox is visible and `aria-expanded` is `true`.

**Steps:**

1. Dispatch `Escape` on `window`.
2. Obtain `#typeahead-search-results`.

**Expected Result:**

- The test verifies the post-Escape listbox state currently asserted in the implementation: the rendered listbox does **not** have the `hidden` attribute.

**Note:**
The test description says “hiding the rendered listbox”, but its final assertion expects the opposite (`not.toHaveAttribute('hidden')`). This is an inconsistency between the test name/comment and the executed assertion; it should be reviewed.

### TC-THS-10: Render fallback values for incomplete movie data

**Objective:**
Verify fallback rendering when poster, title, date, and rating values are missing.

**Preconditions:**

- Fetch returns one movie with empty title, date, poster URL, and image URL, plus `rating: null`.

**Steps:**

1. Render the component.
2. Enter `Spider`.
3. Locate the result option.

**Expected Result:**

- The image `src` is `/not-available.png`.
- Title has class `u-not-available`.
- Date/time element has class `u-not-available`.
- `N/A` is displayed.

### TC-THS-11: Render invalid date and zero rating

**Objective:**
Verify handling of invalid date data and zero rating.

**Preconditions:**

- Fetch returns one movie with `date: 'invalid-date'`, `rating: 0`, and missing image URLs.

**Steps:**

1. Render the component.
2. Enter `Broken`.
3. Locate the result option.

**Expected Result:**

- The time element has empty visible content.
- The time element has `datetime="invalid-date"`.
- The rating is displayed as `0.0`.
- The rating has class `u-not-available`.
- The image `src` is `/not-available.png`.

### TC-THS-12: Navigate to selected movie with Enter

**Objective:**
Verify router navigation for the active movie result.

**Preconditions:**

- Default mock results are available.
- `mockPush` is reset.

**Steps:**

1. Render the component.
2. Enter `Spider`.
3. Press `ArrowDown` on `window`.
4. Verify that `#movie-101` is selected.
5. Press `Enter` on `window`.

**Expected Result:**

- `mockPush` is called with `/en-US/movies/101`.

### TC-THS-13: Navigate to TV show by click

**Objective:**
Verify link generation and click navigation for a TV-show suggestion.

**Preconditions:**

- Default mock results are available.
- `mockPush` is reset.

**Steps:**

1. Render the component.
2. Enter `Spider`.
3. Locate the `Marvel's Spider-Man` option.
4. Verify its `href`.
5. Click the option.

**Expected Result:**

- The option has `href="/en-US/tv-shows/72705"`.
- `mockPush` is called with `/en-US/tv-shows/72705`.

### TC-THS-14: Close results after outside click

**Objective:**
Verify that an outside click closes an open search result list.

**Preconditions:**

- Search results for `Spider` are open.

**Steps:**

1. Locate the listbox.
2. Click `document.body`.

**Expected Result:**

- The listbox has `hidden === true`.

### TC-THS-15: Restore focus after Escape without visible results

**Objective:**
Verify focus behavior when Escape is pressed while no visible results are available.

**Preconditions:**

- No search result list is open.
- The combobox has focus.

**Steps:**

1. Dispatch `Escape` on `window`.

**Expected Result:**

- The combobox retains or regains focus.

## Pass/Fail Criteria

A test case passes when every assertion within its corresponding `it(...)` block succeeds. A test case fails if any expected result, visible message, ARIA state, persisted-storage effect, router call, focus state, or keyboard-driven selection state differs from the specified result. [web:687]

## Risks and Limitations

- All network calls, router actions, locale strings, and browser-storage inputs are mocked; integration defects in those real dependencies are outside this suite.
- Fake timers must always be restored with `vi.useRealTimers()` to avoid affecting later tests.
- TC-THS-09 has a documented mismatch between its description and final assertion and should be clarified.
- The keyboard tests validate selected state and focus retention, but they do not assert `aria-activedescendant`; that attribute is commonly used to represent virtual focus in combobox widgets. [web:702]
- Automated ARIA-role tests do not replace manual testing with keyboard-only use and assistive technologies.

## Execution

```bash
npx vitest run vitest/component/TypeHeadSearch.browser.test.jsx
```

## Core Test Data

```js
const mockSearchResults = {
  movies: [
    {
      id: 101,
      title: 'Spider-Man',
      mediaType: 'movie',
      vote_average: 8.45,
      release_date: '2026-07-29',
      date: '2026-07-29',
      rating: 8.45
    }
  ],
  tvShows: [
    {
      id: 72705,
      title: "Marvel's Spider-Man",
      mediaType: 'tv',
      vote_average: 7.2,
      release_date: '2017-08-19',
      date: '2017-08-19',
      rating: 7.2
    }
  ]
};
```
