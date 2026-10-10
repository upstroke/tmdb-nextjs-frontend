---
name: tmdb-development
description: Implement features, fixes, refactors, components, routes, and styling in the TMDB Next.js frontend following the project structure, i18n, validation, and code style rules.
version: 0.1.0
---

# TMDB Development Skill

## Purpose

This skill enables the AI agent to assist with general development tasks for the TMDB Next.js frontend. It covers coding standards, project structure, and best practices.

## Scope

- Next.js 16 + App Router
- React 19
- JavaScript (no TypeScript), JSDoc for contracts
- Fomantic UI CSS + Sass
- Zod for runtime validation
- Internationalization (`lib/i18n/`)
- Code quality (ESLint, Prettier)

For tests, see the `tmdb-testing` skill.

## Rules

- Preserve the separation between `app/`, `components/`, and `lib/`.
- Reuse the TMDB service layer `lib/services/tmdb-api.js`; do not call TMDB directly from routes or components.
- Validate external data with the Zod schemas from `lib/schemas/`.
- Keep the locale in internal links and in TMDB requests.
- Take UI texts from `lib/i18n/ui.json` through `getLocaleText`; do not hard-code them.
- Keep fallbacks for missing data and remove duplicates when loading more paginated data.
- Show API and loading errors with the shared error dialog.
- Keep the `TMDB_API_KEY` on the server.
- Do not log raw error objects from TMDB requests without checking that they contain no key or URL with `api_key=`.

## Capabilities

### 1. Write API Routes

Example from `app/api/[locale]/search/route.js`: validate the locale and query with Zod, read the key from the environment, call the service layer, and return localized error messages.

```js
export async function GET(request, { params }) {
  const localeParsed = LocaleParamSchema.safeParse(await params);
  if (!localeParsed.success) {
    return NextResponse.json(
      { movies: [], tvShows: [], results: [], error: 'Invalid locale.' },
      { status: 400 }
    );
  }
  const { locale } = localeParsed.data;
  const { messages } = getLocaleText(locale);

  // ... validate the query, check TMDB_API_KEY

  try {
    const api = createTmdbApi(fetch, apiKey, locale);
    const searchResult = await api.searchMedia(query);
    // ... map and return the result
  } catch (e) {
    console.error('Search failed:', e);
    return NextResponse.json(
      { movies: [], tvShows: [], results: [], error: messages.searchError },
      { status: 500 }
    );
  }
}
```

### 2. Write Components

Components live in `components/`, are written in JavaScript (`.jsx`), and use JSDoc for props. Styling uses Fomantic UI classes and Sass from `styles/`. Look at an existing component first and follow its pattern.

```jsx
/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.imageUrl]
 */
export default function Example({ title, imageUrl }) {
  return <article>{/* ... */}</article>;
}
```

### 3. Write Utility Functions

Utility functions live in `lib/utils/`. Document parameters and return types with JSDoc (`@param`, `@returns`, `@typedef`).

### 4. Write Tests

See the `tmdb-testing` skill and [`docs/testing.md`](../../../docs/testing.md).

## Code Style

- **JavaScript** with JSDoc for contracts
- **Components**: Functional components with hooks
- **Styling**: Fomantic UI and Sass
- **Naming**: PascalCase for components, camelCase for functions

## Documentation

The project structure and the npm scripts are described only in [`README.md`](../../../README.md). Do not copy them into this skill.

- **Testing Strategy**: [`docs/testing.md`](../../../docs/testing.md)
- **README**: [`README.md`](../../../README.md)

## When to Use

Use this skill when:

- Creating new components
- Adding new pages or routes
- Writing utility functions
- Fixing bugs
- Refactoring code
- Adding JSDoc typedefs or Zod schemas
