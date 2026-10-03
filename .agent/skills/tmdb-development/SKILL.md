---
name: tmdb-development
description: Implement or modify application behavior in the TMDB Next.js frontend, including features, bug fixes, components, routes, styling, data flow, and refactors.
version: 0.1.0
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

## Constraints

- Do not introduce dependencies, environment variables, routes, or API changes
  without explaining the reason and obtaining approval when the change expands
  scope.
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
