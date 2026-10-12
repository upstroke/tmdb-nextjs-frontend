# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** HeaderMain
- **Version:** 1.3
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `HeaderMain.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `HeaderMain`, the main header with navigation, search and language switcher. The tests verify the rendering of the navigation, the skip link, the active link, the mobile menu toggle, the closing of the mobile menu when a link is clicked, the link targets of all navigation items, the restoration of the stored page from `sessionStorage` and the handling of storage errors. The child components `TypeHeadSearch` and `LanguageSwitcher` are replaced by mocks and are tested separately.

### 3. Test Items

- `components/HeaderMain.jsx`
- Mocked dependencies:
  - `next/navigation` (`usePathname`, `useRouter`)
  - `@/lib/stores/locale` (`useI18n`, `useLocale`, `setLocale`)
  - `LanguageSwitcher` (replaced by a placeholder with `data-testid="mock-language-switcher"`)
  - `@/components/TypeHeadSearch` (replaced by a placeholder with `data-testid="mock-typeahead-search"`)

### 4. Features to be Tested

- Rendering of the main navigation (`nav` with the name `Main navigation`)
- Presence of the search and language switcher placeholders
- Navigation item titles from i18n
- Active link state (`link-active`, `aria-current="page"`)
- Mobile menu toggle button (`aria-expanded` false to true to false) with click events
- Mobile menu closes (`aria-expanded` true to false) when a navigation link is clicked
- Skip link to `#main-content`, placed before the burger button and the navigation in the DOM
- Movies link with the page number from `sessionStorage` (`/en-US/movies?page=5`)
- Fallback to `/en-US/movies` when `sessionStorage` throws an error
- Link targets of Home (`/en-US`) and TV shows (`/en-US/tv-shows`, with a stored page `/en-US/tv-shows?page=3`)

### 5. Features not to be Tested

- Behaviour of `TypeHeadSearch` and `LanguageSwitcher` (separate component tests)
- Real routing with `next/navigation`; the real page change after a click is tested in Cypress (NAV-05)
- Real tab order and focus visibility in the browser (separate Cypress a11y tests)
- Closing the burger menu by clicking outside (Cypress acceptance tests)
- Visual layout and responsive breakpoints

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design techniques:** State Transition Testing (menu closed to open to closed, also through a link click), Equivalence Partitioning (no stored page / stored page / storage error, link with and without storage key), Error Guessing (`sessionStorage.getItem` throws)
- **Structural coverage:** Statement Coverage and Branch Coverage (documented in the test comments)
- **Isolation:** Router, locale store and both child components are mocked; before each test all spies are restored (`vi.restoreAllMocks()`), `sessionStorage` is cleared and the pathname is reset to `/en-US`

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed and no unexpected error occurs.
- **Fail:** At least one assertion fails or the test throws an error.

### 8. Coverage Matrix

| Test Case | Input class                           | Statement Coverage                                      | Branch Coverage          |
| --------- | ------------------------------------- | ------------------------------------------------------- | ------------------------ |
| TC-HM-001 | Path `/en-US`, no stored page         | List navigation loop, standard layout, click bindings   | -                        |
| TC-HM-002 | Path `/en-US/movies`, stored page `5` | `sessionStorage` extraction, dynamic target calculation | -                        |
| TC-HM-003 | `sessionStorage.getItem` throws       | `catch` block                                           | try/catch exception path |
| TC-HM-004 | Path `/en-US`, default render         | Skip link rendered before burger button and navigation  | -                        |
| TC-HM-005 | Path `/en-US`, menu open              | `onClick` handler of the links closes the menu          | -                        |
| TC-HM-006 | Path `/en-US`, stored TV page `3`     | Home and TV shows link targets, TV page restoration     | -                        |

### 9. Derived Test Cases

#### TC-HM-001: Header renders navigation and toggles the mobile menu

- **Precondition:** Pathname is `/en-US`; `sessionStorage` is empty.
- **Steps:**
  1. Render `HeaderMain`.
  2. Fire `click` on the button `Toggle menu`.
  3. Fire `click` on the button again.
- **Expected result:**
  - The navigation `Main navigation`, the search placeholder and the language switcher placeholder are displayed.
  - The texts `Home Title` and `Movies Title` are displayed.
  - The link `Home Title` has the class `link-active` and `aria-current="page"`.
  - The toggle button has `aria-expanded="false"` at the start, `"true"` after the first click and `"false"` after the second.

#### TC-HM-002: Movies link restores the stored page

- **Precondition:** `sessionStorage` contains `movies-page` = `5`; pathname is `/en-US/movies`.
- **Steps:** Render `HeaderMain`.
- **Expected result:**
  - The text `tvShows` is displayed.
  - The link `Movies Title` has the class `link-active`.
  - The link `Movies Title` has `href="/en-US/movies?page=5"`.

#### TC-HM-003: Storage error falls back to the base route

- **Precondition:** `Storage.prototype.getItem` throws `Storage blocked`.
- **Steps:** Render `HeaderMain`.
- **Expected result:** The link `Movies Title` has `href="/en-US/movies"` and the render does not fail.

#### TC-HM-004: Skip link comes before the burger button and the navigation

- **Precondition:** Pathname is `/en-US`.
- **Steps:**
  1. Render `HeaderMain`.
  2. Compare the DOM position of the skip link with the burger button and with the navigation.
