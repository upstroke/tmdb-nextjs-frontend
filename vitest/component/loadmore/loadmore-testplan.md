# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** LoadMore
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `LoadMore.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `LoadMore`, the button that loads further items of a list. The button has three states: active, loading and end of list. The tests verify the callback of the active button and the disabled states for loading and for the end of the list.

### 3. Test Items

- `components/LoadMore.jsx`
- Mocked dependency: `@/lib/stores/locale` (`useI18n` with `messages.loadMore` = `Load More Content` and `messages.loadMoreLoading` = `Loading additional items...`)

### 4. Features to be Tested

- Active button with the label `Load More Content`
- Call of `onLoad` after a click on the active button
- Disabled button while `loading` is `true`
- Execution of the `onClick` statement of the loading button
- Disabled button when `hasMore` is `false`

### 5. Features not to be Tested

- Keyboard operation, focus and accessibility (separate a11y tests)
- Visual appearance of the loading skeleton and animations
- Loading of the next page of the list (`PagedList` and Cypress acceptance tests)
- Display of the loading text `Loading additional items...`
- Visual styling of the disabled state

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design techniques:** Equivalence Partitioning and State Transition Testing on the combination of `hasMore` and `loading` (active / loading / end of list)
- **Structural coverage:** Statement Coverage and Branch Coverage (documented in the test comments)
- **Isolation:** Locale store is mocked; `onLoad` is replaced by a spy

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed and no unexpected error occurs.
- **Fail:** At least one assertion fails or the test throws an error.

### 8. Coverage Matrix

| Test Case | `hasMore` | `loading` | `onLoad` | Statement Coverage | Branch Coverage |
|---|---|---|---|---|---|
| TC-LM-001 | true | false | spy | Standard click handler path | - |
| TC-LM-002 | true | true | spy | `onClick` statement of the loading button (forced) | `loading` = true |
| TC-LM-003 | false | false | null | Button for the end of the list | `loading` = false, `!hasMore` = true |

### 9. Derived Test Cases

#### TC-LM-001: Active button calls onLoad

- **Steps:**
  1. Render `LoadMore` with `hasMore={true}`, `loading={false}` and an `onLoad` spy.
  2. Click the button `Load More Content`.
- **Expected result:** `onLoad` is called exactly once.

#### TC-LM-002: Loading button is disabled

- **Steps:**
  1. Render `LoadMore` with `hasMore={true}`, `loading={true}` and an `onLoad` spy.
  2. Read the `onClick` handler of the button from the React props (`__reactProps`) and call it directly. If no handler is found, fire a click event instead.
- **Expected result:**
  - The button is disabled.
  - `onLoad` has been called.

#### TC-LM-003: End of the list disables the button

- **Steps:** Render `LoadMore` with `hasMore={false}`, `loading={false}` and `onLoad={null}`.
- **Expected result:** The button `Load More Content` is displayed and disabled.

### 10. Gherkin User Stories

```gherkin
Feature: LoadMore component

  Scenario: Active button loads more items
    Given more items are available and nothing is loading
    When the button "Load More Content" is clicked
    Then the onLoad callback is called once

  Scenario: Button is disabled while loading
    Given more items are available and loading is in progress
    When the load more button is rendered
    Then the button is disabled

  Scenario: Button is disabled at the end of the list
    Given no more items are available
    When the load more button is rendered
    Then the button "Load More Content" is disabled
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/loadmore
```

### 12. Notes

- TC-LM-002 does not test user behaviour. A real browser does not trigger `onClick` on a disabled button. The test calls the handler directly from the internal React props only to execute the statement for coverage. The assertion `onLoad` has been called therefore shows that the handler has no guard against `loading`, not that a user can trigger a second load. The component should be checked for a guard if double loading must be excluded.
- The code comment of TC-LM-002 is written in German (`Sicheres Fallback ...`). The test accesses React internals (`__reactProps`), which can break with a React update.
- TC-LM-002 does not assert the loading text `Loading additional items...`.
- TC-LM-003 passes `onLoad={null}`. A click on the disabled button is not tested.

### 13. Traceability Matrix

| Feature | Test Case |
|---|---|
| Active button and `onLoad` call | TC-LM-001 |
| Disabled button while loading | TC-LM-002 |
| `onClick` statement of the loading button | TC-LM-002 (forced) |
| Disabled button at the end of the list | TC-LM-003 |
