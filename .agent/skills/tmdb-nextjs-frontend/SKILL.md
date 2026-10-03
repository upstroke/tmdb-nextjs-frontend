---
name: tmdb-nextjs-frontend
description: >
  Project-specific workflow for developing, testing, reviewing, and documenting
  the TMDB Next.js frontend. Covers implementation, accessibility, unit tests,
  integration tests, acceptance tests, page objects, and AI collaboration.
version: 0.1.0
license: MIT
---

# TMDB Next.js Frontend

## Purpose

Help agents make small, reviewable, production-quality changes that follow the
repository’s existing architecture, testing strategy, accessibility standards,
and documentation practices.

This project is a Next.js frontend for TMDB-style movie and TV data. It uses
Vitest for unit and integration testing and Cypress for acceptance testing.

## Core rules

- Read the relevant project documentation before implementing.
- Follow existing file placement, naming, component, styling, and test patterns.
- Prefer the smallest change that solves the stated problem.
- Do not introduce new dependencies, APIs, environment variables, routes, or
  architectural patterns without explaining why they are necessary.
- Preserve existing behavior unless the task explicitly requires a change.
- Treat unfinished ideas in documentation as goals to move toward, not as
  evidence that they are already implemented.
- Do not claim that a feature, test, accessibility check, or command has passed
  unless it was actually run and its result was observed.

## Required context

Before implementation, inspect:

1. `README.md`
2. `package.json`
3. `.agent/skills/tmdb-nextjs-frontend/SKILL.md`
4. Relevant reference documentation:
   - `references/testing.md`
   - `references/accessibility.md`
   - `references/ai-prompts.md`
5. Nearby source files, components, utilities, and tests.

## Implementation workflow

1. Restate the requested behavior as observable user-facing or technical behavior.
2. Identify the affected area: route, component, hook, utility, API layer,
   styling, test, configuration, or documentation.
3. Inspect similar existing implementations before creating new abstractions.
4. Implement the change incrementally.
5. Add or update tests that verify the changed behavior.
6. Update documentation when setup, architecture, testing, accessibility, or
   contributor workflows change.
7. Run the narrowest relevant checks first, then broader checks as appropriate.

## Testing strategy

Use the test level that gives the clearest feedback for the change:

| Change type | Preferred test level |
|---|---|
| Pure function, helper, formatter, or data transformation | Unit test |
| Component rendering, user interaction, state, or accessibility behavior | Component or integration test |
| Route, data fetching, server/client boundary, or cross-component behavior | Integration test |
| Complete user journey, navigation, keyboard flow, or visual workflow | Cypress acceptance test |

Follow these principles:

- Test behavior, not implementation details.
- Use accessible queries and semantic roles where possible.
- Prefer realistic fixtures and mocks at network or external-service boundaries.
- Cover loading, success, empty, error, and edge-case states where relevant.
- Add a regression test for every bug fix.
- Keep test names descriptive and focused on user-visible behavior.
- Reuse existing fixtures, helpers, setup code, and page objects.

## Accessibility workflow

Accessibility is part of normal implementation, not a separate final phase.

For every UI change:

- Use semantic HTML before adding ARIA.
- Ensure keyboard operability and visible focus.
- Provide accessible names for interactive controls.
- Associate labels, descriptions, errors, and status messages correctly.
- Preserve logical heading order and landmarks.
- Do not communicate state through color or iconography alone.
- Handle focus appropriately for dialogs, menus, tabs, disclosures, and overlays.
- Respect reduced-motion preferences for nonessential animation.
- Check contrast, target size, reading order, and screen-reader announcements
  for changes that affect user interaction or content structure.

For accessibility-sensitive work, consult
`references/accessibility.md` and apply the repository’s audit checklist.

## Documentation workflow

Update documentation when a change affects:

- Local setup or required environment variables
- Commands and scripts
- Architecture or data flow
- Testing strategy or test conventions
- Accessibility expectations
- AI-agent collaboration rules
- Public behavior or contributor workflows

Keep documentation concise, accurate, and executable. Do not duplicate policy;
link to the most specific source of truth.

## Validation

Use commands defined in `package.json`. Do not invent commands.

Before reporting completion, run the relevant checks from this order:

1. Lint or format check
2. Relevant unit tests
3. Relevant integration tests
4. Relevant Cypress acceptance tests
5. Production build for routing, configuration, dependency, or integration changes

Report:

- Exact commands run
- Whether each command passed or failed
- Any checks intentionally skipped and why

## Git workflow

- Keep each commit focused on one logical change.
- Use imperative, concise commit messages.
- Do not commit secrets, generated artifacts, or unrelated formatting changes.
- Before requesting review, summarize the problem, solution, tests, accessibility
  impact, documentation updates, and known limitations.
- Do not push, merge, delete files, or create pull requests without explicit
  user approval.

## AI collaboration

When working with an AI agent:

- Ask for a plan before large or ambiguous changes.
- Require references to existing files and patterns.
- Prefer incremental implementation over large rewrites.
- Ask the agent to identify assumptions and missing information.
- Require validation commands and results before accepting a change.
- Treat generated code as a draft that must be reviewed, tested, and adapted to
  project conventions.

See `references/ai-prompts.md` for project-specific prompt and collaboration
guidance.
