# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** LanguageSwitcher
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `LanguageSwitcher.browser.test.jsx`

### 2. Introduction

This plan describes the component tests for `LanguageSwitcher`, a select element for changing the language. When the user selects a language, the component updates the locale store and replaces the locale segment in the current URL. The tests verify the rendering of the options and the three variants of the path replacement.

### 3. Test Items

- `components/LanguageSwitcher.jsx`
- Mocked dependencies:
  - `next/navigation` (`useRouter` with `push`, `replace`, `prefetch`; `usePathname`)
  - `@/lib/stores/locale` (`useI18n` with `labels.languageSelect` = `Select Language`, `useLocale` = `en-US`, `setLocale`)
  - `@/lib/i18n/helpers` (`getSupportedLocales`: `en-US`, `de-DE`, `fr-FR`)
  - `@/lib/i18n/resolver` (`resolveLocale`: pass-through)
  - `@/lib/i18n/config` (`SUPPORTED_LOCALES`: `en-US`, `de-DE`, `fr-FR`)

### 4. Features to be Tested

- Select element with the accessible name `Select Language` and the current locale as value
- Option labels derived from the locale (`en-US` to `EN`, `de-DE` to `DE`)
- Call of `setLocale` with the selected locale
- Replacing the locale segment of the path (`/en-US/movies` to `/de-DE/movies`)
- Prepending the locale when the path has no locale segment (`/unmapped-deep-route/details` to `/fr-FR/unmapped-deep-route/details`)
- Path that consists only of the locale (`/en-US` to `/de-DE`)
- Call of `router.replace` with `{ scroll: false }`

### 5. Features not to be Tested

- Keyboard operation of the select element and accessibility (separate a11y tests)
- Real routing and real locale resolution (the helpers are mocked)
- Persistence of the selected language
- Query strings and hash fragments in the path
- Visual layout and styling

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design techniques:** Equivalence Partitioning (path with locale and sub path / path without locale / path with locale only), Decision Testing on the `currentSegment` condition
- **Structural coverage:** Statement Coverage and Branch Coverage (documented in the test comments)
- **Isolation:** Router, locale store and the i18n helpers are mocked; mock calls are cleared and the pathname is reset to `/en-US/movies` before each test

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of a test case succeed and no unexpected error occurs.
- **Fail:** At least one assertion fails or the test throws an error.

### 8. Coverage Matrix

| Test Case | Input class | Statement Coverage | Branch Coverage |
|---|---|---|---|
| TC-LS-001 | Path `/en-US/movies`, switch to `de-DE` | Mount initialization, option mapping, store sync | `currentSegment` = true (segment is replaced) |
| TC-LS-002 | Path `/unmapped-deep-route/details`, switch to `fr-FR` | Prepending the locale | `currentSegment` = false (locale is prepended) |
| TC-LS-003 | Path `/en-US`, switch to `de-DE` | Exact match of the base locale | Exact text match condition |

### 9. Derived Test Cases

#### TC-LS-001: Options are rendered and the locale segment is replaced

- **Precondition:** Pathname is `/en-US/movies`; current locale is `en-US`.
- **Steps:**
  1. Render `LanguageSwitcher`.
  2. Select `de-DE` in the select element.
- **Expected result:**
  - The select element `Select Language` exists and has the value `en-US`.
  - The options `EN` and `DE` are displayed.
  - `setLocale` is called with `de-DE`.
  - `router.replace` is called with `/de-DE/movies` and `{ scroll: false }`.

#### TC-LS-002: Locale is prepended to a path without locale

- **Precondition:** Pathname is `/unmapped-deep-route/details`.
- **Steps:**
  1. Render `LanguageSwitcher`.
  2. Select `fr-FR` in the select element.
- **Expected result:**
  - `setLocale` is called with `fr-FR`.
  - `router.replace` is called with `/fr-FR/unmapped-deep-route/details` and `{ scroll: false }`.

#### TC-LS-003: Path consists only of the locale

- **Precondition:** Pathname is `/en-US`.
- **Steps:**
  1. Render `LanguageSwitcher`.
  2. Select `de-DE` in the select element.
- **Expected result:** `router.replace` is called with `/de-DE` and `{ scroll: false }`.

### 10. Gherkin User Stories

```gherkin
Feature: LanguageSwitcher component

  Background:
    Given the supported locales are "en-US", "de-DE" and "fr-FR"
    And the current locale is "en-US"

  Scenario: Locale segment is replaced
    Given the current path is "/en-US/movies"
    When the language switcher is rendered
    Then the select element "Select Language" has the value "en-US"
    And the options "EN" and "DE" are displayed
    When the user selects "de-DE"
    Then the locale "de-DE" is stored
    And the router replaces the path with "/de-DE/movies"

  Scenario: Locale is prepended to a path without locale
    Given the current path is "/unmapped-deep-route/details"
    When the user selects "fr-FR"
    Then the router replaces the path with "/fr-FR/unmapped-deep-route/details"

  Scenario: Path consists only of the locale
    Given the current path is "/en-US"
    When the user selects "de-DE"
    Then the router replaces the path with "/de-DE"
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/languageswitcher
```

### 12. Notes

- TC-LS-002 and TC-LS-003 do not assert that `setLocale` is called. Only TC-LS-001 and TC-LS-002 check the store call.
- TC-LS-002 and TC-LS-003 do not check the options of the select element again.
- `resolveLocale` is mocked as a pass-through. Unsupported or invalid locales are therefore not tested.
- Only `router.replace` is asserted; `push` is mocked but not checked.

### 13. Traceability Matrix

| Feature | Test Case |
|---|---|
| Select element and option labels | TC-LS-001 |
| Store update with `setLocale` | TC-LS-001, TC-LS-002 |
| Replacing the locale segment | TC-LS-001 |
| Prepending the locale | TC-LS-002 |
| Path with locale only | TC-LS-003 |
| `router.replace` with `{ scroll: false }` | TC-LS-001, TC-LS-002, TC-LS-003 |
