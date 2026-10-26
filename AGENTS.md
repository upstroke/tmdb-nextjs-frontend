# Agent skills

This repository contains task-focused Agent Skills in `.agent/skills/`.
Select and read the applicable `SKILL.md` before acting:

- `tmdb-development` — features, fixes, refactors, components, routes, and styling
- `tmdb-testing` — unit, integration, component, and Cypress acceptance tests
- `tmdb-accessibility` — keyboard, focus, semantics, ARIA, and accessibility audits
- `tmdb-security` — input validation, API key handling, and Cypress security tests
- `tmdb-ai-collaboration` — planning, review, validation, and collaboration boundaries

For work that spans several areas, read each applicable skill. Begin with
`tmdb-ai-collaboration` when the request is ambiguous, broad, or asks for an
implementation plan.

# Project constraints

- Use Next.js 16 with the App Router and React 19.
- Use JavaScript, not TypeScript.
- Preserve the existing separation between `app/`, `components/`, and `lib/`.
- Use Fomantic UI CSS and Sass consistently with the existing codebase.
- Use JSDoc for function and component contracts.
- Use Zod for runtime validation of external data, API responses, and form input.

# Internationalization

- Preserve locale propagation through internal navigation and server-side data requests.
- Preserve the current route when changing languages.
- Reuse the existing locale modules:
  - `lib/i18n/helpers.js`
  - `lib/i18n/config.js`
  - `lib/i18n/resolver.js`
- Store UI translations and rating formats in:
  - `lib/i18n/ui.json`
  - `lib/i18n/ratings.json`

# Data handling

- Treat TMDB API data as incomplete or unreliable until validated.
- Reuse the TMDB service layer in `lib/services/tmdb-api.js`.
- Use Zod schemas from `lib/schemas/` when external data enters the application.
- Preserve existing fallback behavior for missing data.
- Remove duplicates when loading additional paginated data.
- Preserve locale information in TMDB requests.

# Security

- Keep `TMDB_API_KEY` on the server. Add it only in `lib/services/tmdb-api.js`.
- Treat query parameters, route parameters, and `sessionStorage` values as untrusted. Validate them with Zod and give numbers an upper limit (`page` max 500).
- Manipulated input must give a `400`, an empty result, or a fallback. It must never give a `5xx`.
- Read `.agent/skills/tmdb-security/SKILL.md` and `docs/testing/security-tests.md` before changing API routes or schemas.

# API and browser capabilities

- Use the project's Next.js API mechanisms for application/API work where they fit the existing architecture.
- Use browser APIs directly when the requirement concerns browser capabilities, such as storage, media queries, viewport state, URL state, events, or other client-side platform behavior.
- Do not replace browser APIs with server-side code when the behavior must run in the browser.
- Do not introduce a new data-fetching or API pattern before inspecting the existing implementation and project conventions.
- Keep browser-only APIs inside client-side code and guard them against server-side rendering.
- Check the relevant tests and accessibility requirements after changing API or browser behavior.

# Locally available CLI tools

Prefer these tools when they are available:

- `rg` (`ripgrep`) for fast text searches
- `fd` (`fd-find`) for fast file and directory searches
- `fzf` for interactive selection and filtering
- `bat` for readable Git diffs
- `delta` for readable Git diffs
- `sd` for targeted text changes

# Test strategy

Choose the test tool and environment by scope:

| Level         | Tool                                         | Location                                                      | Purpose                                                                                                    |
| ------------- | -------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Unit          | Vitest (jsdom)                               | `vitest/unit/`                                                | Isolated logic, schemas, utilities, services, stores, and route behavior with controlled dependencies      |
| Integration   | Vitest (jsdom) + Testing Library             | `vitest/integration/`                                         | Real route/service/schema or page integration, with the external TMDB network mocked                       |
| Component     | Vitest browser mode (Playwright, Chromium)   | `vitest/component/`                                           | Isolated component rendering, props, interaction, keyboard, focus, and ARIA states                         |
| e2e           | Cypress                                      | `cypress/e2e/`                                                | Full-application user flows such as search, detail pages, and navigation                                   |
| Accessibility | Vitest browser mode; Cypress + `cypress-axe` | `vitest/component/`, `cypress/accessibility/`, `cypress/e2e/` | Component-level semantics and interaction; full-page axe, keyboard, focus, visibility, and contrast checks |
| Security      | Cypress                                      | `cypress/e2e/security/`                                       | Manipulated input, XSS, API key exposure, list and search API routes                                       |

Rules:

