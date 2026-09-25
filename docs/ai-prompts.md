# AI Prompts for Development

This file documents proven prompt patterns for AI-assisted development in the project.

## Core Principles

- **Clear structure:** Use sections with headings such as `## Role`, `## Task`, `## Context`, `## Examples`, and `## Output Format`.
- **Start with the goal:** Define one clear task and its success criteria.
- **Provide context early:** Mention the tech stack, relevant files, existing patterns, and functional constraints at the beginning.
- **Use examples:** Two or three examples of the desired output are often more helpful than lengthy explanations.
- **Work iteratively and minimally:** Start with a concise, clear request and add only what is genuinely missing for a better result.

## Project Context

This project uses:

- Next.js 16 with the App Router
- React 19
- JavaScript (no TypeScript); type safety via JSDoc and Zod (see below)
- Sass/SCSS for styles
- Fomantic UI / Semantic UI classes
- Zod for runtime validation
- Prettier and ESLint for formatting and code quality

## Type Safety: JSDoc and Zod

This project does **not** use TypeScript. Type safety is achieved through two complementary tools:

### JSDoc

Use JSDoc to document function signatures, parameters, return types, and shared type definitions directly in the source code.

- Use `@param` and `@returns` for important or non-obvious functions.
- Use `@typedef` for shared object shapes (e.g. component prop types, API result shapes).
- Document newly created or substantially changed functions with JSDoc.
- Treat the JSDoc belonging to a method or function as one unit — do not split or orphan comments.
- Use JSDoc with judgment: document important or non-obvious functions, but do not artificially inflate trivial files.

**Component props example:**
```
/**
 * @param {{ mediaType: 'movie' | 'tv' | string | null, className?: string }} props
 */
export default function MediaTypeLabel({ mediaType, className = '' }) { ... }
```

**Typedef example:**
```
/**
 * @typedef {{ id: number | string, name: string, logoPath?: string }} ProductionCompany
 */
```

**Function signature example:**
```
/**
 * Normalizes a locale to a supported language code.
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function resolveLocale(value) { ... }
```

### Zod

Use Zod for **runtime validation of external data** — wherever data from outside the application enters (API responses, form inputs, URL params).

- Zod schemas live in `lib/schemas/`.
- Use Zod in API routes (`app/api/`) to validate request inputs and TMDB API responses.
- Do **not** use Zod for internal component props — JSDoc is sufficient there.

**When to use which:**

| Use case                | Tool                        |
|-------------------------|-----------------------------|
| Component props         | JSDoc `@param`              |
| Function signatures     | JSDoc `@param` / `@returns` |
| Shared type definitions | JSDoc `@typedef`            |
| API response validation | Zod                         |
| Form input validation   | Zod                         |
| External data ingestion | Zod                         |

Important project paths:

- `app/` for routes (Next.js App Router)
- `components/` for UI components
- `lib/stores/` for React Context stores
- `lib/i18n/` for translations and locale helpers
- `lib/services/` for TMDB API calls
- `lib/utils/` for utility functions
- `lib/schemas/` for Zod validation schemas
- `styles/` for global Sass styles

## Browser Targets

- The last two browser versions
- Market share above 0.5%
- No obsolete browsers

## Locally Available CLI Tools

- `rg` (ripgrep) for fast text searches
- `fd` for fast file and directory searches
- `fzf` for interactive selection and filtering
- `bat` for readable file output
- `delta` for readable Git diffs
- `sd` for simple, targeted text changes

## Session Start Prompt

This prompt is a recommended starting template for new AI sessions in this project.

### Rule Priority and Document Scope

Apply instructions in the following order:

1. Explicit instructions in the current task.
2. Project-specific rules in this document.
3. Existing code patterns, architecture, and repository conventions.
4. General framework and software-engineering best practices.

For test tasks, apply the relevant documentation in this order:

1. `docs/testing.md`
2. `docs/testing/common-rules.md`
3. The relevant guide in `docs/testing/`
4. For Playwright end-to-end acceptance tests: `playwright.config.js`, the affected feature directory's `*-testplan.md`, and its existing `*.spec.js` files

