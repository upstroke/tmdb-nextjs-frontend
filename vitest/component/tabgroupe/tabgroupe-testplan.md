# Test Plan: TabGroupe Component Test

**Test Plan ID:** TP-TG-001
**Component:** `components/TabGroupe.jsx`
**Test File:** `vitest/component/TabGroupe.browser.test.jsx`
**Test Level:** Component Test
**Framework:** Vitest Browser Mode + React Testing Library

This test plan documents the four automated test cases implemented in `TabGroupe.browser.test.jsx`.

## Test Items

- `components/TabGroupe.jsx`
- Mocked `useI18n` and `useLocale` locale store
- `sampleTabs` test dataset
- `onTabSelect` callback

## Features to Be Tested

- Tab list rendering and default active-tab behavior
- Tab selection through mouse interaction
- Keyboard navigation in the tab list
- Keyboard navigation in the active episode list
- Loading-state rendering
- Plain-text fallback content rendering

## Features Not to Be Tested

- Real API calls and server-side episode loading
- Visual styling, animations, and responsive layout
- Real translations beyond mocked strings
- Actual screen-reader behavior
- End-to-end routing outside `TabGroupe`

## Test Approach

The component is tested in browser mode with mocked locale data and representative season tabs. Assertions validate ARIA roles, selected-tab state, visible panel content, callback execution, and keyboard event handling.

The tab keyboard scenarios align with the WAI-ARIA Tabs pattern: `ArrowRight`, `ArrowLeft`, `Home`, and `End` support navigation between tabs in a horizontal tab list. [web:669]

## Test Cases

| ID       | Automated Test                                                                                   | Covered Behavior                                                                                                                                  |
|----------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| TC-TG-01 | `renders tab list and default active panel contents including episode structures`                | Initial rendering, tab list accessibility, default selected tab, default episode content, mouse selection of Season 2, and `onTabSelect` callback |
| TC-TG-02 | `supports interactive keyboard navigation patterns across sequential tab items`                  | Tab keyboard handling for `ArrowRight`, `End`, `Home`, and unsupported `Enter`                                                                    |
| TC-TG-03 | `supports focused accessibility keyboard navigation tracking inside active episodes list panels` | Episode-list keyboard handling for `ArrowDown`, `ArrowUp`, `End`, `Home`, and unsupported `Escape`                                                |
| TC-TG-04 | `handles distinct loading templates and plain text fallbacks correctly`                          | Loading branch for Season 3 and plain-text fallback-content branch for Season 4                                                                   |

## Detailed Test Cases

### TC-TG-01: Render tabs, default panel, and mouse selection

**Objective:**
Verify the default tab selection, required ARIA attributes, initial episode content, and mouse-based tab selection.

**Preconditions:**

- `initialTab` is not provided.
- `sampleTabs` contains Season 1 through Season 4.
- `onTabSelect` is a Vitest mock function.

**Steps:**

1. Render `TabGroupe` with `ariaLabel="Season Selection"`.
2. Locate the tab list by role and accessible name.
3. Verify the initial `Season 1` tab state.
4. Verify the visible Season 1 episode content.
5. Click the `Season 2` tab.
6. Verify callback invocation, selected state, and Season 2 episode content.

**Expected Result:**

- A `tablist` named `Season Selection` is rendered.
- `Season 1` has `aria-selected="true"` and `tabIndex="0"`.
- `1. Pilot` and its overview are visible initially.
- Clicking `Season 2` calls `onTabSelect('season-2')`.
- `Season 2` becomes selected.
- `1. Goodbye Earl` is visible.

### TC-TG-02: Navigate tabs with keyboard controls

**Objective:**
Verify keyboard navigation across the tab list and handling of an unsupported key.

**Preconditions:**

- `TabGroupe` is rendered with `initialTab="season-1"`.

**Steps:**

1. Send `ArrowRight` to the `Season 1` tab.
2. Verify that `Season 2` is selected.
3. Send `End` to the current tab reference.
4. Verify that `Season 4` is selected.
5. Send `Home` to the current tab reference.
6. Verify that `Season 1` is selected.
7. Send `Enter` to the current tab reference.
8. Verify that `Season 1` remains selected.

**Expected Result:**

- `ArrowRight` activates Season 2.
- `End` activates Season 4.
- `Home` activates Season 1.
- Unsupported `Enter` does not alter the active selection in this handler path.

### TC-TG-03: Navigate active episode items with keyboard controls

**Objective:**
Verify that supported and unsupported keyboard events in the active episode list are handled without breaking the rendered list.

**Preconditions:**

- `TabGroupe` is rendered with `initialTab="season-1"`.
- Season 1 contains the `Pilot` and `Biscuits` episode items.

**Steps:**

1. Locate the list item containing `1. Pilot`.
2. Send `ArrowDown`.
3. Send `ArrowUp`.
4. Send `End`.
5. Send `Home`.
6. Send unsupported `Escape`.

**Expected Result:**

- The episode keyboard handler processes `ArrowDown`, `ArrowUp`, `End`, and `Home` without a runtime error.
- Unsupported `Escape` does not break the list.
- The first episode list item remains rendered after all interactions.

### TC-TG-04: Render loading and plain-text fallback states

**Objective:**
Verify the loading branch and the plain-text-content fallback branch.

**Preconditions:**

- `TabGroupe` is rendered with `initialTab="season-3"`.
- Season 3 has `loading: true`.
- Season 4 has `content: "No episode details compiled yet."`.

**Steps:**

1. Render `TabGroupe`.
2. Verify the loading message.
3. Click `Season 4`.
4. Verify the plain-text fallback content.

**Expected Result:**

- `Loading episodes...` is shown for Season 3.
- After selecting Season 4, `No episode details compiled yet.` is shown.

## Pass/Fail Criteria

A test case passes when all assertions in its corresponding `it(...)` block succeed. A test case fails if any expected role, attribute, visible content item, callback call, or keyboard-driven state change is missing or incorrect. [web:687]

## Risks and Limitations

- TC-TG-03 verifies that the keyboard handler runs and the episode item remains rendered, but it does not assert the actual focused element via `document.activeElement`.
- The suite uses `fireEvent`; it validates dispatched events but does not fully simulate every user-level keyboard interaction.
- ARIA roles and attributes are checked, but manual testing with assistive technologies remains necessary.
