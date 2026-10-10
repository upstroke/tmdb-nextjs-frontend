---
name: tmdb-ai-collaboration
description: Plan, scope, validate, and review AI-assisted work in the TMDB Next.js frontend while keeping the user in control of edits, commands, commits, and pull requests. Use for broad, ambiguous, multi-step, or risky tasks, for implementation plans, and before commits, pushes, pull requests, deletions, dependency changes, or configuration changes.
metadata:
  version: '0.3.2'
---

# TMDB AI collaboration

## Use this skill

Use this skill for broad, ambiguous, multi-step, risky, or AI-assisted tasks;
for implementation planning; and before commits, pushes, pull requests,
deletions, dependency changes, or configuration changes.

Read `README.md` and `package.json`. Read the relevant specialist skill before
proposing technical changes.

## Rule priority

Apply instructions in this order:

1. Explicit instructions in the current task.
2. Project rules in `AGENTS.md` and the skills.
3. Existing code patterns, architecture, and repository conventions.
4. General framework and software-engineering best practices.

If instructions at the same level conflict, stop and explain the conflict
before changing anything. Never silently override a higher priority with a
lower one.

## Workflow

1. Restate the requested outcome, constraints, and acceptance criteria.
2. Inspect the relevant repository files before making recommendations.
3. Identify assumptions, unknowns, risks, and the smallest useful next step.
4. Produce a concise plan before editing when scope is not trivial. Name the
   goal, affected files, and mode (analyze, suggest, implement, verify).
5. Break implementation into reviewable increments and explain why each file
   changes. Split work that cannot be finished in one pass into smaller
   packages and say so early.
6. Request explicit approval before irreversible or external actions, including
   writing files, creating commits, pushing branches, deleting files, creating
   pull requests, changing dependencies, or modifying configuration.
7. Do not modify files outside the approved scope; stop and ask if more files
   seem necessary. Suggest standardizations but do not implement them without
   approval. Do not reorganize the directory structure without approval.
8. After changes, inspect the diff and run `scripts/validate.sh` when a
   standard validation pass is appropriate.
9. Report facts only: files changed, commands run, outcomes, skipped checks,
   unresolved risks, and follow-up decisions. Keep responses brief.

## Renames and removals

When a file, function, script, or term is renamed or removed, search the whole
repository for the old name before finishing, for example
`rg -i "<old-name>" --glob '!node_modules' --glob '!package-lock.json'`.
Update code, tests, test plans, docs, skills, and `README.md` in the same
change, or list the places left open.

## Definition of done

A task is done when all of the following apply, or the open points are named:

- The change matches the approved scope and acceptance criteria.
- Tests exist or were updated at the right level (see `AGENTS.md`).
- Test plans and docs that describe the changed behavior are in sync.
- The old names are gone (see "Renames and removals").
- Validation was run and its output was observed, or skipped checks are listed.
- Open risks and follow-up decisions are reported.

## Git conventions

These reflect current practice in this repository. Confirm with the user if a
task needs something different.

- Branch from `main`; name branches `<type>/<short-topic>`, for example
  `chore/middleware-to-proxy` or `tests/security-with-cypress`.
- Write commit messages as `<type>: <summary>` with types such as `chore`,
  `docs`, `test`, `feat`, and `fix`.
- Open one pull request per topic with a summary and a test plan checklist.
- Create branches, commits, and pull requests only after explicit approval.

## Errors and retries

- State a failed or interrupted tool call at once, with suspected cause, impact,
  and next step. Do not make silent assumptions after an interruption.
- Retry a flaky command once, then assess and narrow down the cause instead of
  repeating blindly.
- Read the current file state before an edit and copy search text exactly. If an
  edit fails to match, reread the file and make the smallest safe change.
- Say openly what was not completed so work can resume at that point.

## Security

- Never include, expose, or commit secrets, API keys, passwords, tokens, or
  environment-file values.
- Review all AI-generated code like external code before it is merged.
- Ask for approval before installing missing CLI tools; locally installed tools
  listed in `AGENTS.md` may be used.

## Validation

`scripts/validate.sh` runs the project’s standard local checks:

```bash
npm run lint
npm run format:check
npm run test:unit
npm run test:component
npm run test:integration
npm run build
```

`npm run lint` fails on any warning (`--max-warnings=0`). For a quicker check
without the production build, use `npm run check` (lint, format check, and the
Vitest single run).

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
