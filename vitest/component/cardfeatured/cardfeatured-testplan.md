# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** CardFeatured
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `CardFeatured.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `CardFeatured`, the large featured card that presents a movie or TV show with overview, genres and action links. The tests verify the rendering of the main content, the media type specific label and route, and the fallback behaviour for missing or unknown data.

### 3. Test Items

- `components/CardFeatured.jsx`
- Mocked dependency: `@/lib/stores/locale` (`useI18n`, `useLocale`, locale `en-US`)
- Test data: `vitest/fixtures/tmdb/tmdb.browser.fixtures.js` (`moviesPopular`) and two sample genres (Action, Adventure)

### 4. Features to be Tested

- Rendering of title (heading), overview and genres
- Media type label for movies (`Movie`) and TV shows (`TV Show`)
- "More Info" link to the movie route (`/en-US/movies/{id}`)
- "More Info" link to the TV show route (`/en-US/tv-shows/{id}`)
- "Official Website" link from the `homepage` property
- Fallback text `N/A` for empty title and overview
- Omission of the "More Info" and "Official Website" links for unknown media type or empty homepage

### 5. Features not to be Tested

- Keyboard navigation and accessibility (separate a11y tests)
- Visual layout, styling and dynamic CSS variables
- Image loading (backdrop and poster)
- Navigation after clicking a link (Cypress acceptance tests)
- Fetching of TMDB data

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design techniques:** Equivalence Partitioning (movie / tv / unknown media type), Error Guessing (empty strings and empty lists)
- **Structural coverage:** Statement Coverage and Branch Coverage (documented in the test comments)
- **Isolation:** Locale store is mocked; fixtures provide the TMDB data

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed and no unexpected error occurs.
- **Fail:** At least one assertion fails or the test throws an error.

### 8. Coverage Matrix

| Test Case | Input class | Statement Coverage | Branch Coverage |
|---|---|---|---|
| TC-CF-001 | Valid movie, all fields | Layout rendering, description parsing, dynamic CSS variable styles | - |
| TC-CF-002 | Valid TV show, minimal fields | TV label and route | `mediaType === 'tv'` = true |
| TC-CF-003 | Unknown media type, empty fields | Fallback rendering | `normalizedType === null`, empty title, empty overview, empty homepage, empty genres, empty release date |

### 9. Derived Test Cases

#### TC-CF-001: Movie card renders content and links

- **Precondition:** Locale is `en-US`; popular movie fixture loaded.
- **Steps:** Render `CardFeatured` with `mediaType="movie"`, title, release date, overview, homepage `https://spiderman-movie.com`, two genres, backdrop and poster.
- **Expected result:**
  - A heading with the movie title is displayed.
  - The label `Movie` is displayed.
  - The overview text is displayed.
  - The genres `Action` and `Adventure` are displayed.
  - The link "More Info" has `href="/en-US/movies/{id}"`.
  - The link "Official Website" has `href="https://spiderman-movie.com"`.

#### TC-CF-002: TV show card uses TV label and route

- **Steps:** Render `CardFeatured` with `id=142`, `mediaType="tv"`, title `Sample TV Show`, release date `2026-08-14` and genre `Drama`.
- **Expected result:**
  - The label `TV Show` is displayed.
  - The link "More Info" has `href="/en-US/tv-shows/142"`.

#### TC-CF-003: Fallbacks and omitted links

- **Steps:** Render `CardFeatured` with `id=99`, `mediaType="unknown"`, empty title, empty overview, empty homepage, empty genres and empty release date.
- **Expected result:**
  - At least one element with the text `N/A` is displayed.
  - The link "More Info" is not in the document.
  - The link "Official Website" is not in the document.

### 10. Gherkin User Stories

```gherkin
Feature: CardFeatured component

  Scenario: Featured movie shows content and links
    Given a movie with title, overview, genres and homepage
    When the featured card is rendered
    Then the title, the label "Movie", the overview and the genres are displayed
    And "More Info" links to "/en-US/movies/{id}"
    And "Official Website" links to the homepage

  Scenario: Featured TV show uses the TV route
    Given a TV show with id 142
    When the featured card is rendered
    Then the label "TV Show" is displayed
    And "More Info" links to "/en-US/tv-shows/142"

  Scenario: Unknown media type and missing data
    Given an unknown media type and empty title, overview, homepage, genres and release date
    When the featured card is rendered
    Then the fallback text "N/A" is displayed
    And no "More Info" link is displayed
    And no "Official Website" link is displayed
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/cardfeatured
```

### 12. Notes

- TC-CF-002 renders no overview, homepage or images. It therefore checks only the label and the route.
- TC-CF-003 checks that at least one `N/A` is present, not that each individual field shows `N/A`.
- The metadata blocks for genres and release date are omitted when empty. The test does not assert this explicitly.

### 13. Traceability Matrix

| Feature | Test Case |
|---|---|
| Title, overview, genres | TC-CF-001 |
| Movie label and route | TC-CF-001 |
| Official Website link | TC-CF-001 |
| TV show label and route | TC-CF-002 |
| Fallback `N/A` | TC-CF-003 |
| Omitted links for unknown type / empty homepage | TC-CF-003 |
