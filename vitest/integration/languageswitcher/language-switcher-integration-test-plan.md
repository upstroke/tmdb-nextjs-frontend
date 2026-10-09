# Test Plan: LanguageSwitcher Integration Test

**Test Plan ID:** TP-LS-001
**Components:** `components/LanguageSwitcher.jsx`, `components/providers/LocaleProvider.jsx`, `lib/stores/locale.jsx`
**Test File:** `vitest/integration/languageswitcher/language-switcher.test.jsx`
**Test Level:** Integration Test
**Framework:** Vitest (jsdom) + React Testing Library

This test plan documents the automated integration tests in `language-switcher.test.jsx`. They cover the chain select change → `resolveLocale` → `setLocale` (store and `sessionStorage`) → `ExternalSetterRegistrar` → React state → `useLocale` / `useI18n`, plus the path rewrite and the `router.replace` call. Real modules are wired together; only `next/navigation` is mocked. Real page changes with reloaded data are covered by Cypress (`cypress/e2e`).

## Test Items

- `components/LanguageSwitcher.jsx`
- `components/providers/LocaleProvider.jsx` (`AppLocaleProvider`, `ExternalSetterRegistrar`, `LocaleSyncer`)
- `lib/stores/locale.jsx` (`LocaleProvider`, `useLocale`, `useI18n`, `setLocale`, `_registerExternalSetter`)
- `lib/i18n/resolver.js` (`resolveLocale`), `lib/i18n/helpers.js` (`getSupportedLocales`, `getLocaleText`), `lib/i18n/ui.json`
- `lib/i18n/config` (`DEFAULT_LOCALE`, `SUPPORTED_LOCALES`)
- `window.sessionStorage` (key `app-locale`), `document.documentElement.lang`
- Mock: `next/navigation` (`useRouter().replace`, `usePathname`)

## Features to Be Tested

- One option per supported locale, label is the upper-case language code
- Initial value from the default locale or from `sessionStorage`
- Replacing the locale segment in the pathname and calling `router.replace` with `{ scroll: false }`
- Prepending the locale to a pathname without locale segment, and a pathname that is the locale only
- Persisting the selected locale in `sessionStorage`
- Updating `useLocale()`, UI texts and `aria-label` after the switch
- Fallback to the default locale for an unsupported value
- Syncing store and `html lang` from the URL locale via `LocaleSyncer`

## Features Not to Be Tested

- Real Next.js routing and loading of translated page data (Cypress)
- Visual styling of the dropdown
- Browser or screen-reader behavior of the native `<select>`
- Translation quality of `ui.json`

## Test Approach

Each test renders `LanguageSwitcher` and a `Probe` component inside the real `AppLocaleProvider`. The probe shows `useLocale()` and the translated label `languageSelect`. The pathname is set per test via the mocked `usePathname`; the new URL is verified at the mocked `router.replace`. Locales come from `lib/i18n/config`, expected texts from `getLocaleText`, so no locale or label text is hard-coded. `sessionStorage` is cleared before and after every test, components are unmounted with `cleanup()`.

## Test Cases

| ID | Automated Test | Covered Behavior |
| --- | --- | --- |
| TC-LS-01 | `lists one option per supported locale with the short code as label` | Options equal `SUPPORTED_LOCALES` and `getSupportedLocales()`, labels like `DE`, start value and `aria-label` |
| TC-LS-02 | `replaces the locale segment in the path when switching to %s` | `/en-US/movies/1` becomes `/{locale}/movies/1`, called with `{ scroll: false }` |
| TC-LS-03 | `prepends the locale when the path has no locale segment` | `/movies/1` becomes `/{locale}/movies/1` |
| TC-LS-04 | `replaces the locale on a path that consists of the locale only` | `/en-US` becomes `/{locale}` |
| TC-LS-05 | `saves the selected locale in sessionStorage` | `app-locale` contains the new locale |
| TC-LS-06 | `updates the locale state and the UI texts` | `useLocale()`, label text, select value and `aria-label` change |
| TC-LS-07 | `falls back to the default locale for an unsupported value` | `setLocale('xx-XX')` results in the default locale in state and storage |
| TC-LS-08 | `syncs store and html lang when LocaleSyncer receives a new locale` | Store, `sessionStorage` and `document.documentElement.lang` follow the URL locale |
| TC-LS-09 | `starts with the locale stored in sessionStorage` | Stored locale is the start value of select and state |