- Do not write component tests in jsdom. jsdom has no layout and cannot establish color contrast or real browser focus behavior. Use Vitest browser mode in `vitest/component/` instead.
- Keep `vitest/integration/` limited to true integration tests. Mock the external TMDB network with `globalThis.fetch`, not the internal modules whose integration is being checked. Assert on the rendered DOM (roles, text), not props, for page or section scenarios; assert meaningful response status and payloads for API scenarios.
- Test keyboard interaction, focus management, and ARIA states of a single component in Vitest browser mode, including TypeHeadSearch and TabGroupe. Use Cypress when the behavior spans pages or needs the full app. See [Covered in Vitest](cypress/accessibility/accessibility-testplan.md#covered-in-vitest).
- Use the project wrapper `cy.checkPageA11y()` on pages and after relevant interactions in accessibility scenarios. Inspect its setup before using direct axe calls.
- Do not add tests for purely presentational components. Integration or Cypress tests cover them.
- Check actual dialog visibility, focus, and Escape behavior in the existing Cypress scenarios. jsdom integration tests may stub `showModal` and assert message content; this jsdom limitation does not apply to Vitest browser mode.
- In Cypress specs, do not use `Cypress.env()`. `allowCypressEnv` is `false`, so use `cy.env()`.
- Keep Cypress Page Objects in `cypress/POM/`; do not import them into Vitest tests.
- Unit and integration tests control external network responses. Cypress may use live TMDB data when required by the relevant test plan; document the API-key requirement and external-data limitations.
- Automated checks do not establish full WCAG conformance. Use the [manual audit checklist](docs/testing/accessibility-audit-checklist.md) as well.
- When you fix, change, add, or delete a test, update its test plan and the affected docs in the same change. See `.agent/skills/tmdb-testing/SKILL.md`.
- Use English for explanatory documentation, test names, and comments; preserve identifiers and intentionally localized test data.

## Planning guardrails

For every non-trivial implementation or refactoring task, read and apply
`.cline/plan-quality.md` before producing a plan.

A plan is not complete unless it distinguishes verified repository facts from
assumptions, identifies the lifetime of any cached data, and describes the
exact request and UI behavior for each affected user flow.

# Technical debt backlog

The following known technical debt items should be considered when planning related changes. They are not urgent defects, but they may affect scalability, resilience, memory usage, or data-quality guarantees.

## High priority

### TD-001: Reduce redundant trending requests while preserving card certifications - ✅ implemented

- Status: Implemented on `feature/TD-001-Reduce-redundant-trending`; pending validation and merge.
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

### TD-002: Bound in-memory caches — resolved as request-scoped caching - ✅ implemented

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

- Status: Implemented on `feature/TD-004-zod-validation-results`; pending validation and merge.
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

# Validation

Use the validation commands to run the existing test suites as regression checks.

- Use `npm run validate:fast` for quick feedback before committing. It runs ESLint, the Prettier check, and Vitest unit tests.
- Use `npm run validate` before pushing a change or opening a pull request. It runs lint, the formatting check, unit tests, component tests, integration tests, and combined coverage, but no production build, Cypress, or dependency audit.
- Use `npm run validate:all` for complete automated validation. It runs the Vitest validation workflow, a production build, all Cypress specs including security and accessibility, and a production dependency audit.
- `validate` and `validate:all` use `scripts/run-checks.mjs` for friendly progress output. They run the same underlying npm commands and retain fail-fast behavior.
- Run a focused check with `npm run validate -- component`, for example. Available Vitest selectors are `lint`, `format`, `unit`, `component`, `integration`, and `coverage`.
- Run a focused managed browser check with `npm run validate:all -- security`, for example. Available full-validation selectors are `e2e`, `security`, `a11y`, and `audit`.
- The full-validation dependency audit runs `npm audit --omit=dev --audit-level=high`. It checks production dependencies only and fails on high or critical advisories. It does not modify the lockfile or installed packages.
- Stop any server on port 3000 first. Managed commands reject an occupied port rather than reuse or kill another process. They check again after building. Do not start another server during the run.
- `npm run test:e2e:open` builds and starts production before opening Cypress and keeps the server until Cypress exits.
- Pass Cypress arguments after `--`, for example `npm run test:e2e -- --spec "cypress/e2e/security/routing.cy.js"`. Do not override the managed baseUrl of http://localhost:3000.
- The accessibility suite needs a valid `TMDB_API_KEY` for specs that use live TMDB data.
- `bash scripts/validate.sh` includes a production build but no explicit coverage run. It is not equivalent to `npm run validate`; choose checks according to the task scope.
- See `docs/testing/acceptance-tests.md` for the production-runner validation checklist.

The pre-commit hook runs `npx lint-staged && npm run validate:fast`. It intentionally excludes component, integration, Cypress, security, accessibility, and dependency-audit checks because they are slower, require application startup, or depend on external advisory data.

Additional commands:

- Use `npm run lint` for ESLint. It fails on any warning (`--max-warnings=0`), so fix warnings instead of leaving them.
- Use `npm run format:check` to check Prettier formatting. `npm run format` rewrites files, so run it only with the user’s approval.
- Suppress a lint rule only with a targeted `eslint-disable-next-line` comment and a short reason. Do not disable rules for a whole file.
- Use `npm test` for all Vitest projects in a single run.
- Use `npx vitest` for Vitest watch mode.
- Use `npm run test:unit`, `npm run test:integration`, or `npm run test:component` for focused Vitest validation.
- Use `npm run test:coverage` for combined Vitest coverage; the enforced global threshold is 80% statements. Cypress does not contribute to this report.
- Use `npm run build` for production-build validation.
- Treat Cypress as a separate validation step; it is not included in `npm run validate`.
- Use `npm audit --omit=dev` to review production dependency advisories without enforcing a severity threshold.
- Do not run `npm audit fix --force` without a reviewed dependency-upgrade plan; it can introduce breaking major-version changes.

Do not edit files, run destructive commands, change dependencies, push commits,
or create pull requests without the user’s explicit approval.
