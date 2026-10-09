# Security test plan (Cypress)

## Scope

The app is read-only and TMDB is responsible for its own API security. The tests focus on the search, because it is the only place where users enter free text that reaches the server, on the paginated list routes, on the response headers, and on keeping the API key on the server.

Goal: manipulated input must not execute code in the browser and must not crash the server. A `400`, an empty result, or a fallback to page 1 is an accepted answer. A `5xx` caused by input is not.

## Limits

- TMDB data is fetched server-side in server components and cannot be intercepted by `cy.intercept()`. Detail pages are therefore not tested with malicious data in Cypress.
- Requests with a query of 4 or more characters, and all list requests, reach the real TMDB API and need `TMDB_API_KEY` on the server.
- Rate limiting is not implemented and not tested.
- HSTS is not tested. Browsers ignore `Strict-Transport-Security` over HTTP, and the tests run on `http://localhost:3000`.
- The tests read the optional key value with `cy.env()`, because `allowCypressEnv` is `false`. Do not use `Cypress.env()`.

## Test cases

| ID     | Spec               | Test                                                                                              |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------- |
| SEC-01 | `search-xss.cy.js` | XSS payloads typed into the search box are URL-encoded and not executed                           |
| SEC-02 | `search-xss.cy.js` | Malicious result titles and image URLs from the API are rendered as text                          |
| SEC-03 | `search-xss.cy.js` | An API error (500) and an unexpected response shape do not break the header                       |
| SEC-04 | `search-xss.cy.js` | Manipulated `sessionStorage` values do not crash the header                                       |
| SEC-05 | `search-api.cy.js` | Missing, too short, and too long queries return an empty result                                   |
| SEC-06 | `search-api.cy.js` | Very long and special queries never return 5xx                                                    |
| SEC-07 | `search-api.cy.js` | Manipulated locales never return 5xx; locales over 10 characters return 400                       |
| SEC-08 | `search-api.cy.js` | Other HTTP methods are rejected                                                                   |
| SEC-09 | `search-api.cy.js` | A burst of 50 requests does not cause 5xx                                                         |
| SEC-10 | `search-api.cy.js` | Invalid ids in detail routes never return 5xx                                                     |
| SEC-11 | `search-api.cy.js` | The key does not appear in the search response or in the homepage HTML                            |
| SEC-12 | `api-key.cy.js`    | No browser request contains the key or goes directly to `themoviedb.org`                          |
| SEC-13 | `api-key.cy.js`    | The homepage HTML and all loaded `_next/static` JavaScript files contain no `api_key=` and no key value |
| SEC-14 | `api-key.cy.js`    | The search response body and headers do not contain the key                                       |
| SEC-15 | `list-api.cy.js`   | `movies`, `trending`, and `tv-shows` return cards for a valid request                             |
| SEC-16 | `list-api.cy.js`   | Invalid `page` (`abc`, `0`, `-1`, `1.5`, empty, `<script>`) and unknown `type` fall back to page 1 |
| SEC-17 | `list-api.cy.js`   | `page` above the TMDB limit of 500 (`501`, `10000`, `999999999`) never returns 5xx                |
| SEC-18 | `list-api.cy.js`   | Extra query parameters are ignored; manipulated locales never return 5xx; locales over 10 characters return 400; other HTTP methods are rejected |
| SEC-19 | `headers.cy.js`    | Homepage, 404 page, search API, and list API send `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and a CSP with `default-src 'self'`, `frame-ancestors 'none'`, and no wildcard source |

Set the Cypress env `TMDB_API_KEY` to also search for the exact key value, for example `CYPRESS_TMDB_API_KEY=... npm run test:e2e:security`. Without it, the tests search for `api_key` in requests and responses, and for `api_key=` in HTML and bundles.

The name `TMDB_API_KEY` appears in the client bundle on purpose: it is part of the `apiKeyMissing` messages in `lib/i18n/ui.json`. It is not a leak.

## Findings fixed by these tests

- `page` above 500 returned 500, because TMDB rejects those pages. `ListQuerySchema` now limits `page` to 1 to 500, and the routes fall back to page 1.
- `next.config.js` inlined `TMDB_API_KEY` into the build with the `env` option. The entry is removed. Server code reads `process.env.TMDB_API_KEY` at runtime. Run the security specs with `CYPRESS_TMDB_API_KEY` set after every change to `next.config.js` to confirm that the value is not in the bundles.

## Known open points

- `Referrer-Policy` and `Permissions-Policy` are not set. `X-XSS-Protection` is obsolete, and the CSP allows `'unsafe-inline'` for scripts.
- `LocaleParamSchema` only checks the length (2 to 10), not a list of supported locales.
- `SeasonQuerySchema` has no upper limit for `season`.
- `homepage` and watch provider links are not checked for `http(s)`.
- The search route has no rate limit.
