# Agent skills

This repository uses tool-neutral Agent Skills in `.agents/skills/`.
Select and read the applicable `SKILL.md` before acting:

- `tmdb-ai-collaboration` — planning, review, validation, and collaboration boundaries
- `tmdb-development` — features, fixes, refactors, components, routes, and styling
- `tmdb-testing` — unit, integration, component, and Cypress acceptance tests
- `tmdb-accessibility` — keyboard, focus, semantics, ARIA, and accessibility audits
- `tmdb-security` — input validation, API key handling, and Cypress security tests

For work that spans several areas, read each applicable skill. Begin with
`tmdb-ai-collaboration` when the request is ambiguous, broad, or asks for an
implementation plan.

# Reading order

1. Read `README.md` for the project overview, setup, commands, and documentation index.
2. Read this file for binding project rules.
3. Read the applicable skills in `.agents/skills/`.
4. Read the relevant detailed documentation in `docs/`.
5. Read the relevant implementation, tests, and test plans before proposing changes.

# Documentation map

| Topic                                                | Source of truth                                         |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Project overview, setup, commands                    | `README.md`                                             |
| AI collaboration rules and review guards             | `AGENTS.md` and `.agents/skills/tmdb-ai-collaboration/` |
| TMDB integration and API-key handling                | `docs/architecture/tmdb-integration.md`                 |
| Internationalization                                 | `docs/development/internationalization.md`              |
| Type safety                                          | `docs/development/type-safety.md`                       |
| Streaming data                                       | `docs/development/streaming-data.md`                    |
| Testing strategy, commands, coverage, and validation | `docs/testing.md`                                       |
| Security tests                                       | `docs/testing/security-tests.md`                        |
| Accessibility audits                                 | `docs/testing/accessibility-audit-checklist.md`         |
| Technical debt                                       | `docs/backlog/technical-debt.md`                        |

Do not duplicate detailed reference material between `README.md`, `AGENTS.md`, skills, and `docs/`. Keep each source focused on its role.

# Planning and review

For every non-trivial implementation or refactoring task, read and apply
`.agents/skills/tmdb-ai-collaboration/plan-quality.md` before producing a plan.

Before implementing or reviewing a non-trivial change, apply the review guards
in `.agents/skills/tmdb-ai-collaboration/review-guards.md`.

A plan is not complete unless it distinguishes verified repository facts from
assumptions, identifies the lifetime of any cached data, and describes the
exact request and UI behavior for each affected user flow.

# Project constraints

- Use Next.js 16 with the App Router and React 19.
- Use JavaScript, not TypeScript.
- Preserve the existing separation between `app/`, `components/`, and `lib/`.
- Use Fomantic UI CSS and Sass consistently with the existing codebase.
- Use JSDoc for function and component contracts.
- Use Zod for runtime validation of external data, API responses, and form input.

# Internationalization

- Preserve locale propagation through internal navigation and server-side data requests.
- Preserve the current route when changing languages.
- Reuse the existing locale modules in `lib/i18n/`.
- Store UI translations and rating formats in `lib/i18n/ui.json` and `lib/i18n/ratings.json`.

# Data handling

- Treat TMDB API data as incomplete or unreliable until validated.
- Reuse the TMDB service layer in `lib/services/tmdb-api.js`.
- Use Zod schemas from `lib/schemas/` when external data enters the application.
- Preserve existing fallback behavior for missing data.
- Remove duplicates when loading additional paginated data.
- Preserve locale information in TMDB requests.

# Security

- Keep `TMDB_API_KEY` on the server. Add it only in `lib/services/tmdb-api.js`.
- Treat query parameters, route parameters, and `sessionStorage` values as untrusted.
- Validate untrusted input with Zod and give numbers an upper limit (`page` max 500).
- Manipulated input must give a `400`, an empty result, or a fallback. It must never give a `5xx`.
- Read `.agents/skills/tmdb-security/SKILL.md` and `docs/testing/security-tests.md` before changing API routes or schemas.

# API and browser capabilities

- Use the project's Next.js API mechanisms for application/API work where they fit the existing architecture.
- Use browser APIs directly when the requirement concerns browser capabilities, such as storage, media queries, viewport state, URL state, events, or other client-side platform behavior.
- Do not replace browser APIs with server-side code when the behavior must run in the browser.
- Do not introduce a new data-fetching or API pattern before inspecting the existing implementation and project conventions.
- Keep browser-only APIs inside client-side code and guard them against server-side rendering.
- Check the relevant tests and accessibility requirements after changing API or browser behavior.

# Locally available CLI tools

Prefer these tools when they are available:

- `rg` (`ripgrep`) for fast text searches
- `fd` (`fd-find`) for fast file and directory searches
- `fzf` for interactive selection and filtering
- `bat` for readable file output
- `delta` for readable Git diffs
- `sd` for targeted text changes

# Test strategy

Choose the test tool and environment by scope:

| Level         | Tool                                         | Location                                                      | Purpose                                                                    |
| ------------- | -------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Unit          | Vitest (jsdom)                               | `vitest/unit/`                                                | Isolated logic, schemas, utilities, services, stores, and route behavior   |
| Integration   | Vitest (jsdom) + Testing Library             | `vitest/integration/`                                         | Route/service/schema or page integration with external TMDB network mocked |
| Component     | Vitest browser mode (Playwright, Chromium)   | `vitest/component/`                                           | Isolated rendering, props, interaction, keyboard, focus, and ARIA states   |
| e2e           | Cypress                                      | `cypress/e2e/`                                                | Full-application user flows                                                |
| Accessibility | Vitest browser mode; Cypress + `cypress-axe` | `vitest/component/`, `cypress/accessibility/`, `cypress/e2e/` | Component semantics and interaction; full-page accessibility checks        |
| Security      | Cypress                                      | `cypress/e2e/security/`                                       | Manipulated input, XSS, API key exposure, list and search API routes       |

Key rules:

- Do not write component tests in jsdom; use Vitest browser mode for layout, focus, contrast, and native browser behavior.
- Keep integration tests limited to true integration tests and mock only the external TMDB network with `globalThis.fetch`.
- Use Cypress for behavior spanning pages or requiring the running application.
- Keep Cypress Page Objects in `cypress/POM/`; do not import them into Vitest tests.
- In Cypress specs, use `cy.env()`, not `Cypress.env()`.
- When a test is added, changed, fixed, or removed, update its test plan and affected documentation in the same change.
- Use English for explanatory documentation, test names, and comments; preserve identifiers and intentionally localized test data.

# Validation

Use the validation commands documented in `README.md` and `docs/testing.md`:

- `npm run validate:fast` for quick feedback before committing.
- `npm run validate` before pushing a change or opening a pull request.
- `npm run validate:all` for complete automated validation.
- Run Cypress acceptance, accessibility, and security suites separately when relevant to the change.

Do not claim validation succeeded unless every command completed successfully and its output was observed.

# Technical debt

Known technical-debt items are tracked in `docs/backlog/technical-debt.md`.
Consider relevant items when planning related changes.

# Approval boundary

Do not edit files, run destructive commands, change dependencies, push commits,
or create pull requests without the user’s explicit approval.
