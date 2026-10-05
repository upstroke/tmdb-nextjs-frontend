# TMDB Security Skill

## Purpose

This skill enables the AI agent to write and maintain security-focused tests for the TMDB Next.js frontend. It focuses on identifying and preventing common security vulnerabilities in a read-only movie database application.

## Scope

- Input validation (search, forms)
- API key handling (server-side only)
- XSS prevention
- Dependency security
- External content validation (TMDB-provided URLs)

## Capabilities

### 1. Write Security Unit Tests (Vitest)

```js
// tests/vitest/security/search-input.test.js
import { sanitizeSearchInput } from '@/utils/sanitize';

describe('Security: Search Input', () => {
  it('rejects XSS attempts', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeSearchInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });
});
```

### 2. Write Security Component Tests (Cypress)

```js
// tests/cypress/acceptance/components/security/search-xss.cy.js
describe('Security: Search XSS Prevention', () => {
  it('does not show script injection in search results', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /search movies/i })
      .type('<script>alert("xss")</script>{enter}');
    cy.findByText(/<script>/i).should('not.exist');
  });
});
```

### 3. Check API Key Handling

```js
// tests/vitest/security/api-key.test.js
describe('Security: API Key Handling', () => {
  it('API key is not exposed in client-side code', () => {
    expect(process.env.TMDB_API_KEY).toBeDefined();
    expect(typeof window !== 'undefined' && window?.TMDB_API_KEY).toBeUndefined();
  });
});
```

## Security Checklist

### Development

- [ ] All user inputs are sanitized
- [ ] API key is server-side only
- [ ] External URLs are validated
- [ ] No `dangerouslySetInnerHTML` except for trusted content

### CI/CD

- [ ] `npm audit` runs on every build
- [ ] Dependencies are kept up to date
- [ ] ESLint security plugin is enabled

## Scripts

```bash
# All security tests
npm run test:security

# Unit tests only
npm run test:security:unit

# Component tests only
npm run test:security:component
```

## Documentation

- **Security Tests**: [`docs/testing/security-tests.md`](../../docs/testing/security-tests.md)
- **Testing Strategy**: [`docs/testing.md`](../../docs/testing.md)

## When to Use

Use this skill when:
- Adding new user input fields
- Implementing search functionality
- Handling API keys or secrets
- Displaying external content (images, links)
- Adding new dependencies
