# Component Tests

## Test Plan

### 1. Test Plan Identifier

- **Project:** TMDB Next.js Frontend
- **Module:** FooterMain
- **Version:** 1.0
- **Date:** 2026-10-08
- **Test level:** Component test
- **Test file:** `FooterMain.browser.test.jsx`

### 2. Introduction

This plan describes the component test for `FooterMain`, the site-wide footer. The component contains static legal texts and two external attribution links (IMDb and JustWatch). The test verifies the texts, the link targets and the security attributes of the external links.

### 3. Test Items

- `components/FooterMain.jsx`
- No mocked dependencies and no fixtures. The component is rendered without props.

### 4. Features to be Tested

- Display of the legal texts `Conditions of Use`, `Privacy Policy` and `© by JustWatch`
- IMDb attribution link: name, `href`, `target`, `rel`
- JustWatch streaming provider link: name, `href`, `target`, `rel`

### 5. Features not to be Tested

- Keyboard navigation and accessibility (separate a11y tests)
- Visual layout and styling
- Target pages of the legal texts (no link is asserted for them)
- Behaviour of the external websites
- Translation of the footer texts

### 6. Approach

- **Tool:** Vitest Browser Mode with React Testing Library
- **Browser:** Chromium
- **Test design technique:** Static content check; the component has no input and no logical branches
- **Structural coverage:** Statement Coverage; Branch Coverage is trivially complete because only one render path exists
- **Isolation:** Not required; the component has no dependencies

### 7. Item Pass/Fail Criteria

- **Pass:** All assertions of the test case succeed.
- **Fail:** At least one text, link or attribute is missing or differs from the expected value.

### 8. Coverage Matrix

| Test Case | Input class              | Statement Coverage                                      | Branch Coverage             |
| --------- | ------------------------ | ------------------------------------------------------- | --------------------------- |
| TC-FM-001 | No props (static render) | Layout rendering, text nodes, external attribution URLs | Single baseline render path |

### 9. Derived Test Cases

#### TC-FM-001: Footer shows legal texts and secure external links

- **Steps:** Render `FooterMain` without props.
- **Expected result:**
  - The texts `Conditions of Use`, `Privacy Policy` and `© by JustWatch` are displayed.
  - The link with the name `Content: © by IMDb.com, Inc.` has `href="https://www.imdb.com/"`, `target="_blank"` and `rel="noopener noreferrer"`.
  - The link with the name `Streaming-Provider` has `href="https://www.justwatch.com/"`, `target="_blank"` and `rel="noopener noreferrer"`.

### 10. Gherkin User Stories

```gherkin
Feature: FooterMain component

  Scenario: Footer shows legal texts and attribution links
    Given the footer is rendered
    Then the texts "Conditions of Use", "Privacy Policy" and "© by JustWatch" are displayed
    And the IMDb link points to "https://www.imdb.com/"
    And the JustWatch link points to "https://www.justwatch.com/"
    And both external links open in a new tab with rel "noopener noreferrer"
```

### 11. Run Tests

```bash
npx vitest run --config vitest.config.js vitest/component/footermain
```

### 12. Notes

- All texts and link names are hard-coded in English. There is no i18n mock.
- `Conditions of Use` and `Privacy Policy` are checked only as text, not as links.
- One test case covers the whole component. If the footer grows, the test case should be split by feature.

### 13. Traceability Matrix

| Feature                                | Test Case |
| -------------------------------------- | --------- |
| Legal texts                            | TC-FM-001 |
| IMDb link and security attributes      | TC-FM-001 |
| JustWatch link and security attributes | TC-FM-001 |
