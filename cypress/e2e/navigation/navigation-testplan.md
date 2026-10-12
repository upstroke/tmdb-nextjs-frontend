# Test Plan — Navigation

Structure follows ISTQB (test plan according to ISO/IEC/IEEE 29119-3).

## 1. Test Plan Identifier

| Field   | Value                                          |
| ------- | ---------------------------------------------- |
| ID      | TP-NAV                                         |
| Version | 0.7 (draft)                                    |
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
- `components/LanguageSwitcher.jsx` (locale change)
- `components/TypeHeadSearch.jsx` (search to detail page)
- `components/PagedList.jsx`, `components/LoadMore.jsx` (list, load more, restored state)
- Page objects: `cypress/POM/BasePage.js`, `cypress/POM/HeaderPage.js`, `cypress/POM/ListPage.js`
- Selectors: `#navmenu` (navigation), `.burger-icon` (burger button), `#nav-home`, `#nav-movies`, `#nav-tv` (menu items), `#language-select` (language switcher), `#typeahead-search-input` (search), `a.result#movie-<id>` (search result), `ul.media-card-list > li` (cards), `.paged-list-cards button` (load more)

## 5. Features to Be Tested

- Homepage load and locale in the URL (implemented).
- Visible navigation and language switcher in the header (implemented).
- Real page changes through the desktop menu links Movies, TV shows and Home (implemented).
- Language switch keeps the route and survives a reload (implemented).
- Mobile menu: a selected link changes the page and closes the menu (implemented).
- Search result opens the detail page by click and by keyboard on desktop (implemented).
- Mobile search flow: search from the open menu, open a result, menu closes (implemented).
- List state: loaded cards survive a visit to a detail page and the browser back button (implemented).

## 6. Features Not to Be Tested

- **Link targets and stored page numbers of the menu links:** covered in Vitest (`vitest/component/headermain/`, TC-HM-002, TC-HM-003, TC-HM-006).
- **Menu state on path change:** covered in Vitest (TC-HM-005, TC-HM-007).
- **Typeahead keyboard handling, debounce, fallbacks:** covered in Vitest (`vitest/component/typeheadsearch/`).
- **Search route, detail pages with partial data, locale validation:** covered in Vitest integration tests (`vitest/integration/typeheadsearch-search-to-details/`, `languageswitcher/`, `pagedlist/`).
- **Duplicates, timeout, error dialog of the list:** covered in `vitest/integration/pagedlist/`.
- **Axe, contrast, focus, reflow, skip link, burger keyboard operation:** covered in `cypress/accessibility/`.
- **Manipulated input, XSS, API key, headers:** covered in `cypress/e2e/security/`.

## 7. Approach

- One scenario checks one thing the Vitest tests cannot: a real page change in the browser (URL, loaded page, history).
- Related page changes of the same menu are combined in one flow (NAV-05) instead of one test per link, because every test reloads the app.
- Page objects `BasePage`, `HeaderPage` and `ListPage` hold the selectors.
- Locale `en-US` is passed to `BasePage.visit('en-US')` in the spec. `cypress.env.json` does not exist and is not used (`allowCypressEnv` is `false`).
- Tool: Cypress in Chrome. Flows use `cy.location()` and `cy.url()` for assertions instead of `cy.wait()`. The only waits are on the aliases of stubbed requests (`cy.wait('@search')`, `cy.wait('@page2')`).
- Desktop flows set the viewport to 1280 x 800 so the menu is not in its mobile layout.

## 8. Test Environment and Data

- App on `http://localhost:3000`, started with `TMDB_API_KEY`.
- Fixtures in `cypress/fixtures/` and the commands `cy.interceptTmdb()` and `cy.interceptTmdbError()` in `cypress/support/tmdb.commands.js` exist. They match requests of the browser only.
- Mobile viewport: 375 x 667 (`cy.viewport` in the test).
- NAV-10, NAV-11 and NAV-14 stub `GET /api/en-US/search` with one movie (`id` 603, `mediaType` `movie`).
- NAV-12 stubs `GET /api/en-US/movies?page=2` with two movies (`id` 900001 and 900002). Page 1 comes from the server and needs a real `TMDB_API_KEY`; the load more button only appears when TMDB reports more pages.

