# Test Plan: PagedList Missing Scroll Target Component Test

**Test Plan ID:** TP-PL-MST-001
**Component:** `components/PagedList.jsx`
**Test File:** `vitest/component/PagedList.missing-scroll-target.browser.test.jsx`
**Test Level:** Component test
**Framework:** Vitest Browser Mode + React Testing Library

This test plan covers a targeted edge case for `PagedList`: after a successful pagination load, the computed scroll target does not exist in the DOM. The purpose is to verify that the lookup path is executed and the component remains stable.[cite:635][cite:649]

## Test Items

- `PagedList.jsx`
- `restorePagedList()` and `storeCurrentPage()`
- `fetch`
- `document.getElementById`
- `IntersectionObserver`
- Mocked child components: `CardDefault`, `CardFeatured`, `LoadMore`, `DialogMessage`

## Features to Be Tested

- Restoration of an initial list with two cards
- Successful loading of one additional card
- Computation of the expected scroll target ID after pagination
- Branch behavior when `document.getElementById(...)` returns `null`
- Stable completion of the load flow even when the target element is missing

## Features Not to Be Tested

- Actual scrolling behavior
- `scrollIntoView` invocation
- Error dialogs and timeout handling
- Duplicate filtering
- Empty-state handling
- Real child component rendering details

## Test Approach

This is an isolated browser-based component test with mocked dependencies. Vitest Browser Mode provides real browser APIs, and Testing Library `waitFor` is used to retry asynchronous expectations until they pass or time out.[cite:635][cite:657]

## Test Cases

| ID           | Objective                                       | Preconditions                                                                                          | Action                                                     | Expected Result                                                                                                                           |
|--------------|-------------------------------------------------|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| TC-PL-MST-01 | Handle a missing scroll target after pagination | Restore returns two cards; fetch returns a third card; `document.getElementById` always returns `null` | Render component, click **Load More**, wait for DOM update | Two cards appear first; then three cards are shown; `document.getElementById('missing-target-3')` is called; the component does not crash |

## Detailed Test Specification

### TC-PL-MST-01: Clear pending scroll target when no DOM node exists

**Preconditions**
- `restorePagedList` returns `featured: null`, two cards, `page: 1`, and `hasMore: true`.
- `fetch` returns `page: 2`, `hasMore: true`, and one new card.
- `CardDefault` intentionally ignores `scrollId`, so no matching target element is rendered.
- `document.getElementById` is stubbed to return `null`.

**Steps**
1. Render `PagedList` with `storageKey="missing-target-key"` and `cardIdPrefix="missing-target"`.
2. Wait for the initial two cards.
3. Click **Load More**.
4. Wait until three cards are rendered.
5. Verify that `document.getElementById('missing-target-3')` was called.

**Expected Result**
- The third card is rendered successfully.
- The component attempts to resolve the computed scroll target ID.
- The missing target element does not trigger a runtime failure and does not block pagination rendering.

## Pass/Fail Criteria

The test passes when the DOM assertions succeed and the spy confirms that the expected target ID was queried. The test fails when the third card does not render, the expected `getElementById` call is missing, or an unexpected error interrupts the flow.[cite:643][cite:657]

## Risks

- The test validates only the missing-target lookup path, not true integrated scroll behavior.
- Because `CardDefault` ignores `scrollId`, the test proves the negative branch but not the full end-to-end DOM target creation.
- `waitFor` is suitable for async UI checks, but timeouts can hide the root cause when mocks are misconfigured.[cite:657]

## Execution

```bash
npx vitest run vitest/component/PagedList.missing-scroll-target.browser.test.jsx
```

## Test Data

```js
const sampleInitialData = {
  featured: null,
  cards: [
    { id: 10, title: 'Movie Ten', mediaType: 'movie' },
    { id: 20, title: 'Show Twenty', mediaType: 'tv' }
  ]
};
```

This test covers a robustness-focused edge case that is well suited for isolated component testing in a real browser environment.[cite:635]
