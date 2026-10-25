# Trending cache restoration regression test plan

## Scope

Companion to TP-PL-001 in `paged-list-integration-test-plan.md`.
Existing TC-PL-01 through TC-PL-14 and their assertions remain unchanged.
New tests live in `trending-cache-restore.test.jsx`; IDs continue at TC-PL-15.

Real MovieTrendingList/TvTrendingList, TrendingCacheProvider, PagedList,
restorePagedList, API routes, TMDB service and schemas are wired together.
Only external fetch, next/link, next/image and browser platform gaps are mocked.
Initial normalized data is built through the real TMDB service. A harness
unmounts/remounts the list while keeping the real provider alive; this is not
an assertion about real Next.js navigation, which remains covered by Cypress
NAV-12.

## Preserved behavior and corrected contract

- A server-backed mount retains session restoration and writes for its lifetime,
  even when load more subsequently populates the shared cache.
- A cached mount bypasses session restoration and does not write dedicated
  page numbers into the server-backed session restore entry.
- `initialData.page` passed to PagedList is the last loaded feed page, not the
  next request. Home-derived cache starts at zero; the first click requests 1.
- After a successful append, onCardsAppended receives new cards, loaded page,
  and all displayed cards. Wrappers cache the complete list, including server
  and session-restored cards, and update the per-media feed counter.
- Cached cards are not merged with unrelated server fallback cards on entry.
- No-new-card termination, timeout, error dialog and scroll behavior are retained.

## Cases

Every case runs for both movies and TV shows.

| ID | Scenario | Expected result |
| --- | --- | --- |
| TC-PL-15 | Direct server-backed mount, load pages 2 and 3, leave and return | Session writes remain 2 then 3; all cards survive remount; no duplicate restoration requests. |
| TC-PL-16 | Seed one Home-style cached card with an existing session entry, open and load twice, remount and continue | Initially only the cached card appears; no restore fetch; requests are 1, 2, then 3 after remount; deduplicated cards stay in order; session entry is untouched. |
| TC-PL-17 | Server mount with stored page 2, restore, append page 3, remount | Restored cards are included in cache; all cards remain; only page 2 and page 3 were fetched. |
| TC-PL-18 | Server-backed mount, page 2 contains only duplicates | Cards stay unchanged; button disabled; session entry is 1. |

## Lifetime and limitations

The shared cache survives client navigation while its provider remains mounted.
The existing provider resets it on locale changes; a full reload creates a fresh
provider and may use the existing session page restoration. This change does
not introduce cross-locale storage or alter session key semantics.

Wrapper source mode is fixed per mount. A subsequent mount chooses again from
the then-current shared cache. No card-count-based page inference is used.

These tests do not establish actual browser focus, native dialog behavior,
Next.js routing, or live TMDB correctness. Cached end-of-feed metadata is not
expanded in this change; the existing wrapper hasMore behavior is retained.

## Execution and required regression checks

```bash
npm run test:integration -- vitest/integration/pagedlist
npm run validate:fast
npm run test:coverage
npm run test:e2e -- --spec "cypress/e2e/navigation/navigation.cy.js"
```

Tests, lint and formatting must be run locally; no execution result is implied
by the presence of these regression tests.
