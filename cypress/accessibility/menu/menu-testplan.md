# Test Plan — Accessibility of the Main Menu

Structure follows ISTQB (test plan according to ISO/IEC/IEEE 29119-3).

## 1. Test Plan Identifier

| Field   | Value                                                 |
| ------- | ----------------------------------------------------- |
| ID      | TP-A11Y-MENU                                          |
| Version | 0.1 (draft)                                           |
| Level   | System test (acceptance), automated end-to-end        |
| Type    | Non-functional test: accessibility                    |
| Spec    | `cypress/accessibility/menu/menu.accessibility.cy.js` |

## 2. Introduction

The plan describes how the accessibility of the main menu (`components/HeaderMain.jsx`) is
tested. The page-wide checks stay in `cypress/accessibility/accessibility-testplan.md`; this plan
adds the menu-specific checks that plan does not cover.

## 3. Test Basis

- WCAG 2.2 AA: 1.3.1 Info and Relationships, 1.4.3 Contrast (Minimum), 2.1.1 Keyboard,
  2.4.1 Bypass Blocks, 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.5.8 Target Size (Minimum),
  4.1.2 Name, Role, Value.
- Source code: `components/HeaderMain.jsx`, `components/LanguageSwitcher`, `components/TypeHeadSearch`.
- i18n messages: `lib/i18n/ui.json` (`labels.mainNavigation`, `labels.navigationToggle`,
  `labels.skipToContent`).
- Existing plan: `cypress/accessibility/accessibility-testplan.md`.

## 4. Test Items

| Item                | Selector / Element                                        |
| ------------------- | --------------------------------------------------------- |
| Header              | `header#menuHeader`                                       |
| Navigation          | `nav#navmenu` with `ul.nav-list`                          |
| Links               | `#nav-home a`, `#nav-movies a`, `#nav-tv a`               |
| Burger button       | `button.burger-icon` (`aria-expanded`, `aria-controls`)   |
| Search and language | `#typeahead-search-input`, `#language-select` (tab order) |

## 5. Features to Be Tested

- Semantic structure and accessible names of the navigation.
- Current page indication with `aria-current="page"`.
- Keyboard operation: tab order, activation, and burger button toggle.
- Focus visibility and contrast of focused links.
- Target size of the links.
- Name, role, and state of the burger button on small viewports.

## 6. Features Not to Be Tested

- **Skip link:** covered by A11Y-10, A11Y-18, and A11Y-22 in `accessibility.cy.js`.
- **Typeahead keyboard handling:** covered in Vitest (`TypeHeadSearch.browser.test.jsx`).
- **Hover contrast of navigation links:** covered by A11Y-16.
- **Escape key and focus return of the burger menu:** the component does not implement them.
  See risk R-03.
- **Screen reader output:** needs a manual pass with NVDA or VoiceOver
  (`docs/testing/accessibility-audit-checklist.md`).

## 7. Approach

### Test Conditions and Techniques

| Technique                         | Use                                                     |
| --------------------------------- | ------------------------------------------------------- |
| Automated rule check (axe-core)   | TC-MENU-02, TC-MENU-06, TC-MENU-11                      |
| Equivalence partitioning          | One link per route; viewport classes desktop and mobile |
| State transition testing          | Burger button: closed, open, closed (TC-MENU-10)        |
| Experience-based (WCAG checklist) | Landmark, names, focus order, target size               |

### Tools

Cypress, `cypress-axe` (through `cy.checkPageA11y()`), `cypress-real-events` for real keyboard
events. Chrome only, because `cypress-real-events` uses the Chrome DevTools Protocol.

### Rules

Tags: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. Intentional exceptions are documented in the
spec directly above the check. Rules are not disabled broadly.

## 8. Test Environment and Data

- App on `http://localhost:3000`, started with `TMDB_API_KEY`.
- Locale `en-US` (same as `DEFAULT_LOCALE`). Messages are read with `cy.i18n()`.
- Viewports: desktop 1280 x 800, mobile 375 x 667.
- The menu needs no stubbed data. Only the header is under test, the page content is not.

## 9. Test Cases