## Detailed Test Cases

### TC-LS-01: Options and initial state

**Objective:** Verify that the dropdown offers exactly the supported locales.
**Preconditions:** `sessionStorage` is empty; pathname is `/en-US/movies/1`.
**Steps:** Render the switcher in `AppLocaleProvider`; read all `<option>` elements.
**Expected Result:** Option values equal `SUPPORTED_LOCALES` (also equal to `getSupportedLocales()`), each label is the upper-case part before the hyphen, the select value is `DEFAULT_LOCALE`, `aria-label` equals `labels.languageSelect` of the default locale.

### TC-LS-02: Replace locale segment

**Objective:** Verify the new URL for every other supported locale.
**Preconditions:** Pathname is `/{DEFAULT_LOCALE}/movies/1`.
**Steps:** Select the locale.
**Expected Result:** `router.replace` is called once with `/{locale}/movies/1` and `{ scroll: false }`.

### TC-LS-03: Path without locale

**Objective:** Verify the fallback branch of the path rewrite.
**Preconditions:** Pathname is `/movies/1`.
**Steps:** Select another locale.
**Expected Result:** `router.replace` is called with `/{locale}/movies/1` and `{ scroll: false }`.

### TC-LS-04: Locale-only path

**Objective:** Verify the path `/{locale}` without trailing segments.
**Preconditions:** Pathname is `/{DEFAULT_LOCALE}`.
**Steps:** Select another locale.
**Expected Result:** `router.replace` is called with `/{locale}` and `{ scroll: false }`.

### TC-LS-05: Persist selection

**Objective:** Verify that the selection is saved for the session.
**Steps:** Select another locale.
**Expected Result:** `sessionStorage.getItem('app-locale')` returns the selected locale.

### TC-LS-06: Update state and texts

**Objective:** Verify that the switch reaches the React state through the registered external setter.
**Steps:** Select another locale.
**Expected Result:** The probe shows the new locale and the label `languageSelect` of that locale; the select value and `aria-label` are updated.

### TC-LS-07: Unsupported value

**Objective:** Verify the fallback of the resolver within the store.
**Preconditions:** Another locale is selected first.
**Steps:** Call `setLocale('xx-XX')`.
**Expected Result:** State and `sessionStorage` contain `DEFAULT_LOCALE`.
**Note:** The value is set directly, because the `<select>` has no option for `xx-XX`.

### TC-LS-08: URL as source of truth

**Objective:** Verify that `LocaleSyncer` aligns store and document language with the URL locale.
**Steps:** Render `LocaleSyncer` with another locale; re-render it with `DEFAULT_LOCALE`.
**Expected Result:** After each step the probe, `sessionStorage` (first step) and `document.documentElement.lang` show the passed locale.

### TC-LS-09: Stored locale

**Objective:** Verify the start value from the session.
**Preconditions:** `sessionStorage` contains another locale under `app-locale`.
**Steps:** Render the switcher.
**Expected Result:** The select value and the probe show the stored locale.

## Pass/Fail Criteria

A test case passes when every assertion within its `it(...)` block succeeds. It fails if an option, router call, path, stored value, locale state, label text or `html lang` differs from the expectation.

## Risks and Limitations

- `next/navigation` is mocked; real navigation and reloaded page data are only covered by Cypress.
- The tests depend on `AppLocaleProvider` registering the external setter; without it, the standalone `setLocale` would not update the React state (TC-LS-06).
- TC-LS-07 does not use the `<select>`, because jsdom clears the value of a non-existing option.
- The file `ui.json` defines the supported locales via `languageCode`; a locale missing there is missing in the dropdown (TC-LS-01 checks the match with `SUPPORTED_LOCALES`).
- The path rewrite replaces the first occurrence of the current locale segment; unusual paths are not covered.

## Execution

```bash
npx vitest run vitest/integration/languageswitcher/language-switcher.test.jsx
```