If instructions at the same priority level conflict, stop and explain the conflict before making changes. Never silently override a higher-priority instruction with a lower-priority preference.

### Current Framework Documentation and Research

Use the versions installed in this repository as the source of truth for framework and package behavior. Read `package.json` and `README.md` before proposing changes.

For Next.js or React tasks:

- Prefer the App Router patterns already established in this repository.
- Do not introduce Pages Router patterns or deprecated APIs unless the existing project code explicitly requires them.
- When framework behavior, APIs, migration guidance, accessibility advice, security guidance, browser support, or package compatibility may have changed since the available model knowledge, verify the question against current official documentation before implementation.
- Prefer primary sources, especially the official Next.js and React documentation, release notes, and maintained package documentation.
- State briefly which documentation was checked and which version or framework behavior informed the proposal.
- If current documentation cannot be accessed, state the uncertainty and provide a conservative proposal instead of presenting assumptions as facts.

For cloud-based research or documentation lookup:

- Share only the minimum necessary code context.
- Never include secrets, API keys, passwords, tokens, values from environment files, private URLs, or personal data.
- Treat external documentation as guidance; reconcile it with the installed dependency versions and existing repository conventions.

First, read `README.md` and `package.json`.

Important working rules:
- Before making changes, briefly align on the goal, affected files, and proposed approach.
- Implement changes only in small, understandable steps.
- If there are concerns, alternatives, or unclear assumptions, explain them briefly first instead of changing the code immediately.
- Suggest standardizations, but do not implement them without prior approval.
- The directory structure exists for a reason and must not be reorganized without prior approval.
- Do not modify files outside the explicitly approved scope. If additional files appear necessary, stop and ask for approval.
- Do not commit, push, create branches, or open pull requests unless explicitly requested.
- Never include, expose, or commit secrets, API keys, passwords, tokens, or values from environment files.

Execution notes:
- If the specified CLI tools are not installed locally, check whether they should be installed and ask for approval at the beginning of the session.
- If the tools are installed locally, they may be used.
- If other locally installable tools would significantly speed up the work, proactively mention them and briefly explain why.
- If a task is likely to require more steps than can reasonably be completed in one pass, say so early and split it into smaller packages.

Error and retry handling:
- If a tool call is interrupted or fails, state this clearly at once, including the suspected cause, impact, and next sensible step.
- After an interrupted tool call, do not make silent assumptions. Either restart cleanly or ask for clarification.
- Flaky commands may be retried deliberately, but not indefinitely: first perform a short retry, then assess the situation, and if it fails again, narrow down the cause instead of continuing blindly.
- Before targeted file edits, read the current file state exactly and copy search text character-for-character from the file.
- If an edit fails because of an exact match, reread the file and choose the smallest safe change.
- If something goes wrong or is not completed, say so openly so work can resume at exactly that point.

Code creation and modification strategy:
- Prefer existing patterns, conventions, and architecture.
- Apply Next.js and React best practices, including proper error handling and appropriate use of Server Components, Client Components, and existing Context stores.
- JavaScript should remain readable, transparent, and easy for people to understand.
- Do not use TypeScript unless explicitly agreed otherwise.
- Use JSDoc for type documentation (see "Type Safety: JSDoc and Zod" section above).
- Use Zod for runtime validation of external data (API responses, form inputs).
- Work with what is already available in the project and locally; use existing browser APIs first and do not introduce or install additional libraries or tools without approval.
- Suggestions for useful additional libraries or tools are welcome, but their use or installation requires prior approval.
- If `switch`/`case` makes the logic clearer and more transparent, prefer that structure.
- Document newly created or substantially changed functions with JSDoc.
- Treat the JSDoc belonging to a method or function as one unit.
- For documentation tasks, only add documentation and do not refactor logic at the same time.
- Use JSDoc with judgment: document important or non-obvious functions, but do not artificially inflate trivial files.
- Prefer semantic HTML, avoid unnecessary `div` elements, and consider screen readers, keyboard navigation, and meaningful ARIA attributes.
- Keep Sass/CSS readable and limit nesting to a maximum of three levels.
- Leave imports of other CSS or Sass libraries untouched initially, as they are usually managed centrally through imports.
- After each meaningful step, briefly state the result and the next option.
- Then review changes deliberately.

