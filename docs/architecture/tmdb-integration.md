# TMDB integration

The application integrates the third-party [TMDB REST API](https://developer.themoviedb.org/docs/getting-started) on the server.

TMDB requests are handled by the dedicated service layer in `lib/services/tmdb-api.js`. Server Components and server-side data requests use this client to fetch movie, TV show, search, and streaming-provider data. The TMDB API key is read from server-side environment variables and is never exposed to the browser.

This is a server-side third-party REST API integration rather than a direct browser-to-TMDB integration. Next.js acts as the backend layer for the frontend: it performs TMDB requests, validates external responses with Zod, applies locale-specific parameters, and passes prepared data to the React UI.

## Data flow

```text
Browser / React UI
        |
        v
Next.js server (Server Components / server-side data requests)
        |
        v
TMDB REST API
        |
        v
Next.js server
        |
        v
Browser / React UI
```

## Characteristics

- **Server-side REST API integration:** TMDB is consumed over HTTPS using its REST endpoints and JSON responses.
- **Third-party API integration:** TMDB is an external service and is not part of the application backend.
- **Dedicated service layer:** TMDB-specific orchestration is centralized in `lib/services/tmdb-api.js`; HTTP transport, normalization, and mapping live in dedicated modules under `lib/services/tmdb/`.
- **Backend-for-Frontend (BFF) characteristics:** Next.js prepares and supplies external data specifically for this web frontend.
- **Secure credential handling:** `TMDB_API_KEY` remains on the server and is excluded from client bundles.
- **Runtime validation:** External TMDB responses are validated with Zod schemas in `lib/schemas/`.

## Service layer structure

The TMDB integration is split into focused modules:

- `lib/services/tmdb-api.js` exposes the public `createTmdbApi()` client and orchestrates TMDB operations.
- `lib/services/tmdb/tmdb-http.js` handles the HTTP transport, API-key handling, locale parameters, and resilience behavior.
- `lib/services/tmdb/normalizers.js` normalizes raw TMDB values.
- `lib/services/tmdb/mappers.js` maps normalized TMDB data to the UI data models.
- `lib/schemas/tmdb.js` contains the Zod schemas used for runtime validation.

`createTmdbApi()` remains the public entry point for Server Components, API routes, and server-side data requests.

## API key

You can create your own API key in your TMDB account:

- [TMDB Getting Started](https://developer.themoviedb.org/docs/getting-started)
- [TMDB API Settings](https://www.themoviedb.org/settings/api)

The key is only used on the server. Do not add it to client code or to the `env` option in `next.config.js`, because that would put it into the browser bundles.
