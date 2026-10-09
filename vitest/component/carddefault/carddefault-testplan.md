# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** CardDefault
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `CardDefault.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `CardDefault`, the default card used in lists to link to a movie or TV show detail page. The tests verify routing, rendering of the main fields, the fallback behaviour for missing data, the guard for invalid input and the image load/error handlers.

### 3. Test Items

- `components/CardDefault.jsx`
- Mocked dependency: `@/lib/stores/locale` (`useI18n`, `useLocale`, locale `en-US`)
- Test data: `vitest/fixtures/tmdb/tmdb.browser.fixtures.js` (`moviesPopular`, `genresMovie`)

### 4. Features to be Tested

- Route generation for movies (`/en-US/movies/{id}`)
- Route generation for TV shows (`/en-US/tv-shows/{id}`)
- Rendering of title and release date (`<time datetime>`)
- Early exit (`return null`) when `id` or `mediaType` is invalid
- Fallback text `N/A` for missing rating, title, date, certification and genres
- Image lifecycle handlers `onLoad` and `onError`

### 5. Features not to be Tested

- Keyboard navigation and accessibility (separate a11y tests)
- Visual layout and styling
- Navigation after clicking the link (Cypress acceptance tests)
- Fetching of TMDB data

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design techniques:** Equivalence Partitioning (movie / tv / invalid input), Error Guessing (missing fields)
- **Structural coverage:** Statement Coverage and Branch Coverage (documented in the test comments)
- **Isolation:** Locale store is mocked; fixtures provide the TMDB data

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed and no unexpected error occurs.
- **Fail:** At least one assertion fails or the test throws an error.

### 8. Coverage Matrix

| Test Case | Input class                | Statement Coverage                   | Branch Coverage                                                                                                 |
| --------- | -------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| TC-CD-001 | Valid movie, all fields    | Variables, element rendering, styles | -                                                                                                               |
| TC-CD-002 | Valid TV show              | Alternative URL evaluation           | -                                                                                                               |
| TC-CD-003 | Invalid `id` / `mediaType` | `return null`                        | `hasValidCard` = false                                                                                          |
| TC-CD-004 | Missing fields             | Evaluation of missing values         | `rating > 0` = false, `title?.trim()` = false, `date` = false, `certificationMeta` = false, `hasGenres` = false |
| TC-CD-005 | Image events               | `onLoad`, `onError` handlers         | `imageLoaded` = true, `imageErrored` = true, `img.complete && img.naturalWidth > 0`                             |

### 9. Derived Test Cases

#### TC-CD-001: Movie card renders route, title and date

- **Precondition:** Locale is `en-US`; movie fixture and genres loaded.
- **Steps:** Render `CardDefault` with `mediaType="movie"`, title, date, rating, certification, genres and image.
- **Expected result:**
  - The link has `href="/en-US/movies/{id}"`.
  - The movie title is in the document.
  - A `<time>` element with `datetime` = release date exists.

#### TC-CD-002: TV show card uses the TV route

- **Steps:** Render `CardDefault` with `id=999`, `mediaType="tv"`, title `Sample TV Show`, date `2026-01-01`.
- **Expected result:** The link has `href="/en-US/tv-shows/999"`.

#### TC-CD-003: Invalid input renders nothing

- **Steps:** Render `CardDefault` with `id=""` and `mediaType` undefined.
- **Expected result:** `container.firstChild` is `null`.

#### TC-CD-004: Fallback text for missing fields

- **Steps:** Render `CardDefault` with `mediaType="movie"`, empty title, `rating=0`, empty genres and empty date.
- **Expected result:** At least one element with the text `N/A` is displayed.

#### TC-CD-005: Image load and error events

- **Steps:** Render `CardDefault` with `imageUrl="/test-image.jpg"`, then fire `load` and `error` on the image.
- **Expected result:** Both handlers run without an error. The test contains no explicit assertion on the resulting CSS classes (`image-loaded`, `image-error`).

### 10. Gherkin User Stories

```gherkin
Feature: CardDefault component

  Scenario: Movie card links to the movie detail page
    Given a movie with title, date, rating, certification and genres
    When the card is rendered
    Then the link points to "/en-US/movies/{id}"
    And the title and the release date are displayed

  Scenario: TV show card links to the TV show detail page
    Given a TV show with id 999
    When the card is rendered
    Then the link points to "/en-US/tv-shows/999"

  Scenario: Invalid card renders nothing
    Given an empty id and no media type
    When the card is rendered
    Then nothing is displayed

  Scenario: Missing data shows fallback text
    Given a movie without title, rating, genres and date
    When the card is rendered
    Then the fallback text "N/A" is displayed

  Scenario: Image events are handled
    Given a card with an image URL
    When the image fires a load event and an error event
    Then the card handles both events without an error
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/carddefault
```

### 12. Notes

- TC-CD-005 verifies only that the handlers run. An assertion on the `image-loaded` / `image-error` classes could be added later.
- The `certificationMeta` fallback is covered only indirectly through TC-CD-004; there is no assertion on the border style.

### 13. Traceability Matrix

| Feature                     | Test Case |
| --------------------------- | --------- |
| Movie route and main fields | TC-CD-001 |
| TV show route               | TC-CD-002 |
| Guard for invalid input     | TC-CD-003 |
| Fallback for missing data   | TC-CD-004 |
| Image load/error handling   | TC-CD-005 |