General:
- Work concisely, in a structured and project-specific way.
- Keep responses brief by default.
- Whenever possible, describe tasks briefly using the goal, affected files, and desired mode, such as analyze, suggest, implement, or verify.

## Standard Prompts

### Create a New Component

```text
Create a new React component following the style of `components/CardDefault.jsx`.

Goal: [brief description of the component]

Requirements:
- Use our design variables and Fomantic UI classes.
- Pay attention to ARIA labels and semantic HTML.
- Do not use external libraries; use existing patterns only.
- Mark the file with 'use client' only if client-side state or browser APIs are required.
- Document props with JSDoc (@param).

Output: A `.jsx` file in the `components/` directory.
```

### Write a Test

```text
Create a test for [function/component/feature].

Context:
- The test subject is located in `lib/` or `components/` or `app/`.
- Read `docs/testing.md`, `docs/testing/common-rules.md`, and the applicable test-level guide before proposing changes.
- Existing tests are in `tests/unit/`, `tests/integration/`, or `tests/acceptance/`.

Requirements:
- Select the appropriate test level before implementation.
- Preserve existing patterns and conventions.
- Reuse fixtures, mocks, and setup utilities where applicable.
- For Playwright end-to-end acceptance tests, also read `playwright.config.js` and the affected feature directory's test plan and existing specifications.

Output: A test file in the appropriate existing test directory.
```

### CSS Change

```text
Change the CSS in `styles/app.scss` to achieve [goal].

Requirements:
- Use existing Sass variables and mixins.
- Observe browser compatibility according to the project configuration.
- Limit nesting to a maximum of three levels.

Output: The modified SCSS file.
```

### Refactoring

```text
Refactor [function/component] for improved readability.

Goal:
- [specific goal, e.g. "less nesting" or "better error handling"]

Requirements:
- Preserve existing patterns and conventions.
- Do not introduce new libraries.
- Add JSDoc for important or non-obvious functions.

Output: The refactored file.
```

### Internationalization (i18n)

```text
Add new UI text to `lib/i18n/ui.json`.

Requirements:
- Always update all supported locales (de-DE, en-US, es-ES, fr-FR, vi-VN).
- Use concise, precise wording.
- Do not use hardcoded strings in the code; always use i18n keys via `useI18n()`.
- If the translation is uncertain, ask a brief clarification question.

Output: The modified `ui.json` with entries for all locales.
```

### New API Route

```text
Create a new Next.js API route following the style of existing routes in `app/api/`.

Goal: [brief description of the endpoint]

Requirements:
- Use the App Router convention (`route.js` with exported `GET`/`POST` handlers).
- Validate input with Zod schemas from `lib/schemas/`.
- Use the appropriate service from `lib/services/` for TMDB API calls.
- Return consistent error responses.

Output: A `route.js` file in the appropriate `app/api/` subdirectory.
```

## Dos and Don'ts

### Dos

- Formulate clear, specific tasks.
- Mention the tech stack and context early.
- Provide examples of the desired output.
- Work iteratively and verify intermediate results.
- Review AI-generated code like external code.

### Don'ts

- Do not include secrets or API keys in prompts.
- Do not formulate vague tasks such as "make it better."
- Do not write long, unstructured prompts without a goal and context.
- Do not make assumptions about files or project parts that were not mentioned.
- Do not use TypeScript; use JSDoc and Zod instead.

## Security Notes

- **No secrets:** Never use API keys, passwords, or other sensitive data in prompts.
- **Review required:** Every piece of AI-generated code must be reviewed before merging.
- **CI scans:** Automatic SAST and secret scans are useful for AI-influenced changes.

## Further Information

- `README.md` for project context and tech stack
- `next.config.mjs` for build and runtime configuration
- `.env.example` for required environment variables
- `docs/testing.md` for the project's testing overview (to be created)
- `docs/testing/common-rules.md` for rules shared by all automated tests (to be created)
- `docs/testing/unit-tests.md` for Vitest unit-test rules (to be created)
- `docs/testing/playwright-acceptance-tests.md` for Playwright end-to-end acceptance-test rules (to be created)
