# Security Tests

## Overview

Security tests check the application for common vulnerabilities. As this is a read-only TMDB app, the focus is on:

1. **Input Validation** (Search)
2. **API Key Handling**
3. **External Content** (TMDB-provided URLs)
4. **Dependency Security**

## Test Levels

| Level         | Tool    | Path                                            | Focus                            |
| ------------- | ------- | ----------------------------------------------- | -------------------------------- |
| **Unit**      | Vitest  | `../../vitest`                        | Input validation, API key checks |
| **Component** | Cypress | `../../vitest` | XSS prevention in UI             |

## Scripts

```bash
# All security tests (Vitest + Cypress)
npm run test:security

# Unit tests only (Vitest)
npm run test:security:unit

# Component tests only (Cypress)
npm run test:security:component
```

## Unit Tests (Vitest)

### Search Input Validation

```js
// tests/vitest/security/search-input.test.js
import { sanitizeSearchInput } from '@/utils/sanitize';

describe('Security: Search Input', () => {
  it('rejects XSS attempts', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeSearchInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });

  it('escapes HTML special characters', () => {
    const input = 'Movie & TV <Show>';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('Movie & TV <Show>');
  });

  it('truncates overly long inputs', () => {
    const longInput = 'a'.repeat(200);
    const sanitized = sanitizeSearchInput(longInput);
    expect(sanitized.length).toBeLessThanOrEqual(100);
  });
});
```

### API Key Handling

```js
// tests/vitest/security/api-key.test.js
describe('Security: API Key Handling', () => {
  it('API key is not exposed in client-side code', () => {
    // Checks that API key is handled via server-side API route
    expect(process.env.TMDB_API_KEY).toBeDefined();
    expect(typeof window !== 'undefined' && window?.TMDB_API_KEY).toBeUndefined();
  });
});
```

## Component Tests (Cypress)

### XSS Prevention in Search

```js
// tests/cypress/acceptance/components/security/search-xss.cy.js
describe('Security: Search XSS Prevention', () => {
  it('does not show script injection in search results', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /search movies/i }).type(
      '<script>alert("xss")</script>{enter}'
    );

    // Should not show alert box and display search term safely
    cy.findByText(/<script>/i).should('not.exist');

    // The search term should be displayed escaped
    cy.findByText(/<script>/i).should('exist');
  });
});
```

## Security Checklist

### Development

- [ ] **Input Validation**: All user inputs are sanitized
- [ ] **API Key**: Server-side only, not in client
- [ ] **External URLs**: Validation of TMDB-provided URLs
- [ ] **No dangerouslySetInnerHTML**: Except for explicitly trusted content

### CI/CD

- [ ] **npm audit**: Run on every build
- [ ] **Dependencies up to date**: Dependabot or Renovate enabled
- [ ] **ESLint security plugin**: Static analysis for security issues

## Tools

- **npm audit**: `npm run audit` – Checks for known vulnerabilities
- **Dependabot**: Automatic security updates for dependencies
- **ESLint security-plugin**: `eslint-plugin-security` for static analysis

## Documentation

- **Security Skill**: [`.agent/skills/tmdb-security/SKILL.md`](../../.agent/skills/tmdb-security/SKILL.md)
- **Testing Strategy**: [`docs/testing.md`](./testing.md)
