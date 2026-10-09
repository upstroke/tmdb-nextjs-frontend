# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** DetailsHero
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `DetailsHero.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `DetailsHero`, the hero section of a detail page with backdrop, poster, title and a list of production companies. The tests verify the rendering of the main content, the fallback from backdrop to poster, and the fallback texts for missing data.

### 3. Test Items

- `components/DetailsHero.jsx`
- Mocked dependency: `@/lib/stores/locale` (`useI18n` with `fallbacks.notAvailable` = `N/A`)
- Test data: `vitest/fixtures/tmdb/tmdb.browser.fixtures.js` (`movieDetail`); the genres of the fixture are reused as mock production companies

### 4. Features to be Tested

- Rendering of the title as heading level 1
- Rendering of the production companies list
- Custom empty label when the production companies list is empty
- Fallback from backdrop to poster image when the backdrop is missing
- Fallback text `N/A` for empty title and empty label
- Fallback poster URL `/not-available.png` when the poster is missing

### 5. Features not to be Tested

- Keyboard navigation and accessibility (separate a11y tests)
- Visual layout and styling
- Actual loading of the images
- Fetching of TMDB data

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design techniques:** Equivalence Partitioning (full data / missing backdrop and companies / all data missing), Error Guessing (empty strings and empty lists)
- **Structural coverage:** Statement Coverage and Branch Coverage (documented in the test comments)
- **Isolation:** Locale store is mocked; fixtures provide the TMDB data

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed and no unexpected error occurs.
- **Fail:** At least one assertion fails or the test throws an error.

### 8. Coverage Matrix

| Test Case | Input class                    | Statement Coverage                                          | Branch Coverage                                                                                                         |
| --------- | ------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| TC-DH-001 | All data present               | Layout structure, background image assignment, list mapping | `productionCompanies.length > 0` = true                                                                                 |
| TC-DH-002 | Backdrop and companies missing | Poster fallback, empty label rendering                      | backdrop missing = true (`fallbackImage = posterUrl`), `productionCompanies.length > 0` = false                         |
| TC-DH-003 | All props empty                | Default fallback chains                                     | `resolvedTitle = notAvailableText`, `resolvedPosterUrl = '/not-available.png'`, `resolvedEmptyLabel = notAvailableText` |

### 9. Derived Test Cases

#### TC-DH-001: Hero renders title and production companies

- **Precondition:** Movie detail fixture loaded.
- **Steps:** Render `DetailsHero` with title, backdrop, poster, a list of production companies and the empty label `No companies listed`.
- **Expected result:**
  - A heading level 1 with the movie title is displayed.
  - Every company name of the list is displayed.
  - The text `No companies listed` is not in the document.

#### TC-DH-002: Poster fallback and custom empty label

- **Steps:** Render `DetailsHero` with title, empty backdrop, poster, empty companies list and the empty label `Custom Empty Label`.
- **Expected result:** The text `Custom Empty Label` is displayed.

#### TC-DH-003: Global fallback text

- **Steps:** Render `DetailsHero` with empty title, backdrop, poster and empty label, and an empty companies list.
- **Expected result:** The text `N/A` is displayed at least twice (title and list).

### 10. Gherkin User Stories

```gherkin
Feature: DetailsHero component

  Scenario: Hero shows title and production companies
    Given a movie with title, backdrop, poster and production companies
    When the hero is rendered
    Then the title is displayed as heading level 1
    And all production companies are listed
    And the empty label is not displayed

  Scenario: Missing backdrop and companies
    Given a movie without backdrop and without production companies
    And the empty label "Custom Empty Label"
    When the hero is rendered
    Then the text "Custom Empty Label" is displayed

  Scenario: All data missing
    Given empty title, backdrop, poster and empty label
    When the hero is rendered
    Then the fallback text "N/A" is displayed at least twice
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/detailshero
```

### 12. Notes

- The image URLs in TC-DH-001 and TC-DH-002 are written as `` `https://tmdb.org{rawDetail.backdrop_path}` `` without a `$` before the braces. The value is therefore a fixed string and not the fixture path. This does not affect the assertions, but it should be corrected.
- TC-DH-002 does not assert that the poster is used as the background image. The branch is executed, but the result is not checked.
- TC-DH-003 does not assert the poster URL `/not-available.png`.
- The mock company data are the genres of the fixture, not real production companies.

### 13. Traceability Matrix

| Feature                            | Test Case                                 |
| ---------------------------------- | ----------------------------------------- |
| Title as heading level 1           | TC-DH-001                                 |
| Production companies list          | TC-DH-001                                 |
| Custom empty label                 | TC-DH-002                                 |
| Backdrop to poster fallback        | TC-DH-002 (branch executed, not asserted) |
| `N/A` fallback for title and label | TC-DH-003                                 |
| Fallback poster URL                | TC-DH-003 (branch executed, not asserted) |