| ID         | Test case                                            | Viewport | WCAG         | Priority |
| ---------- | ---------------------------------------------------- | -------- | ------------ | -------- |
| TC-MENU-01 | Header and `nav` landmark with label                 | Desktop  | 1.3.1        | High     |
| TC-MENU-02 | No axe violations in the menu                        | Desktop  | WCAG 2.2 AA  | High     |
| TC-MENU-03 | All links have an accessible name; icons are hidden  | Desktop  | 4.1.2        | High     |
| TC-MENU-04 | Only the current link has `aria-current="page"`      | Desktop  | 1.3.1        | High     |
| TC-MENU-05 | Tab order and visible focus                          | Desktop  | 2.4.3, 2.4.7 | High     |
| TC-MENU-06 | Contrast of the focused link                         | Desktop  | 1.4.3        | Medium   |
| TC-MENU-07 | Link activation with Enter                           | Desktop  | 2.1.1        | High     |
| TC-MENU-08 | Target size of at least 24 x 24 px                   | Desktop  | 2.5.8        | Medium   |
| TC-MENU-09 | Burger button name, `aria-controls`, `aria-expanded` | Mobile   | 4.1.2        | High     |
| TC-MENU-10 | Burger button toggles with Enter and Space           | Mobile   | 2.1.1        | High     |
| TC-MENU-11 | No axe violations with the open menu                 | Mobile   | WCAG 2.2 AA  | High     |

The spec uses the IDs `A11Y-MENU-01` to `A11Y-MENU-11`; they map one to one to TC-MENU-01 to 11.
TC-MENU-04 and TC-MENU-06 run once per link (Home, Movies, TV shows).

### Expected Results

- **TC-MENU-01:** `header#menuHeader` contains `nav#navmenu` with `aria-label` equal to
  `labels.mainNavigation`.
- **TC-MENU-04:** The link of the open page has `aria-current="page"`; no other element in the nav has it.
- **TC-MENU-05:** Tab order is skip link, Home, Movies, TV shows, search, language select.
- **TC-MENU-10:** `aria-expanded` changes `false`, `true`, `false`; the nav is visible when open.

## 10. Traceability

| Requirement (WCAG 2.2)       | Test cases         |
| ---------------------------- | ------------------ |
| 1.3.1 Info and Relationships | TC-MENU-01, 04     |
| 1.4.3 Contrast (Minimum)     | TC-MENU-02, 06, 11 |
| 2.1.1 Keyboard               | TC-MENU-07, 10     |
| 2.4.3 Focus Order            | TC-MENU-05         |
| 2.4.7 Focus Visible          | TC-MENU-05         |
| 2.5.8 Target Size (Minimum)  | TC-MENU-08         |
| 4.1.2 Name, Role, Value      | TC-MENU-03, 09     |

## 11. Entry Criteria

- App builds and starts on `http://localhost:3000`.
- `TMDB_API_KEY` is set.
- `HeaderMain` is implemented and the selectors in section 4 exist.

## 12. Exit Criteria

- All test cases ran.
- All High priority test cases pass.
- No open axe violation without a documented exception.
- Every failed test case has a defect report or a documented, accepted exception.

## 13. Suspension and Resumption

- Suspend when the app does not start or the header does not render.
- Resume after the cause is fixed and a smoke run of TC-MENU-01 passes.

## 14. Risks

| ID   | Risk                                                          | Likelihood | Impact | Mitigation                                   |
| ---- | ------------------------------------------------------------- | ---------- | ------ | -------------------------------------------- |
| R-01 | Selectors change with refactoring of `HeaderMain`             | Medium     | Medium | Selectors are in the POM `HeaderPage.js`     |
| R-02 | Breakpoint of the burger menu differs from the viewports used | Low        | Medium | Check the breakpoint in `styles/app.scss`    |
| R-03 | No Escape and no focus return in the burger menu              | High       | Medium | Out of scope; add tests after implementation |
| R-04 | `cypress-real-events` works in Chromium only                  | Low        | Low    | Run in Chrome                                |

## 15. Known Defects

| ID     | Description                                                                                                                                                                                | Affected   | Status |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------ |
| DEF-01 | `HeaderMain` toggled the burger button with `onPointerDown`. Enter and Space fire `click` only, so the menu could not be opened with the keyboard (WCAG 2.1.1). Fixed with `onClick`.      | TC-MENU-10 | Fixed  |

DEF-01 was fixed in commit `b5b97d7`. TC-MENU-10 guards against a regression.

## 16. Run

```bash
npm run test:e2e:a11y
```

To run only this spec:

```bash
npx cypress run --browser chrome --spec cypress/accessibility/menu/menu.accessibility.cy.js
```

## 17. Schedule and Responsibilities

The developer who changes `HeaderMain` or the navigation runs the spec locally before the commit.
The spec runs in CI together with the other accessibility tests.
