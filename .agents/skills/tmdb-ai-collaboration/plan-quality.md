# Plan quality guardrails

Before proposing an implementation plan:

1. Read every directly affected file completely.
2. Verify that every referenced file, route, component, function, and test
   exists.
3. Cite the exact file path and relevant code for every repository claim.
4. If a file, route, function, or behavior cannot be verified, write:
   “Cannot be determined from the repository.”
5. Do not present an assumption as a fact.

For every proposed data flow, state:

- Where the data is loaded.
- Where it is stored.
- Which component reads it.
- How long the storage lives.
- What happens on route navigation.
- What happens on locale change.
- What happens on full page reload.

For every proposed API request, state:

- The exact HTTP method and path.
- The existing route or file that handles it.
- The request parameters.
- Whether it is an initial request or a user-triggered request.

For caching, distinguish explicitly between:

- Request-scoped data.
- Component state.
- Client-side route-persistent state.
- Server instance state.
- Framework or HTTP cache.
- Persistent browser storage.

For behavior that must be preserved, list it explicitly before proposing
changes. Do not remove, defer, or alter it unless the task explicitly allows
that change.

Before proposing tests, identify the actual existing test files and test
levels. Do not write “integration tests” without naming the concrete files or
explaining why new files are required.
