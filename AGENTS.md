# Agent skills

This repository contains task-focused Agent Skills in `.agent/skills/`.

Select and read the applicable `SKILL.md` before acting:

- `tmdb-development` — features, fixes, refactors, components, routes, and styling
- `tmdb-testing` — unit, integration, and Cypress acceptance tests
- `tmdb-accessibility` — keyboard, focus, semantics, ARIA, and accessibility audits
- `tmdb-ai-collaboration` — planning, review, validation, and collaboration boundaries

For work that spans several areas, read each applicable skill. Begin with
`tmdb-ai-collaboration` when the request is ambiguous, broad, or asks for an
implementation plan.

# Project constraints

- Use Next.js 15 with the App Router and React 19.
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

| Level | Tool | Location | Purpose |
|---|---|---|---|
| Unit | Vitest | `tests/unit/` | Pure logic: mappers, Zod schemas, utilities |
| Integration | Vitest + Testing Library + msw | `tests/integration/` | Real integration only: a page or section renders with mocked data and values reach the components |
| Component and accessibility | Cypress + `cypress-axe` | `tests/cypress/` | Component behavior in a real browser: keyboard, focus, ARIA, visibility, contrast |
| Acceptance | Cypress | `tests/cypress/` | User flows such as search, detail page, and navigation |

Rules:

- Do not write component tests with Vitest. jsdom has no layout and cannot check color contrast or real focus behavior.
- Keep `tests/integration/` limited to true integration tests. Assert on the rendered DOM (roles, text), not on props.
- Test keyboard interaction, focus management, and ARIA states in Cypress, for example tabs, modals, and dropdowns.
- Run `cy.checkA11y()` (`cypress-axe`) on pages and after relevant interactions.
- Do not add Vitest tests for purely presentational components. Integration or Cypress tests cover them.

# Validation

- Use `npm test` for the Vitest single run (unit and integration).
- Use `npm run test:vitest:watch` for Vitest watch mode.
- Use `npm run test:unit` or `npm run test:integration` for focused Vitest validation.
- Use `npm run test:vitest:coverage` when coverage is required.
- Run `npm run build` for production-build validation.
- Treat Cypress as a separate validation step. Cypress has two modes:
  - E2E (`cypress.config.js` `e2e`, specs in `tests/cypress/acceptance/`): `npm run test:acceptance` runs headlessly (`cypress run --e2e`) and `npm run test:acceptance:ui` opens the interactive runner. The app must run on `http://localhost:3000`.
  - Component (`cypress.config.js` `component`, specs in `tests/cypress/component/**/*.cy.{js,jsx}`): `npm run test:component` runs headlessly (`cypress run --component`) and `npm run test:component:ui` opens the interactive runner.
  - `npm run test:cypress` runs `cypress run` for both modes.
- Cypress is configured to use `tests/cypress/` for specs, support files, fixtures, screenshots, and videos; consult `docs/testing.md` for test conventions.

Do not edit files, run destructive commands, change dependencies, push commits,
or create pull requests without the user’s explicit approval.
