# TMDB review guards

Apply these guards before implementing a non-trivial change and again before
reviewing or approving it. A guard is satisfied when the relevant facts are
verified, open questions are named, or the item is explicitly out of scope.

## 1. Architecture guard

- Identify where the relevant state lives: component, page, client cache, server cache, service, route, or external source.
- Identify the lifetime of cached or stored data: render, request, client navigation, session, or persistent storage.
- Identify which components or modules may read and change the state.
- Do not introduce a new global, shared, or process-wide cache without an explicit size and expiration strategy.
- Preserve the separation between `app/`, `components/`, and `lib/`.

## 2. Request guard

- List every network request introduced or retained by the change.
- Map each request to the user flow that requires it.
- Identify when each request runs: initial render, navigation, user interaction, retry, or background refresh.
- Prevent duplicate requests for the same data within the same user flow unless duplication is intentional and documented.
- Do not infer pagination, completeness, or availability from cached item counts.

## 3. Deduplication guard

- Name the exact deduplication key, for example `${mediaType}-${id}`.
- Identify which collections or caches use that key.
- Verify that new items are compared against all relevant existing collections before appending.
- Verify that deduplication does not remove or hide existing visible data.
- Verify that pagination counters and page markers remain independent of cached result counts.

## 4. UI behavior guard

- Describe the exact visible behavior before and after the change.
- Limit changes to the approved user flows and UI states.
- Do not change layout, copy, error handling, loading behavior, or navigation as an incidental side effect.
- Preserve existing fallbacks for missing, invalid, or partially available data.
- Verify loading, empty, error, and success states for every affected flow.

## 5. Testing guard

- Identify the acceptance criteria that prove the change works.
- Choose the lowest test level that can verify those criteria reliably.
- Test user-visible behavior, not implementation details.
- Update or add the matching test plan in the same change.
- Do not treat a passing test as proof of behavior it does not actually assert.
- Do not add tests for purely presentational components when integration or Cypress tests already cover them.

## 6. Documentation guard

- Check whether `README.md`, `AGENTS.md`, relevant `docs/` files, test plans, TODOs, and code remain consistent.
- Update documentation that describes changed behavior in the same change.
- Remove or update references to renamed or removed files, functions, scripts, commands, and concepts.
- Do not leave contradictory instructions between short rules and detailed documentation.
- Distinguish stable project documentation from time-sensitive backlog or implementation status.

## 7. Scope guard

- Compare the actual file changes with the approved scope and acceptance criteria.
- Do not modify files outside the approved scope.
- Do not reorganize directories, rename concepts, or standardize wording without explicit approval.
- Report proposed but intentionally excluded changes separately.
- Name every open risk, unresolved question, and required follow-up.
