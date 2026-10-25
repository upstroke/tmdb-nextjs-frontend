# Movie detail integration test plan

## Scope

These integration tests cover the movie detail page (`/[locale]/movies/[id]`)
with the real page component, TMDB service, schemas, and error dialog. Only the
external TMDB network is mocked through `globalThis.fetch`.

## Test cases

| ID       | Scenario                                                              | Expected result                                                                                                     |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TC-MD-01 | Movie details succeed, but the watch-provider request returns `404`. | The movie page renders its details and overview, shows the not-available fallback for streaming providers, and does not show the TMDB 404 error. |
