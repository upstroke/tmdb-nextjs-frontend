# Test Plan — Navigation

Structure follows ISTQB (test plan according to ISO/IEC/IEEE 29119-3).

## 1. Test Plan Identifier

| Field   | Value                                          |
| ------- | ---------------------------------------------- |
| ID      | TP-NAV                                         |
| Version | 0.2 (draft)                                    |
| Level   | System test (acceptance), automated end-to-end |
| Type    | Functional test: navigation and locale routing |
| Spec    | `cypress/e2e/navigation/navigation.cy.js`      |

## 2. Introduction

The plan describes the end-to-end tests of the global navigation and the locale-prefixed routing.
Accessibility of the menu is covered by `cypress/accessibility/menu/menu-testplan.md`. Page-wide
accessibility checks are covered by `cypress/accessibility/accessibility-testplan.md`.

## 3. User Story

As a visitor I can open the application, see the global header with the navigation and the
language switcher, and move between pages while the locale stays in the URL.

## 4. Test Items

- `components/HeaderMain.jsx` (navigation, burger button)
- `components/LanguageSwitcher` (locale change)
- `components/TypeHeadSearch` (search to detail page)
- Page objects: `cypress/POM/BasePage.js`, `cypress/POM/HeaderPage.js`
- Selectors: `#navmenu` (navigation), `#language-select` (language switcher), `#typeahead-search-input` (search)

## 5. Features to Be Tested

- Homepage load and locale in the URL (implemented).
- Visible navigation and language switcher in the header (implemented).
- Real page changes through the menu links, the language switcher and the search results (planned).

## 6. Features Not to Be Tested

- **Typeahead keyboard handling, debounce, fallbacks:** covered in Vitest (`vitest/component/typeheadsearch/`).
- **Search route, detail pages with partial data, locale validation:** covered in Vitest integration tests (`vitest/integration/typeheadsearch-search-to-details/`, `languageswitcher/`, `pagedlist/`).
- **Loading more cards, duplicates, timeout, error dialog of the list:** covered in `vitest/integration/pagedlist/`.
- **Axe, contrast, focus, reflow, skip link, burger keyboard operation:** covered in `cypress/accessibility/`.
- **Manipulated input, XSS, API key, headers:** covered in `cypress/e2e/security/`.

## 7. Approach

- One scenario checks one thing the Vitest tests cannot: a real page change in the browser (URL, loaded page, history).
- Page objects `BasePage` and `HeaderPage` hold the selectors. New page objects are added for list and detail pages when the first flow needs them.
- Locale `en-US` is passed to `BasePage.visit('en-US')` in the spec. `cypress.env.json` does not exist and is not used (`allowCypressEnv` is `false`).
- Tool: Cypress in Chrome. Flows use `cy.location()` and `cy.url()` for assertions instead of `cy.wait()`.

## 8. Test Environment and Data

- App on `http://localhost:3000`, started with `TMDB_API_KEY`.
- Fixtures in `cypress/fixtures/` and the commands `cy.interceptTmdb()` and `cy.interceptTmdbError()` in `cypress/support/tmdb.commands.js` exist. They match requests of the browser only.

## 9. Test Cases

### Implemented

| ID     | Scenario                                                        | State       |
| ------ | --------------------------------------------------------------- | ----------- |
| NAV-01 | Homepage loads without errors                                   | implemented |
| NAV-02 | Active locale is reflected in the URL                           | implemented |
| NAV-03 | Global navigation (`#navmenu`) is visible                       | implemented |
| NAV-04 | Language switcher (`#language-select`) is present in the header | implemented |

### Planned

| ID     | Scenario                                                                            | Why Cypress                                           | State   |
| ------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------- | ------- |
| NAV-05 | Menu link Movies opens `/en-US/movies`                                              | Vitest only checks the `href`                         | planned |
| NAV-06 | Menu link TV shows opens the TV list                                                | Vitest only checks the `href`                         | planned |
| NAV-07 | Menu link Home returns from a list page to `/en-US`                                 | Vitest mocks the router                               | planned |
| NAV-08 | Language switch on `/en-US/movies` opens `/de-DE/movies`; a reload keeps the locale | Vitest checks the path calculation, not the real page | planned |
| NAV-09 | Mobile: open the burger menu, choose a link, page changes and the menu closes       | Not tested anywhere                                   | planned |
| NAV-10 | Search: click on a movie result opens `/en-US/movies/<id>` and shows the title      | Vitest mocks `router.push`                            | planned |
| NAV-11 | Search: ArrowDown and Enter open the detail page                                    | Vitest mocks `router.push`                            | planned |
| NAV-12 | List, open a card, browser back keeps the loaded cards and the page number          | Vitest mocks fetch and router                         | planned |

## 10. Traceability

| Feature                              | Test Case      |
| ------------------------------------ | -------------- |
| Homepage load and locale in the URL  | NAV-01, NAV-02 |
| Header with navigation and switcher  | NAV-03, NAV-04 |
| Menu links change the page           | NAV-05 to 07   |
| Language switch keeps the route      | NAV-08         |
| Mobile menu flow                     | NAV-09         |
| Search result opens the detail page  | NAV-10, NAV-11 |
| Back navigation keeps the list state | NAV-12         |

## 11. Risks

- **R-01 Server-side TMDB requests:** Pages and API routes call TMDB on the server. `cy.intercept` only sees requests of the browser, so `cy.interceptTmdb()` does not stub them. Flows need either a real `TMDB_API_KEY` with stable titles or stubs of the app's own `/api/<locale>/...` routes. The search request in the browser can be stubbed (see A11Y-07).
- **R-02 Dependence on live data:** Real TMDB data changes. Scenarios must not assert on a fixed title unless the data is stubbed.
- **R-03 TV list route:** The path of the TV list is taken from the menu link. Confirm it before NAV-06 is written.
- **R-04 Burger menu closing:** NAV-09 assumes that the menu closes after a link is chosen. Confirm this in `HeaderMain.jsx` first.

## 12. Run

```bash
npm run build && npm start      # app on http://localhost:3000
npx cypress run --e2e --browser chrome --spec "cypress/e2e/navigation/**/*.cy.js"
```

All Cypress specs: `npm run test:e2e`.