- **Expected result:**
  - The link `Skip to main content` has `href="#main-content"`.
  - The skip link precedes the button `Toggle menu` and the navigation `Main navigation` in the DOM, so it is the first tab stop.

#### TC-HM-005: Mobile menu closes when a navigation link is clicked

- **Precondition:** Pathname is `/en-US`.
- **Steps:**
  1. Render `HeaderMain`.
  2. Fire `click` on the button `Toggle menu`.
  3. Fire `click` on the link `Movies Title`; the browser default of the click is prevented.
- **Expected result:**
  - The toggle button has `aria-expanded="true"` after the first click.
  - The toggle button has `aria-expanded="false"` after the click on the link.

#### TC-HM-006: Home and TV shows links point to their routes

- **Precondition:** Pathname is `/en-US`; `sessionStorage` is empty.
- **Steps:**
  1. Render `HeaderMain`.
  2. Set `tv-shows-page` = `3` in `sessionStorage` and render again.
- **Expected result:**
  - After step 1 the link `Home Title` has `href="/en-US"` and the link `tvShows` has `href="/en-US/tv-shows"`.
  - After step 2 the link `tvShows` has `href="/en-US/tv-shows?page=3"` and the link `Home Title` still has `href="/en-US"`.

### 10. Gherkin User Stories

```gherkin
Feature: HeaderMain component

  Background:
    Given the locale is "en-US"
    And the search and the language switcher are replaced by placeholders

  Scenario: Header shows navigation and toggles the menu
    Given the current path is "/en-US"
    When the header is rendered
    Then the navigation "Main navigation" is displayed
    And the link "Home Title" is active
    And the toggle button has aria-expanded "false"
    When the user presses the toggle button
    Then the toggle button has aria-expanded "true"
    When the user presses the toggle button again
    Then the toggle button has aria-expanded "false"

  Scenario: Movies link restores the stored page
    Given sessionStorage contains "movies-page" with the value "5"
    And the current path is "/en-US/movies"
    When the header is rendered
    Then the link "Movies Title" is active
    And it points to "/en-US/movies?page=5"

  Scenario: Storage is not available
    Given reading from sessionStorage throws an error
    When the header is rendered
    Then the link "Movies Title" points to "/en-US/movies"

  Scenario: Skip link is the first focusable element
    Given the current path is "/en-US"
    When the header is rendered
    Then the link "Skip to main content" points to "#main-content"
    And it comes before the toggle button and the navigation

  Scenario: Menu closes when a link is clicked
    Given the current path is "/en-US"
    And the header is rendered
    When the user presses the toggle button
    Then the toggle button has aria-expanded "true"
    When the user clicks the link "Movies Title"
    Then the toggle button has aria-expanded "false"

  Scenario: Home and TV shows links point to their routes
    Given the current path is "/en-US"
    When the header is rendered
    Then the link "Home Title" points to "/en-US"
    And the link "tvShows" points to "/en-US/tv-shows"
    When sessionStorage contains "tv-shows-page" with the value "3"
    And the header is rendered again
    Then the link "tvShows" points to "/en-US/tv-shows?page=3"
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/headermain
```

### 12. Notes

- TC-HM-002 and TC-HM-006 look for the text `tvShows`. This is a raw key, because the i18n mock has no title for `tvShows`. The tests therefore document a missing mock entry and not a real label.
- `LanguageSwitcher` and `TypeHeadSearch` are mocked with the alias path `@/components/...`. The alias must resolve to the real component, otherwise the mock has no effect.
- TC-HM-003 uses `vi.spyOn(Storage.prototype, 'getItem')`. `vi.clearAllMocks()` does not restore the original implementation, so `beforeEach` calls `vi.restoreAllMocks()` first. Without it the spy stayed active and made later tests (found with TC-HM-006) read no stored page.
- The tests use `click`, not `pointerDown`, for the toggle button. `HeaderMain` toggles on `onClick`, so Enter and Space work too (DEF-01 in `cypress/accessibility/menu/menu-testplan.md`). `fireEvent.click` runs the same handler as the keyboard. Real keyboard operation is tested in Cypress (A11Y-MENU-10).
- TC-HM-004 checks the DOM order only. The real tab order with a keyboard is tested in Cypress (A11Y-MENU-05).
- TC-HM-005 checks only the state of the menu. The real page change after the click and the closing on a mobile viewport are tested in Cypress (NAV-05 and NAV-09 in `cypress/e2e/navigation/navigation-testplan.md`). TC-HM-005 prevents the browser default of the click, because a real navigation would unload the test iframe and hang the run.

### 13. Traceability Matrix

| Feature                              | Test Case            |
| ------------------------------------ | -------------------- |
| Main navigation and placeholders     | TC-HM-001            |
| Navigation titles and active link    | TC-HM-001, TC-HM-002 |
| Mobile menu toggle (`aria-expanded`) | TC-HM-001            |
| Mobile menu closes on link click     | TC-HM-005            |
| Skip link before navigation          | TC-HM-004            |
| Stored movies page in the link       | TC-HM-002            |
| Home and TV shows link targets       | TC-HM-006            |
| Stored TV page in the link           | TC-HM-006            |
| Fallback on storage error            | TC-HM-003            |
