# Security test plan (Cypress)

## Scope

The app is read-only and TMDB is responsible for its own API security. Tests cover search input and results, paginated list routes, locale redirects, detail routes, response headers, and keeping the API key on the server.

Manipulated input must not execute code in the browser or crash the server. A controlled error response, empty result, or page-1 fallback is acceptable; an input-caused `5xx` is not.

## Limits

- TMDB data is fetched server-side in server components and cannot be intercepted by `cy.intercept()`. Malicious external detail data is not injected by these Cypress tests.
- Search queries of four or more characters and list requests reach live TMDB and require `TMDB_API_KEY` on the server.
- Detail route inputs accepted by the current schema can also reach live TMDB. Their existence is not assumed.
- Rate limiting is not implemented or tested.
- HSTS is not tested over `http://localhost:3000`.
- Use `cy.env()`, not `Cypress.env()`; `allowCypressEnv` is `false`.
- Run security checks against a freshly built and restarted production server. Development responses may contain framework debugging data; do not weaken response-body checks to hide such matches.

## Test cases

| ID     | Spec               | Test                                                                                                                                                   |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SEC-01 | `search-xss.cy.js` | Search XSS payloads are URL-encoded and not executed.                                                                                                  |
| SEC-02 | `search-xss.cy.js` | Malicious result titles and image URLs are rendered as text.                                                                                           |
| SEC-03 | `search-xss.cy.js` | API 500 and unexpected response shapes do not break the header.                                                                                        |
| SEC-04 | `search-xss.cy.js` | Manipulated sessionStorage does not crash the header.                                                                                                  |
| SEC-05 | `search-api.cy.js` | Missing, short, and long queries return empty results.                                                                                                 |
| SEC-06 | `search-api.cy.js` | Long and special queries never return 5xx.                                                                                                             |
| SEC-07 | `search-api.cy.js` | Manipulated locales never return 5xx; locales longer than 10 characters return 400.                                                                    |
| SEC-08 | `search-api.cy.js` | Other HTTP methods are rejected.                                                                                                                       |
| SEC-09 | `search-api.cy.js` | A burst of 50 requests does not cause 5xx.                                                                                                             |
| SEC-10 | `search-api.cy.js` | Invalid detail-route ids never return 5xx.                                                                                                             |
| SEC-11 | `search-api.cy.js` | The key does not appear in search responses or homepage HTML.                                                                                          |
| SEC-12 | `api-key.cy.js`    | No browser request contains the key or goes directly to themoviedb.org.                                                                                |
| SEC-13 | `api-key.cy.js`    | Homepage HTML and loaded `_next/static` JavaScript contain no key value or `api_key=`.                                                                 |
| SEC-14 | `api-key.cy.js`    | Search response bodies and headers do not contain the key.                                                                                             |
| SEC-15 | `list-api.cy.js`   | Movies, trending, and TV lists return cards for valid requests.                                                                                        |
| SEC-16 | `list-api.cy.js`   | Invalid page values and unknown types fall back to page 1.                                                                                             |
| SEC-17 | `list-api.cy.js`   | Pages above the TMDB limit of 500 never return 5xx.                                                                                                    |
| SEC-18 | `list-api.cy.js`   | Extra parameters are ignored; manipulated locales never return 5xx; long locales return 400; other methods are rejected.                               |
| SEC-19 | `headers.cy.js`    | Homepage, 404 page, search API, and list API send nosniff, DENY, and a restrictive CSP.                                                                |
| SEC-20 | `routing.cy.js`    | Manipulated paths never redirect to another origin or return 5xx.                                                                                      |
| SEC-21 | `routing.cy.js`    | Manipulated Accept-Language values redirect to a locale on the same origin and never return 5xx.                                                       |
| SEC-22 | `routing.cy.js`    | All eight detail-route inputs return less than 500 and pass the unchanged full-response stack-trace scan; failures report only the matching substring. |
| SEC-23 | `headers.cy.js`    | The same four paths send Referrer-Policy and Permissions-Policy.                                                                                       |
| SEC-24 | `routing.cy.js`    | Locally rejected ids open a visible native invalid-URL dialog; OK closes it.                                                                           |

## Detail-route cases (SEC-22 and SEC-24)

Both cases cover `movies` and `tv-shows`.

- Rejected inputs: `abc`, `-1`, `0`, `1.5`, `%00`, and `<script>`.
- Accepted numeric inputs under the current schema: `1e3` (coerced to 1000) and `99999999999`. No assumption is made that either resource exists. No invalid-URL message is required for these inputs.
- SEC-22 uses `cy.request()` for all eight inputs. It keeps the existing stack-trace regex and scans the entire response body, including scripts. Only the assertion diagnostic changes: the actual regex match is reported instead of the complete HTML. A match remains a failure requiring investigation.
- SEC-24 uses `cy.visit()` for the six rejected inputs. It checks `dialog.dialog-message` visibility, `open === true`, and the exact English message `Invalid URL parameters.`. Clicking OK must make the dialog invisible and set `open === false`.
- The `%00` fixture is passed through `encodeURIComponent`, as before. This tests the literal `%00` route input; it is not a claim to test every null-byte encoding variant.
- Browser dialog tests do not replace HTTP safety checks. No production validation or error handling is changed by these tests.

## API-key checks

Set `CYPRESS_TMDB_API_KEY=... npm run test:e2e:security` to also search for the exact key value. Without it, checks search for `api_key` in requests and responses and `api_key=` in HTML and bundles.

The identifier `TMDB_API_KEY` intentionally occurs in translated missing-key messages. The identifier alone is not a secret leak.

## Findings fixed by these tests

- Pages above 500 previously caused 500 responses. ListQuerySchema limits pages to 1 through 500 and routes fall back to page 1.
- The next.config.js env option previously inlined TMDB_API_KEY. It was removed; server code reads process.env.TMDB_API_KEY at runtime. Re-run key checks after changes to next.config.js.
- Referrer-Policy and Permissions-Policy were missing. Responses now send strict-origin-when-cross-origin and disable camera, microphone, and geolocation (SEC-23).

## Known open points

- X-XSS-Protection is obsolete; the CSP allows unsafe-inline scripts.
- LocaleParamSchema checks length, not the supported-locale list; this is accepted.
- Homepage and provider links are not checked for HTTP(S); this is accepted.
- Search has no rate limit.
