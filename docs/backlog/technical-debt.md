# Technical debt backlog

The following known technical debt items should be considered when planning related changes. They are not urgent defects, but they may affect scalability, resilience, memory usage, or data-quality guarantees.

## High priority

### TD-001: Reduce redundant trending requests while preserving card certifications - ✅ implemented

- Status: Implemented and merged.
- The home page loads `/trending/all/day?page=1`; its cards are split dynamically by `mediaType` into movie and TV cards for reuse on the Movies and TV Shows pages.
- A locale-scoped client-side cache stores already known movie and TV cards separately. It survives client-side navigation between Home, Movies, and TV Shows.
- Movies and TV Shows render cached cards when available and do not make an initial dedicated trending request in that case. When the cache is empty, the existing server-side first-page fallback is used.
- Home “Load more” adds newly loaded Trending All cards to the shared cache, separated by media type. These cards improve display continuity and deduplication, but do not advance the dedicated Movies or TV Shows feed page counters.
- The dedicated Movies or TV Shows trending feed is requested only after the user clicks “Load more”.
- The next dedicated feed page is tracked separately for movies and TV shows. It is always the page after the last successfully requested page: initially page 1, then page 2, page 3, and so on.
- Cached card counts are not used to infer API pagination. This keeps the behavior independent of the number of results TMDB returns per page and prevents a dedicated feed page from being skipped.
- On “Load more”, the relevant dedicated feed response is deduplicated against the cached cards using `${mediaType}-${id}`, and only new cards are appended.
- Existing cards and their certifications remain available while navigating between Home, Movies, and TV Shows; certifications are loaded only for cards not already present in the cache.
- Certification badges remain visible on every list card; certifications are neither removed nor deferred in this task.
- Trending All is split dynamically by `mediaType`; the implementation does not assume it always contains exactly 10 movies and 10 TV shows.
- A full browser reload clears the client-side cache. The existing `PagedList` sessionStorage restoration may still restore previously loaded pages after a reload; this behavior is intentionally retained for now.
- A custom homepage mix of separate movie and TV trending feeds is out of scope for this task.

### TD-002: Bound in-memory caches - resolved as request-scoped caching - ✅ implemented

- Status: Completed.
- `certificationCache` and `watchProvidersCache` are intentionally request-scoped.
- Each call to `createTmdbApi()` creates a new service instance for one request or render, so the caches do not persist across requests or server processes.
- Within a request, the caches prevent duplicate TMDB requests for the same media item, particularly when enriching list cards or loading a featured item.
- An LRU cache or TTL is unnecessary unless a future change intentionally introduces a process-wide cache shared across requests.
- If a shared cache is introduced later, it must have an explicit maximum size and expiration strategy.

## Medium priority

### TD-003: Add timeout, retry, and resilience handling to TMDB requests - ✅ implemented

- Status: Completed.
- TMDB requests use a 10-second `AbortSignal.timeout()`.
- Transient network failures, timeout failures, invalid JSON responses, and HTTP 500, 502, 503, and 504 responses are retried up to two times.
- Retry delays are 100 ms and 200 ms, giving a maximum of three attempts per request.
- HTTP 4xx responses and other non-retryable client errors are not retried.
- HTTP failures remain `TMDBError` with the TMDB status code.
- Network, timeout, and malformed-response failures are `TMDBNetworkError` and preserve the underlying error as `cause`.
- Certification and watch-provider enrichment retain their existing graceful fallbacks; list, detail, and featured-content failures continue to propagate to route or page error handling.
- Focused resilience tests live in `vitest/unit/services/tmdb-api-resilience.test.js`.

### TD-004: Normalize invalid TMDB fields while preserving partial UI - ✅ implemented

- Status: Implemented and merged.
- Missing, `null`, empty-string, and zero values continue to use the existing localized N/A, placeholder, and hidden-section fallbacks. They do not trigger the error dialog.
- Invalid field types are normalized to safe values before Zod validation. For example, invalid strings become empty strings, invalid ratings become `0`, and invalid arrays become empty arrays.
- `mapDetails()`, `getList()`, `searchMedia()`, `getFeaturedToday()`, and `getTVSeasonDetails()` no longer cast unvalidated raw TMDB objects to validated types.
- These functions return `null` only when the normalized object still fails its Zod schema; this indicates that the core object is not safely renderable.
- List and search API routes return their existing localized error response with empty cards or results and HTTP 502 when the service returns `null`.
- The home page shows its existing content-load error when the trending list is unusable. It continues to render without the featured hero when featured details are unusable.
- Movie and TV show detail pages show their existing `DialogMessage` when the core detail object is unusable.
- An invalid individual TV season remains non-fatal: the TV show page renders that season with an empty episode list.
- The error dialog remains reserved for network, timeout, HTTP, and unusable core-object failures; it is not used for individual missing or invalid optional fields.

## Low priority

### TD-005: Split `getFeaturedToday()` into smaller functions

- The function combines trending selection, detail loading, certification loading, provider loading, mapping, validation, and fallback creation.
- Extract focused helpers such as `pickFeaturedItem()`, `loadFeaturedDetails()`, and `buildFeaturedItem()`.

### TD-006: Make region fallback explicit

- The current region fallback derives `DE` when no region can be derived from the locale.
- This may produce incorrect certifications or watch-provider data for locales such as `en`.
- Treat region as an explicit parameter with documented fallback behavior.

### TD-007: Remove redundant coverage tooling - ✅ implemented

- `@vitest/coverage-v8` was removed because the Vitest configuration uses the Istanbul coverage provider.
- `@vitest/coverage-istanbul` and `vite-plugin-istanbul` remain required for the current coverage workflow.
