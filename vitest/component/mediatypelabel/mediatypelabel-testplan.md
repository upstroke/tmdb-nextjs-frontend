# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** MediaTypeLabel
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `MediaTypeLabel.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `MediaTypeLabel`, a small label that shows whether an item is a movie or a TV show. The tests verify the translated text and the colour class for both supported media types, the custom class name, and the behaviour for an unsupported media type.

### 3. Test Items

- `components/MediaTypeLabel.jsx`
- Mocked dependency: `@/lib/stores/locale` (`useI18n` with `labels.movie` = `Movie` and `labels.tvShow` = `TV Show`)

### 4. Features to be Tested

- Label for `mediaType="movie"` with the text `Movie` and the classes `ui`, `label`, `blue`
- Label for `mediaType="tv"` with the text `TV Show` and the classes `ui`, `label`, `teal`
- Appending of a custom `className` (`custom-class`)
- Default value of `className` (empty)
- Guard clause: nothing is rendered for an unsupported media type (`podcast`)

### 5. Features not to be Tested

- Accessibility (separate a11y tests)
- Visual appearance of the colours (only the class names are checked)
- Translation of the labels into other languages
- Behaviour for a missing `mediaType` (`undefined` or `null`)

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design techniques:** Equivalence Partitioning (`movie` / `tv` / unsupported value)
- **Structural coverage:** Statement Coverage (documented in the test comments)
- **Isolation:** Locale store is mocked

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed.
- **Fail:** At least one assertion fails or the test throws an error.

### 8. Coverage Matrix

| Test Case | `mediaType` | `className` | Statement Coverage |
|---|---|---|---|
| TC-MT-001 | `movie` | not set | Movie branch and default empty `className` |
| TC-MT-002 | `tv` | `custom-class` | TV branch and appended custom class |
| TC-MT-003 | `podcast` | not set | Guard clause that returns `null` |

### 9. Derived Test Cases

#### TC-MT-001: Movie label

- **Steps:** Render `MediaTypeLabel` with `mediaType="movie"`.
- **Expected result:**
  - The text `Movie` is displayed.
  - The element has the classes `ui`, `label` and `blue`.

#### TC-MT-002: TV show label with custom class

- **Steps:** Render `MediaTypeLabel` with `mediaType="tv"` and `className="custom-class"`.
- **Expected result:**
  - The text `TV Show` is displayed.
  - The element has the classes `ui`, `label`, `teal` and `custom-class`.

#### TC-MT-003: Unsupported media type

- **Steps:** Render `MediaTypeLabel` with `mediaType="podcast"`.
- **Expected result:**
  - The container is empty.
  - The texts `Movie` and `TV Show` are not in the document.

### 10. Gherkin User Stories

```gherkin
Feature: MediaTypeLabel component

  Scenario: Movie label
    Given the media type is "movie"
    When the label is rendered
    Then the text "Movie" is displayed
    And the label has the colour class "blue"

  Scenario: TV show label with custom class
    Given the media type is "tv" and the class name is "custom-class"
    When the label is rendered
    Then the text "TV Show" is displayed
    And the label has the classes "teal" and "custom-class"

  Scenario: Unsupported media type
    Given the media type is "podcast"
    When the label is rendered
    Then nothing is displayed
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/mediatypelabel
```

### 12. Notes

- TC-MT-001 does not check that `custom-class` is absent, so the default empty `className` is not asserted explicitly.
- The colours are checked through class names only, not through the rendered style.
- A missing `mediaType` (`undefined`, `null`, empty string) is not tested. Only one unsupported value (`podcast`) is used.
- The component has no logical branches beyond the media type, so Statement Coverage is sufficient.

### 13. Traceability Matrix

| Feature | Test Case |
|---|---|
| Movie label, text and colour | TC-MT-001 |
| TV show label, text and colour | TC-MT-002 |
| Custom class name | TC-MT-002 |
| Guard for unsupported media type | TC-MT-003 |