## 9. Test Cases

### Implemented

| ID     | Scenario                                                        | State       |
| ------ | --------------------------------------------------------------- | ----------- |
| NAV-01 | Homepage loads without errors                                   | implemented |
| NAV-02 | Active locale is reflected in the URL                           | implemented |
| NAV-03 | Global navigation (`#navmenu`) is visible                       | implemented |
| NAV-04 | Language switcher (`#language-select`) is present in the header | implemented |
| NAV-05 | Menu links open Movies, TV shows and Home (real page changes)   | implemented |
| NAV-08 | Language switch keeps the route; a reload keeps the locale      | implemented |
| NAV-09 | Mobile: burger menu opens, link changes the page, menu closes   | implemented |
| NAV-10 | Search: click on a result opens the detail page (desktop)       | implemented |
| NAV-11 | Search: ArrowDown and Enter open the detail page                | implemented |
| NAV-12 | List: load more, open a card, back keeps cards and page         | implemented |
| NAV-14 | Mobile: search result opens the detail page, menu closes        | implemented |

### Planned

No scenarios are planned at the moment.

NAV-06 (TV shows link), NAV-07 (Home link) and NAV-13 are not used. NAV-06 and NAV-07 are part of NAV-05 and have no separate test.

## 10. Traceability

| Feature                              | Test Case      |
| ------------------------------------ | -------------- |
| Homepage load and locale in the URL  | NAV-01, NAV-02 |
| Header with navigation and switcher  | NAV-03, NAV-04 |
| Menu links change the page           | NAV-05         |
| Language switch keeps the route      | NAV-08         |
| Mobile menu flow                     | NAV-09         |
| Search result opens the detail page  | NAV-10, NAV-11 |
| Mobile search flow                   | NAV-14         |
| Back navigation keeps the list state | NAV-12         |

## 11. Risks

- **R-01 Server-side TMDB requests:** Pages and API routes call TMDB on the server. `cy.intercept` only sees requests of the browser, so `cy.interceptTmdb()` does not stub them. Flows need either a real `TMDB_API_KEY` with stable titles or stubs of the app's own `/api/<locale>/...` routes. The search request and the load more request in the browser can be stubbed (see A11Y-07, NAV-10, NAV-12, NAV-14). The detail pages are not stubbed, so the tests assert the path and not the title.
- **R-02 Dependence on live data:** Real TMDB data changes. Scenarios must not assert on a fixed title unless the data is stubbed. NAV-12 needs a first page with a load more button.
- **R-03 Selectors not confirmed in a run:** The list selectors `ul.media-card-list > li`, `.paged-list-cards button` and the card link `a[href="<path>"]` come from the component source and were not run against the app when NAV-12 was written. The shape of the stubbed cards follows the search results and may need a field adjustment.

## 12. Known Defects

- **DEF-NAV-01 (fixed):** `HeaderMain` kept the mobile menu open after a link was selected, because only the burger button changed `menuOpen`. The link now closes the menu. NAV-09 guards against a regression.
- **DEF-NAV-02 (fixed):** The mobile menu stayed open after a search result opened a page, because the search calls `router.push` and only the menu links reset the menu. `HeaderMain` now closes the menu on every path change (Vitest TC-HM-007). Clicking or tapping into the search keeps the menu open on purpose. NAV-14 guards against a regression.

## 13. Run

```bash
npm run build && npm start      # app on http://localhost:3000
npx cypress run --e2e --browser chrome --spec "cypress/e2e/navigation/**/*.cy.js"
```

All Cypress specs: `npm run test:e2e`.
