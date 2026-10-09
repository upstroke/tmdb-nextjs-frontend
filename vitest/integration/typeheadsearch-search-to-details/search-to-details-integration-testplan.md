# Test Plan: Search to Details Integration Test

**Test Plan ID:** TP-SD-001
**Components:** `../../../app/api/[locale]/search/route.js`, `components/TypeHeadSearch.jsx`, `app/[locale]/movies/[id]/page.js`, `app/[locale]/tv-shows/[id]/page.js`
**Test File:** `search-to-details.test.jsx`
**Fixture:** `vitest/fixtures/tmdb/search-to-details.browser.fixtures.js`
**Test Level:** Integration Test
**Framework:** Vitest (jsdom) + React Testing Library

This test plan documents the automated integration tests in `search-to-details.test.jsx`. They cover the chain search route → TMDB service → zod schemas → result ids → detail pages, plus locale handling and error states. Real modules are wired together; only the TMDB network (`globalThis.fetch`) is mocked. User journeys (clicking, routing) are covered by Cypress (`cypress/e2e`).

## Test Items

- `GET` handler of `../../../app/api/[locale]/search/route.js`
- `createTmdbApi` and the zod schemas
- `MovieDetailPage` and `TvShowDetailPage` (async server components, rendered via `render(await Page(...))`)
- `../../../components/TypeHeadSearch.jsx` (together with the real search route)
- `lib/i18n/config` (`DEFAULT_LOCALE`, `SUPPORTED_LOCALES`) and `lib/i18n/helpers` (`getLocaleText`)
- Mocks: `next/navigation`, `next/link`, `next/image`, `@/lib/stores/locale`, `globalThis.fetch`, `TMDB_API_KEY` (`vi.stubEnv`)

## Features to Be Tested

- Mapping of one `search/multi` response to `movies`, `tvShows` and `results`; `include_adult=false` in the TMDB request
- Results that are neither a movie nor a TV show (e.g. persons) are dropped
- Search without any result: status 200 and empty lists
- Short, empty and missing queries without a TMDB call
- Error responses for a missing API key and for TMDB failures
- Locale validation (400) and passing the locale to TMDB as `language`
- Fallback to default UI texts for an unknown locale, own texts for supported locales
- Using search result ids to render movie and TV detail pages
- Detail pages with failing or missing data (providers, certification, credits, runtime, season)
- TV detail page: load error message, invalid id, fallback texts for empty data
- Watch providers per region, rendering for all supported locales
- Typeahead result links and error message with the real search route

## Features Not to Be Tested

- Real TMDB API and real network
- Real Next.js routing and clicking through pages (Cypress)
- Switching between season tabs (`TabGroupe`, Cypress or component tests)
- Missing `TMDB_API_KEY` on the detail pages (covered on the home page, because without a key the first page already fails)
- Component details of `TypeHeadSearch` such as keyboard navigation (TP-THS-001)
- Visual styling, image loading, ranking quality of search results

## Test Approach

All tests follow Arrange–Act–Assert. A fetch router answers TMDB endpoints from the fixture and forwards internal `/api/{DEFAULT_LOCALE}/search` calls to the real route handler. Error cases are triggered per endpoint via `overrides` (`'fail'` or a custom body). Locales come from `lib/i18n/config`, expected UI texts from `getLocaleText`, so the tests contain no hard-coded locale or message text. Parameterized tests (`it.each`) cover queries, invalid locales and all supported locales.

## Test Cases

