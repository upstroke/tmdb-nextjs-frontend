# Security test plan (Cypress)

## Scope

The app is read-only and TMDB is responsible for its own API security. The tests focus on the search, because it is the only place where users enter free text that reaches the server, and on keeping the API key on the server.

Goal: manipulated input must not execute code in the browser and must not crash the server. A `400` or an empty result is an accepted answer.

## Limits

- TMDB data is fetched server-side in server components and cannot be intercepted by `cy.intercept()`. Detail pages are therefore not tested with malicious data in Cypress.
- Requests with a query of 4 or more characters reach the real TMDB API and need `TMDB_API_KEY` on the server.
- The list routes used by `PagedList` (`/api/[locale]/[apiPath]?page=`) are not tested yet.
- Rate limiting is not implemented and not tested.

## Test cases

| ID     | Spec                | Test                                                                                        |
| ------ | ------------------- | ------------------------------------------------------------------------------------------- |
| SEC-01 | `search-xss.cy.js`  | XSS payloads typed into the search box are URL-encoded and not executed                     |
| SEC-02 | `search-xss.cy.js`  | Malicious result titles and image URLs from the API are rendered as text                    |
| SEC-03 | `search-xss.cy.js`  | An API error (500) and an unexpected response shape do not break the header                 |
| SEC-04 | `search-xss.cy.js`  | Manipulated `sessionStorage` values do not crash the header                                 |
| SEC-05 | `search-api.cy.js`  | Missing, too short, and too long queries return an empty result                             |
| SEC-06 | `search-api.cy.js`  | Very long and special queries never return 5xx                                              |
| SEC-07 | `search-api.cy.js`  | Manipulated locales never return 5xx; locales over 10 characters return 400                 |
| SEC-08 | `search-api.cy.js`  | Other HTTP methods are rejected                                                             |
| SEC-09 | `search-api.cy.js`  | A burst of 50 requests does not cause 5xx                                                   |
| SEC-10 | `search-api.cy.js`  | Invalid ids in detail routes never return 5xx                                               |
| SEC-11 | `search-api.cy.js`  | The key does not appear in the search response or in the homepage HTML                      |
| SEC-12 | `api-key.cy.js`     | No browser request contains the key or goes directly to `themoviedb.org`                    |
| SEC-13 | `api-key.cy.js`     | The homepage HTML and all loaded `_next/static` JavaScript files do not contain the key     |
| SEC-14 | `api-key.cy.js`     | The search response body and headers do not contain the key                                 |

Set the Cypress env `TMDB_API_KEY` to also search for the exact key value, for example `CYPRESS_TMDB_API_KEY=... npm run test:e2e`. Without it, the tests search for the names `api_key` and `TMDB_API_KEY`.

## Known open points

- `LocaleParamSchema` only checks the length (2 to 10), not a list of supported locales.
- `homepage` and watch provider links are not checked for `http(s)`.
- The search route has no rate limit.
