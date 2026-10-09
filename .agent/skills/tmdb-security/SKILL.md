# TMDB Security Skill

## Purpose

This skill enables the AI agent to review, test, and harden the TMDB Next.js frontend against manipulated input and key exposure.

## Scope

- Search box and search API route
- Paginated list routes: `movies`, `trending`, `tv-shows`
- Zod validation at the API boundary (`lib/schemas/tmdb.js`)
- Keeping `TMDB_API_KEY` on the server
- Cypress security specs in `cypress/e2e/security/`

## Rules

1. Treat every query parameter, route parameter, and `sessionStorage` value as untrusted.
2. Validate input with a Zod schema from `lib/schemas/`. Give numbers an upper limit. TMDB allows `page` from 1 to 500.
3. Manipulated input must give a `400`, an empty result, or a fallback to defaults. It must never give a `5xx`.
4. Add the TMDB key only in `lib/services/tmdb-api.js`, on the server. Never pass it to client components, responses, headers, or logs.
5. Do not render API data as HTML. Render titles and other text as text.
6. Keep the plan in `cypress/e2e/security/security-testplan.md` in sync with the specs.

## Workflow

1. Read `docs/testing/security-tests.md` and the test plan.
2. Check the existing schema and route before adding new validation.
3. Add or change the Zod schema, then the route.
4. Add a Cypress test in `cypress/e2e/security/` and a row in the test plan.
5. Restart the server, then run the security specs. Report the result to the user.

## Run

```bash
npm run build && npm start
npx cypress run --e2e --browser chrome --spec "cypress/e2e/security/**/*.cy.js"
```

Set `CYPRESS_TMDB_API_KEY` to also search for the exact key value.

## Pitfalls

- `allowCypressEnv` is `false`: use `cy.env()`, not `Cypress.env()`.
- The text `TMDB_API_KEY` is part of the `apiKeyMissing` i18n messages and appears in bundles. Search for `api_key=` and the key value.
- `cy.intercept()` cannot stub server-side TMDB requests.
- `next start` serves the last build. Rebuild after changing server code.

## Documentation

- **Security Tests**: [`docs/testing/security-tests.md`](../../../docs/testing/security-tests.md)
- **Test plan**: [`cypress/e2e/security/security-testplan.md`](../../../cypress/e2e/security/security-testplan.md)
- **Testing skill**: [`tmdb-testing`](../tmdb-testing/SKILL.md)

## When to Use

Use this skill when:

- Adding or changing API routes or query parameters
- Changing the search, the list routes, or the TMDB service layer
- Handling environment variables or secrets
- Reviewing the app for security problems