| ID       | Automated Test                                                                     | Covered Behavior                                                           |
|----------|------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| TC-SD-01 | `maps one search/multi response to movies, tvShows and results`                    | Status 200, `error` null, ids and `mediaType` mapped, `query` and `include_adult=false` sent to TMDB |
| TC-SD-02 | `returns empty lists without calling TMDB for the query "%s"`                      | Queries `ab` and empty return empty lists, no TMDB call                    |
| TC-SD-03 | `returns empty lists without calling TMDB when the query is missing`               | Missing `q` returns empty lists, no TMDB call                              |
| TC-SD-04 | `answers 500 with an error message when the API key is missing`                    | Status 500, `messages.apiKeyMissing`, no TMDB call                         |
| TC-SD-05 | `answers 500 with an error message when TMDB fails`                                | Status 500, `messages.searchError`, empty lists                            |
| TC-SD-06 | `answers 400 for the locale "%s"`                                                  | Locales `x` and `this-is-too-long` return 400 `Invalid locale.`            |
| TC-SD-07 | `passes the supported locale %s to TMDB as language`                               | Each locale of `SUPPORTED_LOCALES` is sent as `language`                   |
| TC-SD-08 | `uses the default UI texts but keeps the requested language for an unknown locale` | `xx-XX` gets default texts, TMDB still receives `language=xx-XX`           |
| TC-SD-09 | `uses the UI texts of another supported locale`                                    | Another locale returns its own `apiKeyMissing` text                        |
| TC-SD-10 | `uses the id of a movie search result to render the movie detail page`             | Title, runtime, cast and provider on the movie page                        |
| TC-SD-11 | `uses the id of a tv search result to render the tv show detail page`              | Title, cast, provider and season label on the TV page                      |
| TC-SD-12 | `renders the movie page when watch providers fail`                                 | Page renders, provider missing                                             |
| TC-SD-13 | `renders the movie page when the certification fails`                              | Page renders without certification                                         |
| TC-SD-14 | `renders the movie page without credits`                                           | Page renders, no cast                                                      |
| TC-SD-15 | `renders the movie page without a runtime`                                         | Page renders, no runtime                                                   |
| TC-SD-16 | `renders the tv page when the season request fails`                                | Page renders without season data                                           |
| TC-SD-17 | `shows the watch providers for the region of the default locale`                   | Provider visible for the default locale                                    |
| TC-SD-18 | `hides the default-region watch providers for %s`                                  | Provider hidden for every other supported locale                           |
| TC-SD-19 | `renders movie and tv detail pages for %s`                                         | Both detail pages render for every supported locale                        |
| TC-SD-20 | `lists movie and tv results with links to their detail pages`                      | Typeahead shows both results with correct `href`                           |
| TC-SD-21 | `shows an error message when TMDB fails`                                           | Typeahead shows `messages.searchError`, no results                         |
| TC-SD-22 | `drops search results that are neither a movie nor a tv show`                      | A `person` result is missing in `results`, `movies` and `tvShows`          |
| TC-SD-23 | `answers 200 with empty lists when TMDB finds nothing`                             | Status 200, empty lists, `error` null, one TMDB call                       |
| TC-SD-24 | `shows the load error instead of the tv page when the details request fails`       | `messages.tvShowLoadError` shown, no title                                 |
| TC-SD-25 | `shows a message for an invalid tv id without calling TMDB`                        | `Invalid URL parameters.` shown, no `/tv/` request                         |
| TC-SD-26 | `renders the tv page with fallback texts when overview, genres and credits are empty` | Title shown, `fallbacks.notAvailable` shown, no cast                    |

TC-SD-22 and TC-SD-23 are in the group `search route with unusual TMDB responses`, TC-SD-24 to TC-SD-26 in the group `detail pages with invalid or empty data`. Both groups are at the end of the test file.

## Detailed Test Cases

### TC-SD-01: Map search response

**Objective:** Verify that one TMDB `search/multi` response is split into movies, TV shows and results.
**Preconditions:** `TMDB_API_KEY` is set; fetch mock returns the fixture search response.
**Steps:** Call the route with `Dark Breaking` and the default locale.
**Expected Result:** Status 200, `error` is `null`, `movies` and `tvShows` contain one id each, `results` has 2 entries, the TMDB call contains `query=Dark Breaking` and `include_adult=false`.

### TC-SD-02 / TC-SD-03: Short, empty or missing query

**Objective:** Verify that no TMDB request is made for unusable queries.
**Steps:** Call the route with `ab`, an empty string, and without `q`.
**Expected Result:** Status 200, empty `movies`, `tvShows`, `results`, `error` is `null`, no `search/multi` call.

### TC-SD-04: Missing API key

**Objective:** Verify the error response without `TMDB_API_KEY`.
**Preconditions:** `TMDB_API_KEY` is set to an empty string.
**Steps:** Call the route with a valid query.
**Expected Result:** Status 500, `error` equals `messages.apiKeyMissing`, empty results, no TMDB call.

### TC-SD-05: TMDB failure

**Objective:** Verify the error response when TMDB fails.
**Preconditions:** The `search` endpoint answers with an error.
**Steps:** Call the route with a valid query.
**Expected Result:** Status 500, `error` equals `messages.searchError`, `movies` is empty.

### TC-SD-06: Invalid locale

**Objective:** Verify locale validation by length.
**Steps:** Call the route with `x` and `this-is-too-long`.
**Expected Result:** Status 400, `error` is `Invalid locale.`, no TMDB call.
**Note:** The schema checks the length (2-10 characters), not the list of supported locales.

### TC-SD-07: Supported locales as language

**Objective:** Verify that each supported locale reaches TMDB unchanged.
**Steps:** Call the route once per entry of `SUPPORTED_LOCALES`.
**Expected Result:** Status 200, `language` of the last `search/multi` call equals the locale.

### TC-SD-08: Unknown locale

**Objective:** Document the current behavior for a locale that is not supported.
**Steps:** Without API key, call the route with `xx-XX` and `DEFAULT_LOCALE`; then with API key, call it with `xx-XX`.
**Expected Result:** Both errors equal `messages.apiKeyMissing`; TMDB receives `language=xx-XX`.

### TC-SD-09: Texts of another locale

