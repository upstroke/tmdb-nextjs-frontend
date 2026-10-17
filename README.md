# TMDB Next.js Frontend

A Next.js frontend for browsing movies and TV shows from the TMDB API.

The application provides a media catalog with trending sections, paginated lists, detail pages, localized typeahead search, and fallback mechanisms for missing data.

![TMDB Next.js Frontend – Homepage](docs/images/homepage.png)

## Project Goal

This project serves as a frontend for a TMDB-based media catalog.

Its focus is on:

- clear presentation of movies and TV shows
- reusable React components
- robust handling of incomplete API data
- clean separation of UI, utility logic, and service layers
- a maintainable and testable architecture
- accessibility compliance (WCAG 2.2 AA)

## Features

- Homepage with trending movies and TV shows
- Separate overview pages for movies and TV shows
- Detail pages with images, metadata, cast, and production information
- Typeahead search for movies and TV shows
- Localized interface
- Language switching through the global header
- Locale propagation through internal navigation and server-side data requests
- Restoration of the last visited page in paginated lists
- Duplicate removal when loading additional data
- Shared error dialog for API and loading errors
- Reusable components for cards, search, pagination, and error states

## Internationalization

Translation catalogs for UI text and rating formats are stored in:

- `lib/i18n/ui.json`
- `lib/i18n/ratings.json`

Locale logic is located in:

- `lib/i18n/config.js` for locale configuration (default and supported locales)
- `lib/i18n/helpers.js` for text lookup and fallbacks
- `lib/i18n/resolver.js` for resolving the active locale per request

The current route is preserved when the language changes.

## Streaming Data

The displayed streaming providers and watch links are supplied through the TMDB API. The streaming data comes from JustWatch and is labeled "Provided by JustWatch" on movie and TV show detail pages.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- JavaScript (no TypeScript)
- Fomantic UI CSS
- Sass
- Zod for runtime validation
- Vitest for unit, component, and integration testing
- Cypress for browser-based acceptance (end-to-end), accessibility, and security testing
- Prettier and ESLint for formatting and code quality
- Husky and lint-staged for pre-commit validation

## Type Safety Strategy

Type safety is achieved through two complementary tools:

- **JSDoc** — for documenting function signatures, parameters, and return types directly in the source code. JSDoc comments provide IDE type hints and serve as inline documentation. Use `@param`, `@returns`, and `@typedef` for important or non-obvious functions.
- **Zod** — for runtime validation of external data (API responses, form inputs). Zod schemas live in `lib/schemas/` and are used in API routes and wherever data from external sources enters the application.

### When to use which

| Use case                | Tool                        |
| ----------------------- | --------------------------- |
| Component props         | JSDoc `@param`              |
| Function signatures     | JSDoc `@param` / `@returns` |
| Shared type definitions | JSDoc `@typedef`            |
| API response validation | Zod                         |
| Form input validation   | Zod                         |
| External data ingestion | Zod                         |

## Project Structure

