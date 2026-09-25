# TMDB Next.js Frontend

A Next.js frontend for browsing movies and TV shows from the TMDB API.

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
npm test          # single run
npm run test:watch  # watch mode
```

Tests cover:
- Zod schema validation (`lib/schemas/tmdb.test.js`)
- API mapper logic with mocked fetch (`lib/services/tmdb-api.test.js`)
- `TMDBError` thrown on failed requests

## Production Build

```bash
npm run build
npm run start
```
