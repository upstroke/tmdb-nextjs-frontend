# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** DialogMessage
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `DialogMessage.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `DialogMessage`, a modal message dialog based on the native `<dialog>` element. The tests verify that the dialog opens as a modal, shows title and message, calls the `onClose` callback after confirmation, falls back to the global error title, and stays closed when no message is given.

### 3. Test Items

- `components/DialogMessage.jsx`
- Mocked dependency: `@/lib/stores/locale` (`useI18n` with `messages.dialogErrorTitle` = `System Error` and `messages.dialogOk` = `OK`)

### 4. Features to be Tested

- Opening the native dialog as a modal (`showModal`)
- Rendering of a custom title and the message text
- Confirmation with the `OK` button and call of `onClose`
- Fallback title from the i18n messages when `title` is not set
- Guard clause: the dialog stays closed when `message` is empty

### 5. Features not to be Tested

- Keyboard handling, focus management and accessibility (separate a11y tests)
- Closing with the Escape key
- Visual layout, styling and close animation
- Behaviour of the dialog when `message` changes after the first render

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium (native `<dialog>` and `showModal` are required)
- **Test design techniques:** Equivalence Partitioning (custom title / no title / empty message), State Transition Testing (closed to open to closed), Error Guessing (`onClose` is `null`, `title` is `undefined`)
- **Structural coverage:** Statement Coverage and Branch Coverage (documented in the test comments)
- **Isolation:** Locale store is mocked

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed and no unexpected error occurs.
- **Fail:** At least one assertion fails, the test times out or the test throws an error.

### 8. Coverage Matrix

| Test Case | Input class                             | Statement Coverage                                                                 | Branch Coverage                                                                                      |
| --------- | --------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| TC-DM-001 | Message and custom title, `onClose` set | DOM mount, `showModal` side effect, custom title, close routine and `onClose` call | `!dialog \|\| !message` = false, `!dialog.open` = true, `title ?? messages.dialogErrorTitle` = false |
| TC-DM-002 | Message, no title, `onClose` null       | Global fallback resolution                                                         | `title ?? messages.dialogErrorTitle` = true                                                          |
| TC-DM-003 | Empty message                           | Early exit (guard clause return)                                                   | `!dialog \|\| !message` = true                                                                       |

### 9. Derived Test Cases

#### TC-DM-001: Dialog opens, shows content and calls onClose

- **Precondition:** Locale mock provides `OK` and `System Error`.
- **Steps:**
  1. Render `DialogMessage` with message `A critical connection error has been detected.`, title `Custom Connection Fault` and an `onClose` spy.
  2. Click the `OK` button.
- **Expected result:**
  - A `<dialog>` element exists and `dialog.open` is `true`.
  - The title and the message are displayed as text.
  - After the click, `onClose` is called exactly once (checked with `waitFor`).

#### TC-DM-002: Fallback title from i18n

- **Steps:** Render `DialogMessage` with message `Session expired.`, `title={undefined}` and `onClose={null}`.
- **Expected result:**
  - `dialog.open` is `true`.
  - The text `System Error` is displayed.

#### TC-DM-003: Empty message keeps the dialog closed

- **Steps:** Render `DialogMessage` with an empty message, title `Hidden Dialog` and `onClose={null}`.
- **Expected result:**
  - A `<dialog>` element exists in the document.
  - `dialog.open` is `false`.

### 10. Gherkin User Stories

```gherkin
Feature: DialogMessage component

  Scenario: Dialog opens and confirms
    Given a message and a custom title
    When the dialog is rendered
    Then the dialog is open as a modal
    And the title and the message are displayed
    When the user clicks "OK"
    Then the onClose callback is called once

  Scenario: Default title without explicit title
    Given a message without a title
    When the dialog is rendered
    Then the dialog is open
    And the title "System Error" is displayed

  Scenario: Empty message
    Given an empty message
    When the dialog is rendered
    Then the dialog element exists
    And the dialog stays closed
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/dialogmessage
```

### 12. Notes

- The title is rendered as a `<strong>` element and not as an ARIA heading. The tests therefore search for plain text.
- TC-DM-002 and TC-DM-003 pass `onClose={null}`. Closing the dialog without a callback is not tested.
- TC-DM-002 does not assert the message text. TC-DM-003 does not assert that title and message are hidden.

### 13. Traceability Matrix

| Feature                        | Test Case            |
| ------------------------------ | -------------------- |
| Open as modal                  | TC-DM-001, TC-DM-002 |
| Custom title and message       | TC-DM-001            |
| Confirm with OK and `onClose`  | TC-DM-001            |
| Fallback title from i18n       | TC-DM-002            |
| Guard clause for empty message | TC-DM-003            |