**Objective:** Verify that a supported locale uses its own UI texts.
**Preconditions:** `TMDB_API_KEY` is empty.
**Steps:** Call the route with the first locale that differs from `DEFAULT_LOCALE`.
**Expected Result:** `error` equals that locale's `apiKeyMissing` and differs from the default text.

### TC-SD-10 / TC-SD-11: Search result to detail page

**Objective:** Verify that ids from the route response render the detail pages.
**Steps:** Call the route, render the page with the id of the first movie or TV result.
**Expected Result:** Movie: title, runtime, cast names and provider are visible. TV: title, cast names, provider and season label are visible.

### TC-SD-12 to TC-SD-16: Partial TMDB data

**Objective:** Verify that detail pages stay usable when optional data is missing.
**Steps:** Make one source fail or empty: movie providers, certification, `credits`, `runtime`, TV season.
**Expected Result:** The title is still rendered; the affected part (provider, cast, runtime) is not rendered.

### TC-SD-17 to TC-SD-19: Detail pages per locale

**Objective:** Verify region-dependent providers and rendering for all locales.
**Preconditions:** Fixture providers exist for the region of the default locale only.
**Steps:** Render the movie page with `DEFAULT_LOCALE`, with every other locale, and movie plus TV page for every supported locale.
**Expected Result:** Provider visible only for the default locale; both pages show their title for every supported locale.

### TC-SD-20: Typeahead with real route

**Objective:** Verify typeahead results and links using the real search route.
**Steps:** Render `TypeHeadSearch`, enter `Dark Breaking`.
**Expected Result:** Movie and TV title are shown as `a[role="option"]` with `href` equal to `movie.result.href` and `tv.result.href`.

### TC-SD-21: Typeahead error state

**Objective:** Verify the error message in the typeahead.
**Preconditions:** The `search` endpoint answers with an error.
**Steps:** Render `TypeHeadSearch`, enter `Dark Breaking`.
**Expected Result:** `messages.searchError` is displayed (at least once), the movie title is not shown.

### TC-SD-22: Results of another type

**Objective:** Verify that `search/multi` results that are neither movie nor TV show do not reach the response.
**Preconditions:** The TMDB response contains the fixture results plus an item with `media_type: 'person'`.
**Steps:** Call the route with `Dark Breaking`.
**Expected Result:** Status 200, `error` is `null`, the id of the person is not in `results`, `results` still has 2 entries, `movies` and `tvShows` contain one id each.

### TC-SD-23: No search results

**Objective:** Verify the response for a valid query without hits.
**Preconditions:** The TMDB response has an empty `results` list.
**Steps:** Call the route with `Dark Breaking`.
**Expected Result:** Status 200, `movies`, `tvShows` and `results` are empty, `error` is `null`, exactly one `search/multi` call (in contrast to TC-SD-02, TMDB is asked).

### TC-SD-24: TV details request fails

**Objective:** Verify the error message when the main TV request fails.
**Preconditions:** The `tv` endpoint answers with an error.
**Steps:** Render the TV page with the fixture id.
**Expected Result:** `messages.tvShowLoadError` is shown, the title is not.

### TC-SD-25: Invalid TV id

**Objective:** Verify that an invalid `id` is rejected before any request.
**Steps:** Render the TV page with the id `abc`.
**Expected Result:** `Invalid URL parameters.` is shown, no request to a `/tv/` endpoint.

### TC-SD-26: Empty TV data

**Objective:** Verify the fallback texts for missing overview, genres and credits.
**Preconditions:** The `tv` endpoint answers with `overview: ''`, `genres: []` and no `credits`.
**Steps:** Render the TV page with the fixture id.
**Expected Result:** The title is shown, `fallbacks.notAvailable` appears at least once, the cast names are not shown.

## Pass/Fail Criteria

A test case passes when every assertion within its `it(...)` block succeeds. It fails if a status code, response field, rendered text, link, TMDB request parameter or number of TMDB calls differs from the expectation.

## Risks and Limitations

- The TMDB API is mocked; changes in the real API are not detected.
- Unknown locales (e.g. `xx-XX`) are currently passed unchanged to TMDB (TC-SD-08); the test documents this behavior and must be adapted if the route is changed.
- Provider tests (TC-SD-17/18) assume the fixture providers belong to the region of `DEFAULT_LOCALE`.
- The fixture `href` values must match `DEFAULT_LOCALE` (currently `en-US`).
- TC-SD-21 depends on `TypeHeadSearch` showing the text of `searchError`; a different mock text in `i18nMockDefault` would make it fail.
- TC-SD-22 and TC-SD-23 build their TMDB body from `searchToDetailsFixture.searchResponse` and assume it has a `results` array like the TMDB response.
- TC-SD-25 assumes that `IdParamSchema` rejects non-numeric ids; TC-SD-26 assumes that the TV schema accepts an empty `overview` and missing `credits`.
- Navigation by clicking and real routing are only covered by Cypress.

## Execution

```bash
npx vitest run vitest/integration/typeheadsearch-search-to-details/search-to-details.test.jsx
```
