# Agent skills

This repository contains task-focused Agent Skills in `.agent/skills/`.

Select and read the applicable `SKILL.md` before acting:

- `tmdb-development` — features, fixes, refactors, components, routes, and styling
- `tmdb-testing` — unit, integration, component, and Cypress acceptance tests
- `tmdb-accessibility` — keyboard, focus, semantics, ARIA, and accessibility audits
- `tmdb-security` — input validation, API key handling, and Cypress security tests
- `tmdb-ai-collaboration` — planning, review, validation, and collaboration boundaries

For work that spans several areas, read each applicable skill. Begin with
`tmdb-ai-collaboration` when the request is ambiguous, broad, or asks for an
implementation plan.

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
- Reuse the existing locale modules:
  - `lib/i18n/helpers.js`
  - `lib/i18n/config.js`
  - `lib/i18n/resolver.js`
- Store UI translations and rating formats in:
  - `lib/i18n/ui.json`
  - `lib/i18n/ratings.json`

# Data handling

- Treat TMDB API data as incomplete or unreliable until validated.
- Reuse the TMDB service layer in `lib/services/tmdb-api.js`.
- Use Zod schemas from `lib/schemas/` when external data enters the application.
- Preserve existing fallback behavior for missing data.
- Remove duplicates when loading additional paginated data.
- Preserve locale information in TMDB requests.

# Security

- Keep `TMDB_API_KEY` on the server. Add it only in `lib/services/tmdb-api.js`.
- Treat query parameters, route parameters, and `sessionStorage` values as untrusted. Validate them with Zod and give numbers an upper limit (`page` max 500).
- Manipulated input must give a `400`, an empty result, or a fallback. It must never give a `5xx`.
- Read `.agent/skills/tmdb-security/SKILL.md` and `docs/testing/security-tests.md` before changing API routes or schemas.

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
- `fd` for fast file and directory searches
- `fzf` for interactive selection and filtering
- `bat` for readable file output
- `delta` for readable Git diffs
- `sd` for simple, targeted text changes

# Test strategy

Each test type has one tool and one purpose:

| Level       | Tool                                       | Location                                 | Purpose                                                                                           |
| ----------- | ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Unit        | Vitest (jsdom)                             | `vitest/unit/`                           | Pure logic: mappers, Zod schemas, utilities                                                       |
| Integration | Vitest (jsdom) + Testing Library           | `vitest/integration/`                    | Real integration only: a page or section renders with mocked data and values reach the components |
| Component   | Vitest browser mode (Playwright, Chromium) | `vitest/component/`                      | Component behavior in a real browser: rendering, props, interaction                               |
| e2e         | Cypress                                    | `cypress/e2e/`                           | User flows such as search, detail page, and navigation                                            |
| Accessibility | Cypress + `cypress-axe`                  | `cypress/accessibility/`, `cypress/e2e/` | Keyboard, focus, ARIA, visibility, contrast                                                       |
| Security    | Cypress                                    | `cypress/e2e/security/`                  | Manipulated input, XSS, API key exposure, list and search API routes                              |

Rules:

- Do not write component tests in jsdom. jsdom has no layout and cannot check color contrast or real focus behavior. Use Vitest browser mode in `vitest/component/` instead.
- Keep `vitest/integration/` limited to true integration tests. Assert on the rendered DOM (roles, text), not on props.
- Test keyboard interaction, focus management, and ARIA states in Cypress, for example tabs, modals, and dropdowns.
- Run `cy.checkA11y()` (`cypress-axe`) on pages and after relevant interactions.
- Do not add tests for purely presentational components. Integration or Cypress tests cover them.
- Check whether a dialog is really open and visible in Cypress. jsdom has no `showModal`, so Vitest tests stub it and only assert the message text.
- In Cypress specs, do not use `Cypress.env()`. `allowCypressEnv` is `false`, so use `cy.env()`.

# Validation

- Use `npm test` for the Vitest single run.
- Use `npx vitest` for Vitest watch mode.
- Use `npm run test:unit`, `npm run test:integration`, or `npm run test:component` for focused Vitest validation.
- Use `npm run test:coverage` when coverage is required.
- Run `npm run build` for production-build validation.
- Treat Cypress as a separate validation step. `npm run test:e2e` runs the specs headlessly (`cypress run --e2e --browser chrome`) and `npm run test:e2e:open` opens the interactive runner. The app must run on `http://localhost:3000`.
- Run only the security specs with `npx cypress run --e2e --browser chrome --spec "cypress/e2e/security/**/*.cy.js"`. Restart or rebuild the server first if server code changed.

Do not edit files, run destructive commands, change dependencies, push commits,
or create pull requests without the user’s explicit approval.
