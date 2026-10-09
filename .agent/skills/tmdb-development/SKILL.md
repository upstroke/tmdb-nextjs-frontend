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
- Testing (Vitest + Cypress), see the `tmdb-testing` skill
- Code quality (ESLint, Prettier)

## Rules

- Preserve the separation between `app/`, `components/`, and `lib/`.
- Reuse the TMDB service layer `lib/services/tmdb-api.js`; do not call TMDB directly from routes or components.
- Validate external data with the Zod schemas from `lib/schemas/`.
- Keep the locale in internal links and in TMDB requests.
- Take UI texts from `lib/i18n/ui.json` through `getLocaleText`; do not hard-code them.
- Keep fallbacks for missing data and remove duplicates when loading more paginated data.
- Show API and loading errors with the shared error dialog.
- Keep the `TMDB_API_KEY` on the server.

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

## Project Structure

```
tmdb-nextjs-frontend/
├── app/                    # Next.js App Router (routes, app/api, app/[locale])
├── components/             # React components
├── lib/
│   ├── services/           # TMDB API client (tmdb-api.js)
│   ├── i18n/               # Translations and locale helpers
│   ├── stores/             # React Context stores
│   ├── utils/              # Utility functions
│   └── schemas/            # Zod schemas + JSDoc typedefs
├── styles/                 # Sass styles (Fomantic UI)
├── vitest/                 # Vitest tests, fixtures, mocks, setup
├── cypress/                # Cypress tests, page objects, fixtures, support
└── docs/                   # Documentation
```

## Scripts

```bash
npm run dev            # Development
npm run build          # Build
npm run start          # Start the production build
npm run lint           # Lint
npm run format         # Format
npm test               # All Vitest tests
npm run test:unit
npm run test:integration
npm run test:component
npm run test:e2e       # Cypress (app must run on http://localhost:3000)
```

## Code Style

- **JavaScript** with JSDoc for contracts
- **Components**: Functional components with hooks
- **Styling**: Fomantic UI and Sass
- **Testing**: Testing Library queries
- **Naming**: PascalCase for components, camelCase for functions

## Documentation

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
