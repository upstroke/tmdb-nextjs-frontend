# TMDB Next.js Frontend

A Next.js frontend for browsing movies and TV shows from the TMDB API.

The application provides a media catalog with trending sections, paginated lists, detail pages, localized typeahead search, and fallback mechanisms for missing data.

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

- `lib/i18n/helpers.js` for supported locales and fallbacks
- `lib/i18n/config.js` for locale configuration
- `lib/i18n/resolver.js` for resolving the active locale per request

The current route is preserved when the language changes.

## Streaming Data

The displayed streaming providers and watch links are supplied through the TMDB API. The streaming data comes from JustWatch and is labeled "Provided by JustWatch" on movie and TV show detail pages.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- JavaScript (no TypeScript)
- Fomantic UI CSS
- Sass
- Zod for runtime validation
- Vitest for unit testing
- Prettier and ESLint for formatting and code quality

## Type Safety Strategy

This project uses **JavaScript without TypeScript**. Type safety is achieved through two complementary tools:

- **JSDoc** — for documenting function signatures, parameters, and return types directly in the source code. JSDoc comments provide IDE type hints and serve as inline documentation. Use `@param`, `@returns`, and `@typedef` for important or non-obvious functions.
- **Zod** — for runtime validation of external data (API responses, form inputs). Zod schemas live in `lib/schemas/` and are used in API routes and wherever data from external sources enters the application.

### Why not TypeScript?

TypeScript is a great tool, but it comes with trade-offs that did not fit this project:

- **No build complexity** — Plain JavaScript with JSDoc requires no transpilation step, no `tsconfig.json`, and no type-stripping. The code runs as-is in Node.js and the browser.
- **Lower barrier to entry** — Contributors do not need to know TypeScript syntax. JSDoc annotations are optional and additive — you can document as much or as little as makes sense.
- **TypeScript only checks at compile time** — It gives you zero protection at runtime. A TMDB API response that does not match your types will silently break your app. Zod catches this at the boundary where the data actually enters.
- **JSDoc + Zod covers the real risks** — Static analysis via JSDoc (read by VS Code and ESLint) handles the developer experience. Zod handles the runtime risk. Together they cover what TypeScript covers, plus the runtime layer TypeScript cannot.
- **Easier refactoring in early stages** — Without a type system enforcing every interface, iterating on data shapes is faster. Zod schemas serve as the single source of truth for both validation and documentation.

### When to use which

| Use case                | Tool                        |
|-------------------------|-----------------------------|
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
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                     | Description                   |
|------------------------------|-------------------------------|
| `TMDB_API_KEY`               | API key for the TMDB API      |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale (e.g. `en-US`) |

## TMDB API Key

You can create your own API key in your TMDB account:

- [TMDB API Settings](https://www.themoviedb.org/settings/api)
- [TMDB Getting Started](https://developer.themoviedb.org/docs/getting-started)

## Requirements

- Node.js `v26.6.0`
- npm `11.x`

## Installation and Startup

```bash
npm install
npm run dev
```

## Testing

Unit tests use [Vitest](https://vitest.dev/). Test files live next to the module they test (`*.test.js`).

```bash
npm test            # single run
npm run test:watch  # watch mode
```

Tests cover:
- Zod schema validation (`lib/schemas/tmdb.test.js`)
- API mapper logic with mocked fetch (`lib/services/tmdb-api.test.js`)
- `TMDBError` thrown on failed requests

The testing overview, commands, and detailed guidance are documented in `docs/testing.md`.

## Production Build

```bash
npm run build
npm run start
```

## Documentation

- `docs/testing.md` — testing strategy, commands, and test-level guidance
- `docs/ai-prompts.md` — AI-assisted development rules
