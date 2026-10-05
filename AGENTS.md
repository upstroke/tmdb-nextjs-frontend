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

# Validation

- Use `npm test` for the Vitest single run.
- Use `npm run test:watch` for watch mode.
- Run `npm run build` for production-build validation.
- Treat Cypress acceptance tests as a separate validation step.
- Cypress discovery/import configuration currently requires alignment; consult `docs/testing.md` before relying on the acceptance suite.

Do not edit files, run destructive commands, change dependencies, push commits,
or create pull requests without the user’s explicit approval.
