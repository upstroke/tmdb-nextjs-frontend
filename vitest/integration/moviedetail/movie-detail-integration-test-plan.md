# Movie detail integration test plan

## Scope

These integration tests cover the movie detail page (`/[locale]/movies/[id]`)
with the real page component, TMDB service, schemas, and error dialog. Only the
external TMDB network is mocked through `globalThis.fetch`.

## Test cases

| ID       | Scenario                                                              | Expected result                                                                                                     |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TC-MD-01 | Movie details succeed, but the watch-provider request returns `404`. | The movie page renders its details and overview, shows the not-available fallback for streaming providers, and does not show the TMDB 404 error. |

## Provider fallback assertion

TC-MD-01 first verifies that `section[aria-labelledby="watch-providers-heading"]`
exists, then uses Testing Library `within` to assert the localized not-available
text inside that section only. Other missing movie fields may legitimately
render the same fallback elsewhere; they must neither cause ambiguous matches
nor allow an unrelated fallback to satisfy this assertion.

## Network assertion

TC-MD-01 verifies that fetch was called with a URL containing
`/movie/123/watch/providers`. The TMDB service passes only the URL to fetch;
the assertion therefore does not require a second options argument.
