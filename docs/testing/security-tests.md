# Security tests

Security tests check that manipulated input does not run code in the browser, does not crash the server, and does not expose the TMDB API key. They also check the security response headers and the locale redirect. They run with Cypress in `cypress/e2e/security/`.

The full list of test cases (SEC-01 to SEC-23) is in [`cypress/e2e/security/security-testplan.md`](../../cypress/e2e/security/security-testplan.md). Keep the plan and the specs in sync.

## Scope

The app is read-only, and TMDB secures its own API. The tests cover the parts where user input reaches the server or the browser:

- search box and search API (`/api/[locale]/search`)
- paginated list routes (`/api/[locale]/movies`, `/trending`, `/tv-shows`)
- locale proxy (`proxy.js`) and detail pages with invalid ids
- security headers from `next.config.js`
- the TMDB API key, which must stay on the server

## Specs

| Spec               | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `search-xss.cy.js` | XSS payloads, malicious API data, error and unexpected response shapes        |
| `search-api.cy.js` | Query limits, special queries, locales, HTTP methods, burst, invalid ids      |
| `api-key.cy.js`    | Key in network traffic, HTML, JavaScript bundles, and API responses           |
| `list-api.cy.js`   | `page`, `type`, locale, extra parameters, and HTTP methods on the list routes |
| `headers.cy.js`    | `nosniff`, `X-Frame-Options`, CSP, Referrer-Policy, and Permissions-Policy    |
| `routing.cy.js`    | Open redirect, `Accept-Language`, and invalid ids on detail pages             |

## Run

The managed runner builds the production application, starts it on `http://localhost:3000`, runs Cypress, and stops the server afterwards. It requires `TMDB_API_KEY` and a free port 3000:

```bash
npm run test:e2e:security
```

The runner executes Cypress with Chrome for `cypress/e2e/security/**/*.cy.js`.

To also search for the exact key value:

```bash
CYPRESS_TMDB_API_KEY=... npm run test:e2e:security
```

To run a single spec with the managed production server:

```bash
npm run test:e2e:security -- --spec cypress/e2e/security/list-api.cy.js
```

After changing server code, run the managed command again. It rebuilds the application before starting the production server.

## Rules

- The expected result for manipulated input is a `400`, an empty result, or a fallback to defaults. Never a `5xx`.
- Do not use `Cypress.env()`. `allowCypressEnv` is `false`, so read env values with `cy.env()`.
- Use the constant `en-US` as locale, the same as `DEFAULT_LOCALE` in `lib/i18n/config.js`.
- The name `TMDB_API_KEY` is allowed in bundles because of the `apiKeyMissing` messages. Search for `api_key=` and the key value instead.
- Server-side TMDB requests cannot be intercepted with `cy.intercept()`. Stub only requests made by the browser.
- Validate every new query parameter with a Zod schema that has an upper limit, and add a test.
- Header tests read lowercase header names from `cy.request()`.
- Redirect tests use the full base URL and `followRedirect: false`. A request to a URL such as `//evil.com` would otherwise leave the app.

## Limits

- Detail pages are not tested with malicious TMDB data.
- Requests to the list routes and queries with 4 or more characters reach the real TMDB API.
- HSTS is not tested, because browsers ignore it over HTTP.
- Rate limiting is not implemented and not tested.

## Known open points

See the section "Known open points" in the test plan.
