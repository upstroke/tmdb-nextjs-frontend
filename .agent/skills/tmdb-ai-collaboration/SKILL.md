---
name: tmdb-ai-collaboration
description: Plan, scope, validate, and review AI-assisted work in the TMDB Next.js frontend while keeping the user in control of edits, commands, commits, and pull requests.
version: 0.1.0
---

# TMDB AI collaboration

## Use this skill

Use this skill for broad, ambiguous, multi-step, risky, or AI-assisted tasks;
for implementation planning; and before commits, pushes, pull requests,
deletions, dependency changes, or configuration changes.

Read `docs/ai-prompts.md`, `README.md`, and `package.json`. Read the relevant
specialist skill before proposing technical changes.

## Workflow

1. Restate the requested outcome, constraints, and acceptance criteria.
2. Inspect the relevant repository files before making recommendations.
3. Identify assumptions, unknowns, risks, and the smallest useful next step.
4. Produce a concise plan before editing when scope is not trivial.
5. Break implementation into reviewable increments and explain why each file
   changes.
6. Request explicit approval before irreversible or external actions, including
   writing files, creating commits, pushing branches, deleting files, creating
   pull requests, changing dependencies, or modifying configuration.
7. After changes, inspect the diff and run `scripts/validate.sh` when a
   standard validation pass is appropriate.
8. Report facts only: files changed, commands run, outcomes, skipped checks,
   unresolved risks, and follow-up decisions.

## Validation

`scripts/validate.sh` runs the project’s standard local checks:

```bash
npm run lint
npm run test:unit
npm run build
```

Run Cypress acceptance tests separately when the change affects a user journey,
navigation flow, browser behavior, or an existing acceptance test.

Do not claim validation succeeded unless every command completed successfully
and its output was observed.

## Review rules

- Compare generated changes against existing project patterns and the relevant
  documentation.
- Prefer a focused correction over a broad rewrite.
- Challenge unsupported assumptions and invented APIs, scripts, dependencies,
  or test outcomes.
- Do not treat documentation plans as proof that a feature already exists.
- Keep the user in control of commits, merges, branch deletion, and publication.

## Prompt pattern

Use this request structure when planning work:

> Read the applicable Agent Skills and the relevant implementation and tests.
> Explain the current behavior, propose the smallest plan, identify test and
> accessibility implications, and do not edit files until approval is given.
