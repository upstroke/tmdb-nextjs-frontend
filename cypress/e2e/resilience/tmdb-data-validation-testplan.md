# Test Plan — TMDB Data Validation Resilience

Structure follows ISTQB (test plan according to ISO/IEC/IEEE 29119-3).

## 1. Test Plan Identifier

| Field   | Value                                                       |
| ------- | ----------------------------------------------------------- |
| ID      | TP-RES                                                      |
| Version | 0.1 (draft)                                                 |
| Level   | System test (acceptance), automated end-to-end              |
| Type    | Functional test: resilience against unusable TMDB responses |
| Spec    | `cypress/e2e/resilience/tmdb-data-validation.cy.js`         |

## 2. Introduction

This plan describes end-to-end tests for the user-visible behavior when an
application API route returns an unusable response. It complements the Vitest
unit and integration coverage for Zod schemas, TMDB mappers and server-side
data normalization.

## 3. User Story

As a visitor, when a content request cannot provide usable data, I see a clear
localized error message and the application remains usable.

## 4. Test Items

- `components/TypeHeadSearch.jsx`
- `app/api/[locale]/search/route.js`
- `lib/services/tmdb-api.js`
- `lib/schemas/tmdb.js`

## 5. Features to Be Tested

- Search error message when the browser-side search API returns HTTP 502.
- The search input remains usable after the error.

## 6. Features Not to Be Tested

- Server-side TMDB detail requests: Cypress `cy.intercept()` only sees browser
  requests, while movie and TV detail pages request TMDB on the server.
- Zod schema acceptance and rejection: covered by Vitest unit tests.
- Mapper normalization and `null` fallbacks: covered by Vitest unit and
  integration tests.
- Movies and TV shows load-more error flows: the first server-rendered page
  requires live TMDB data and is therefore not stubbed in this plan.

## 7. Approach

- Mock the application's own browser-side API route with `cy.intercept()`.
- Use locale `de-DE` and the localized search error message.
- Assert the visible error message; do not assert internal service behavior.

## 8. Test Environment and Data

- App on `http://localhost:3000`, started with `TMDB_API_KEY`.
- The search request is intercepted before it reaches the application API route.
- No real TMDB response is required for the intercepted search request.

## 9. Test Cases

| ID     | Scenario                                            | Expected result                                |
| ------ | --------------------------------------------------- | ---------------------------------------------- |
| RES-01 | Search API returns HTTP 502 with an error response. | The localized search error message is visible. |

## 10. Traceability

| Feature                                    | Test Case |
| ------------------------------------------ | --------- |
| Search error message for unusable response | RES-01    |

## 11. Risks

- The selector `#typeahead-search-input` and the localized error text must match
  the current application implementation.
- Server-side TMDB requests cannot be stubbed with `cy.intercept()`; their
  fallback behavior is covered by Vitest integration tests.

## 12. Run

```bash
npm run build && npm start      # app on http://localhost:3000
npx cypress run --e2e --browser chrome --spec "cypress/e2e/resilience/**/*.cy.js"
```
