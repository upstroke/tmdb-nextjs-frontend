---
name: tmdb-development
description: Implement or modify application behavior in the TMDB Next.js frontend, including features, bug fixes, components, routes, styling, data flow, and refactors.
version: 0.2.0
---

# TMDB development

## Use this skill

Use this skill for implementation work in `app/`, `components/`, `lib/`,
`styles/`, configuration, or other application code.

Read `README.md`, `package.json`, and the task-relevant source files before
proposing edits. Inspect a similar existing component, route, utility, or test
before creating a new pattern.

## Workflow

1. Restate the requested behavior in observable terms.
2. Run `scripts/changed-files.sh` when reviewing an existing branch or
   identifying the scope of pending work.
3. Identify affected files and inspect their callers, tests, and related UI.
4. Identify whether the work also requires `tmdb-testing` or
   `tmdb-accessibility`; read those skills before editing when applicable.
5. Present a concise plan when the task is ambiguous, multi-file, architectural,
   or changes user-facing behavior.
6. Make the smallest change that meets the requested behavior.
7. Preserve existing naming, file placement, imports, styling, and data-flow
   conventions unless the request explicitly changes them.
8. Add or update tests and documentation when the change affects behavior,
   setup, or contributor workflow.
9. Run only relevant commands that exist in `package.json` and report actual
   results.

## Code rules

- Prefer existing patterns, conventions, and architecture.
- Use Server Components by default; add `'use client'` only for client state or
  browser APIs. Reuse existing Context stores in `lib/stores/`.
- Use only App Router patterns; no Pages Router or deprecated APIs.
- Keep JavaScript readable; prefer `switch/case` when it makes logic clearer.
- Document new or substantially changed non-trivial functions with JSDoc
  (`@param`, `@returns`, `@typedef`). Keep a function and its JSDoc together.
  Do not add JSDoc to trivial code. Documentation-only tasks must not change
  logic.
- Use Zod (`lib/schemas/`) only for external data: API responses, form input,
  URL params. Use JSDoc, not Zod, for component props.
- Use semantic HTML, avoid needless `div` elements, support keyboard and screen
  readers; read `tmdb-accessibility` for interactive UI.
- Keep Sass nesting to three levels at most. Use existing variables and mixins.
  Leave central CSS/Sass library imports untouched.
- Respect browser targets: last two versions, above 0.5% market share, no
  obsolete browsers.

## Internationalization

- Add UI text to `lib/i18n/ui.json` for all locales: de-DE, en-US, es-ES,
  fr-FR, vi-VN.
- Never hardcode UI strings; use i18n keys via `useI18n()`.
- Ask when a translation is uncertain.

## API routes

- Use `app/api/**/route.js` with exported `GET`/`POST` handlers.
- Validate input with Zod schemas from `lib/schemas/`.
- Call TMDB only through `lib/services/tmdb-api.js`.
- Return consistent error responses.

## Framework currency

- Treat installed versions in `package.json` as the source of truth.
- When behavior, APIs, security, or compatibility may have changed, verify
  against official Next.js/React documentation and name the source checked.
- If documentation is unavailable, state the uncertainty and propose a
  conservative option.
- Share minimal code context for external lookups and never include secrets,
  environment values, private URLs, or personal data.

## Constraints

- Do not introduce dependencies, libraries, environment variables, routes, or
  API changes without explaining the reason and obtaining approval.
- Do not use TypeScript.
- Do not replace working code with a broad rewrite when a targeted change is
  possible.
- Preserve loading, success, empty, and error states where the affected feature
  has them.
- Treat locale-sensitive text, dates, numbers, and pluralization as
  implementation concerns; follow the project’s existing localization pattern.
- Do not claim a check passed unless it was run and its result was observed.

## Completion report

Report changed files, observable behavior, commands run and outcomes, skipped
checks with reasons, and any follow-up risks or decisions.
