# TMDB Next.js Frontend

A Next.js frontend for browsing movies and TV shows from the TMDB API.

The application provides a media catalog with trending sections, paginated lists, detail pages, localized typeahead search, and fallback mechanisms for missing data.

![TMDB Next.js Frontend – Homepage](docs/images/homepage.png)

## Project goal

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
- Localized interface and language switching through the global header
- Locale propagation through internal navigation and server-side data requests
- Restoration of the last visited page in paginated lists
- Duplicate removal when loading additional data
- Shared error dialog for API and loading errors
- Reusable components for cards, search, pagination, and error states

## Tech stack

- Next.js 16 (App Router)
- React 19
- JavaScript (no TypeScript)
- Fomantic UI CSS and Sass
- Zod for runtime validation
- Vitest for unit, component, and integration testing
- Cypress for browser-based acceptance, accessibility, and security testing
- Prettier, ESLint, Husky, and lint-staged for code quality

## Requirements

- Node.js `v26.6.0`
- npm `11.x`

## Installation and startup

```bash
npm install
npm run dev
```

`npm install` also initializes Husky through the `prepare` script.

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `TMDB_API_KEY` | API key for the TMDB API |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale (e.g. `en-US`) |

The TMDB API key is used only on the server. See [TMDB integration](docs/architecture/tmdb-integration.md).

## Project structure

```text
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
vitest/           # Vitest tests, fixtures, mocks, and setup
cypress/          # Cypress acceptance, accessibility, and security tests
.agents/          # Tool-neutral Agent Skills for AI-assisted development
```

## Development workflow

`AGENTS.md` is the central entry point for AI coding assistants. It directs agents to the task-specific skills in `.agents/skills/`, project constraints, testing rules, security requirements, review guards, and validation commands.

AI-generated code is reviewed like external code. The project mitigates AI-related risks through a dedicated TMDB service layer, server-side API integration, Zod-based runtime validation, automated Vitest and Cypress tests, accessibility checks, security tests, and review-oriented Git workflows.

Known technical-debt items are tracked in [`docs/backlog/technical-debt.md`](docs/backlog/technical-debt.md).

## Testing

Tests are separated by runner and purpose:

- Vitest unit tests: `vitest/unit/`
- Vitest integration tests: `vitest/integration/`
- Vitest component tests: `vitest/component/`
- Cypress acceptance tests: `cypress/e2e/`
- Cypress accessibility tests: `cypress/accessibility/`
- Cypress security tests: `cypress/e2e/security/`

Common commands:

```bash
npm test                    # All Vitest projects, single run
npm run test:unit           # Vitest unit tests only
npm run test:component      # Vitest component tests (browser mode)
npm run test:integration    # Vitest integration tests only
npm run test:coverage       # All Vitest projects with combined coverage
npm run test:e2e            # Managed production Cypress run
```

See [Testing](docs/testing.md) for the complete testing strategy, commands, coverage rules, Cypress lifecycle, and test-level guidance.

## Validation

```bash
npm run validate:fast       # Lint, format check, and unit tests
npm run validate            # Fast checks plus component, integration, and coverage
npm run validate:all        # Complete automated validation
```

See [Testing](docs/testing.md) for the complete validation workflow, focused checks, Cypress requirements, and production-build guidance.

## Production build

```bash
npm run build
npm run start
```

## Documentation

### Architecture and development

- [TMDB integration](docs/architecture/tmdb-integration.md) — server-side TMDB integration, data flow, and API-key handling
- [Internationalization](docs/development/internationalization.md) — locale modules, translation catalogs, and language switching
- [Type safety strategy](docs/development/type-safety.md) — JSDoc and Zod responsibilities
- [Streaming data](docs/development/streaming-data.md) — TMDB and JustWatch streaming data

### Testing

- [Testing strategy](docs/testing.md) — testing strategy, commands, coverage, and validation
- [Unit tests](docs/testing/unit-tests.md)
- [Integration tests](docs/testing/integration-tests.md)
- [Component tests](docs/testing/component-tests.md)
- [Acceptance tests](docs/testing/acceptance-tests.md)
- [Common test rules](docs/testing/common-rules.md)
- [Page objects](docs/testing/page-objects.md)
- [Security tests](docs/testing/security-tests.md)
- [Manual accessibility audit checklist](docs/testing/accessibility-audit-checklist.md)
- [Accessibility test plan](cypress/accessibility/accessibility-testplan.md)
