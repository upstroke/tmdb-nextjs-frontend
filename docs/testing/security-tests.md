# Security Tests

## Overview

This is a read-only TMDB app. Security checks focus on:

1. **Input validation** (search)
2. **API key handling**
3. **External content** (TMDB-provided URLs)
4. **Dependency security**

The security skill is described in [`.agent/skills/tmdb-security/SKILL.md`](../../.agent/skills/tmdb-security/SKILL.md).

## Status

There are no dedicated security test suites and no `test:security` scripts yet. The planned tests below use the existing runners.

## Planned Tests

| Topic                    | Runner                      | Location (planned)      | Check                                                                              |
| ------------------------ | --------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| Search input validation  | Vitest (jsdom)              | `vitest/unit/`          | Invalid or overly long queries are rejected by the search route and Zod schema     |
| API key handling         | Vitest (jsdom)              | `vitest/integration/`   | `TMDB_API_KEY` is only used server-side and does not appear in a response body     |
| XSS in search            | Cypress                     | `cypress/e2e/`          | A script tag typed into the search box is shown as text and is not executed       |
| External URLs            | Vitest (jsdom)              | `vitest/unit/`          | Image and link URLs from TMDB are validated before they are rendered               |

Existing tests already cover parts of this: the search route rejects short queries and invalid locales, and the missing API key is handled (see [Integration Tests](integration-tests.md)).

## Security Checklist

### Development

- [ ] **Input validation:** User input is validated (Zod)
- [ ] **API key:** Server-side only, not in client code
- [ ] **External URLs:** TMDB-provided URLs are validated
- [ ] **No `dangerouslySetInnerHTML`:** Except for explicitly trusted content

### CI/CD

- [ ] **`npm audit`:** Run on every build
- [ ] **Dependencies up to date:** Dependabot or Renovate enabled

## Tools

- **npm audit:** `npm audit` checks for known vulnerabilities
- **Dependabot:** Automatic security updates for dependencies

## Documentation

- [Testing Strategy](../testing.md)
- [Common Rules](common-rules.md)