```
app/              # Next.js App Router (routes)
components/       # React components
lib/
  services/       # TMDB API client (tmdb-api.js)
  i18n/           # Translations and locale helpers
  stores/         # React Context stores
  utils/          # Utility functions
  schemas/        # Zod validation schemas + JSDoc typedefs
styles/           # Sass styles (Fomantic UI)
docs/             # Project documentation
vitest/           # Vitest tests (unit, component, integration), fixtures, mocks, setup
cypress/          # Cypress acceptance, accessibility, and security tests, page objects, fixtures, support
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                     | Description                   |
| ---------------------------- | ----------------------------- |
| `TMDB_API_KEY`               | API key for the TMDB API      |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale (e.g. `en-US`) |

## TMDB API Key

You can create your own API key in your TMDB account:

- [TMDB Getting Started](https://developer.themoviedb.org/docs/getting-started)
- [TMDB API Settings](https://www.themoviedb.org/settings/api)

The key is only used on the server. Do not add it to client code or to the `env` option in `next.config.js`, because that would put it into the browser bundles.

## Requirements

- Node.js `v26.6.0`
- npm `11.x`

## Installation and Startup

```bash
npm install
npm run dev
```

`npm install` also initializes Husky through the `prepare` script.

## Testing

Tests are separated by runner and purpose:

- [Vitest](https://vitest.dev/) unit tests: `vitest/unit/`
- Vitest component tests (browser mode with Playwright/Chromium): `vitest/component/`
- Vitest integration tests (jsdom): `vitest/integration/`
- Cypress browser-based acceptance tests: `cypress/e2e/` for end-to-end flows and shared UI behavior, `cypress/accessibility/` for accessibility checks
- Cypress security tests: `cypress/e2e/security/` for manipulated input, security headers, redirects, and API key exposure

Cypress Page Objects live in `cypress/POM/`; Cypress-specific fixtures and support files live in `cypress/fixtures/` and `cypress/support/`. Shared domain fixtures for Vitest live in `vitest/fixtures/`.

```bash
npm test                    # All Vitest projects, single run
npm run test:unit           # Vitest unit tests only
npm run test:component      # Vitest component tests (browser mode)
npm run test:integration    # Vitest integration tests only
npm run test:coverage       # All Vitest projects with combined coverage
npm run test:e2e            # Cypress headless, incl. accessibility and security (app must run on http://localhost:3000)
npm run test:e2e:security   # Cypress security tests only (app must run on http://localhost:3000)
npm run test:e2e:a11y       # Cypress accessibility tests only (app must run on http://localhost:3000)
npm run test:e2e:open       # Cypress interactive runner
```

The accessibility tests for lists and detail pages load real TMDB data on the server, so the app needs a valid `TMDB_API_KEY`. Isolated component accessibility behavior, including TypeHeadSearch and TabGroupe keyboard and ARIA states, is covered in Vitest browser mode. Passing automated checks alone does not establish full WCAG conformance; use the [manual audit checklist](docs/testing/accessibility-audit-checklist.md) as well.

See [docs/testing.md](docs/testing.md) for the testing strategy, commands, and conventions.

## Validation Workflow

Use the validation commands to run the existing test suites as regression checks:

```bash
npm run validate          # Fast validation plus component, integration, and coverage tests
npm run validate:fast     # ESLint, Prettier check, and Vitest unit tests
npm run validate:full     # Vitest component tests, integration tests, and coverage
npm run validate:e2e      # Production build and Cypress end-to-end tests
npm run validate:a11y     # Production build and Cypress accessibility tests
```

- Run `npm run validate:fast` for quick feedback before committing.
- Run `npm run validate` before pushing a change or opening a pull request. It does not run a production build or Cypress. Run `npm run build` separately when production-build validation is needed.
- Run `npm run validate:e2e` or `npm run validate:a11y` when browser behavior, routing, security, or accessibility is affected.
- `validate:e2e` and `validate:a11y` build the app but do not start a server. Cypress still requires a separately running app on `http://localhost:3000` and `TMDB_API_KEY` where specs use live TMDB data. For production testing, build, start the resulting app with `npm run start`, and run the relevant `test:e2e` command in a second terminal.
- `bash scripts/validate.sh` is an alternative check sequence that includes a production build but no explicit coverage run; it is not equivalent to `npm run validate`.

## Pre-Commit Hook

Husky runs the following command from `.husky/pre-commit` before every commit:

```sh
npx lint-staged && npm run validate:fast
```

1. `lint-staged` runs `prettier --write` on staged JavaScript, JSX, Sass, CSS, Markdown, and JSON files using the configuration in `package.json`.
2. Only if lint-staged succeeds, `validate:fast` runs ESLint, the project-wide Prettier check, and the Vitest unit tests.
3. A failure in either command prevents the commit.

Formatting applies to matching staged files, whereas `validate:fast` checks the project, not just the staged changes. Running `npm run validate:fast` directly does not run lint-staged or automatically format files.

The hook intentionally excludes component, integration, Cypress, security, and accessibility tests because they are slower or require a running application. Run `npm run validate` and the relevant browser checks before a pull request.

## Code Quality

Linting and formatting run separately from the tests:

```bash
npm run lint            # ESLint, fails on any warning (--max-warnings=0)
npm run format          # Prettier, rewrites files
npm run format:check    # Prettier, check only
npm run check           # lint + format:check + all Vitest tests
```

`npm run check` does not include Cypress, a production build, or an explicit coverage run. Use the validation workflow above for broader checks.

If a lint rule has to be suppressed, use a targeted `eslint-disable-next-line` comment with a short reason, for example for the plain `<img>` in the typeahead thumbnails and in the `next/image` test mock.

## Production Build

```bash
npm run build
npm run start
```

## Documentation

- [Testing Strategy](docs/testing.md) — testing strategy, commands, and test-level guidance
- [Security Tests](docs/testing/security-tests.md) — security tests, test plan, and run instructions
- [Accessibility Test Plan](cypress/accessibility/accessibility-testplan.md) — automated accessibility coverage, data notes, and run instructions
- [Manual Accessibility Audit Checklist](docs/testing/accessibility-audit-checklist.md) — manual checks and audit records
