# Unit Tests

This guide defines the project rules for Vitest unit tests. Use unit tests for isolated logic with minimal dependencies and a clear, narrow subject under test.

## Scope

Unit tests are the right choice for:

- pure utility functions
- isolated mapping and normalization logic
- store helpers with controlled input and output
- route helper logic that can be exercised without rendering the full route
- TMDB API service methods with mocked fetch responses
- fallback behavior and edge cases that are expensive to cover only through higher-level tests

Do not use a unit test when the behavior mainly depends on rendered DOM output, browser interaction, routing, or collaboration between multiple components. Use integration or acceptance tests instead.

## General Rules

- Use Vitest.
- Keep the test subject small and explicit.
- Mock only true external dependencies.
- Prefer stable fixtures over ad-hoc inline objects when the same domain data is reused.
- Keep each test focused on one behavior or one fallback path.
- Use descriptive test names that state the expected behavior.
- Cover both the main path and the relevant edge cases.

## File Location

Place unit tests under `tests/unit/`.

Use subdirectories when they improve discoverability, for example:

```text
tests/unit/
  routes/
  tmdb-api/
```

Match the test file name to the subject as closely as possible.

## Test Structure

Use the arrange-act-assert structure consistently.

```js
import { describe, expect, it } from 'vitest';
import { formatDate } from '$lib/utils/date.js';

describe('formatDate', () => {
  it('formats ISO dates for the active locale', () => {
    const result = formatDate('2024-05-01', 'de-DE');

    expect(result).toBe('01.05.2024');
  });
});
```

Guidelines:

- one `describe()` block per exported function or coherent unit
- one `it()` block per observable behavior
- avoid assertions that duplicate implementation details
- assert the returned structure and visible contract, not internal temporary values

## Fixtures and Mocks

- Reuse shared fixtures from `tests/fixtures/` when they represent stable domain data.
- Reuse shared mocks from `tests/mocks/` when the same dependency behavior is needed in multiple tests.
- Keep one-off inline data only when it makes the individual test clearer.
- Prefer small, readable fixtures over large, opaque payloads.

If a fixture grows because of a new API field, update it carefully and keep unrelated fixture shapes unchanged.

## TMDB API Unit Tests

For TMDB API service tests under `tests/unit/tmdb-api/`, prefer a consistent pattern:

- mock `fetch` responses with explicit per-call payloads
- keep raw TMDB-like payloads separate from mapped UI expectations
- verify the requested endpoint in addition to the returned data
- cover both normal mapping and fallback behavior
- add one focused test for each new service method

Typical coverage areas for TMDB API unit tests:

- endpoint selection
- request parameters
- mapping from TMDB response shape to UI shape
- fallback handling for missing text, images, ratings, or nested data
- branch behavior for empty arrays, missing objects, or unsupported values

When possible, use reusable fixtures from `tests/fixtures/tmdb/`. If the new payload is highly specific to one method, a small local fixture inside the test file is acceptable.

### Season and Episode Data

For TV season work, unit tests should explicitly cover the contracts of season-related methods such as `getTVShowDetails()` and `getTVSeasonDetails()`.

Relevant examples include:

- `numberOfSeasons`, `numberOfEpisodes`, and `seasons` are exposed on TV detail results
- season endpoints are called with the correct show ID and season number
- episode fields are normalized consistently, for example `episodeNumber`, `airDate`, `runtime`, `rating`, and `stillUrl`
- missing `still_path` values fall back to `null`
- empty episode lists return a stable empty array rather than failing or changing shape

## Edge Cases

Unit tests should protect edge cases that are easy to break silently, for example:

- empty arrays
- missing optional fields
- duplicate entries
- invalid or unknown locale values
- null or undefined API values that should fall back safely

## Coverage Expectations

Unit tests should protect logic that is deterministic and cheap to validate in isolation.

High coverage is useful here, but coverage numbers are only a guide. Add tests where failures would be hard to notice from the UI alone.

## When to Stop

Do not keep expanding a unit test once it starts simulating multiple application layers. If you need routing, rendering, browser APIs, or user interaction to trust the result, move that behavior to an integration or acceptance test.
