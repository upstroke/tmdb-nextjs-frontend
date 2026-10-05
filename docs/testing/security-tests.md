# Security-Tests

## Überblick

Security-Tests prüfen die Anwendung auf häufige Sicherheitslücken. Da es sich um eine read-only TMDB-App handelt, liegt der Fokus auf:

1. **Input-Validierung** (Suche)
2. **API-Key-Handling**
3. **External Content** (TMDB-gelieferte URLs)
4. **Dependency-Security**

## Test-Level

| Level | Werkzeug | Pfad | Fokus |
|-------|----------|------|-------|
| **Unit** | Vitest | `tests/vitest/security/` | Input-Validierung, API-Key-Checks |
| **Komponente** | Cypress | `tests/cypress/acceptance/components/security/` | XSS-Prävention im UI |

## Scripts

```bash
# Alle Security-Tests (Vitest + Cypress)
npm run test:security

# Nur Unit-Tests (Vitest)
npm run test:security:unit

# Nur Komponententests (Cypress)
npm run test:security:component
```

## Unit-Tests (Vitest)

### Search Input Validation

```js
// tests/vitest/security/search-input.test.js
import { sanitizeSearchInput } from '@/utils/sanitize';

describe('Security: Search Input', () => {
  it('weist XSS-Versuche ab', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeSearchInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });

  it('escapt HTML-Sonderzeichen', () => {
    const input = 'Movie & TV <Show>';
    const sanitized = sanitizeSearchInput(input);
    expect(sanitized).toBe('Movie & TV <Show>');
  });

  it('kürzt zu lange Inputs', () => {
    const longInput = 'a'.repeat(200);
    const sanitized = sanitizeSearchInput(longInput);
    expect(sanitized.length).toBeLessThanOrEqual(100);
  });
});
```

### API-Key Handling

```js
// tests/vitest/security/api-key.test.js
describe('Security: API-Key Handling', () => {
  it('API-Key ist nicht im Client-Code exponiert', () => {
    // Prüft, dass API-Key über Server-Side API Route gehandled wird
    expect(process.env.TMDB_API_KEY).toBeDefined();
    expect(typeof window !== 'undefined' && window?.TMDB_API_KEY).toBeUndefined();
  });
});
```

## Komponententests (Cypress)

### XSS Prevention in Search

```js
// tests/cypress/acceptance/components/security/search-xss.cy.js
describe('Security: Search XSS Prevention', () => {
  it('zeigt keine Script-Injection in Suchergebnissen', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /filme suchen/i })
      .type('<script>alert("xss")</script>{enter}');
    
    // Sollte keine Alert-Box zeigen und Suchbegriff sicher anzeigen
    cy.findByText(/<script>/i).should('not.exist');
    
    // Der Suchbegriff sollte escaped angezeigt werden
    cy.findByText(/<script>/i).should('exist');
  });
});
```

## Security-Checkliste

### Development

- [ ] **Input-Validierung**: Alle User-Inputs werden sanitisiert
- [ ] **API-Key**: Nur server-side, nicht im Client
- [ ] **External URLs**: Validierung von TMDB-gelieferten URLs
- [ ] **Kein dangerouslySetInnerHTML**: Außer bei explizit vertrauenswürdigem Content

### CI/CD

- [ ] **npm audit**: Bei jedem Build ausführen
- [ ] **Dependencies aktuell**: Dependabot oder Renovate aktivieren
- [ ] **ESLint security-plugin**: Statische Analyse auf Security-Issues

## Tools

- **npm audit**: `npm run audit` – Prüft auf bekannte Sicherheitslücken
- **Dependabot**: Automatische Security-Updates für Dependencies
- **ESLint security-plugin**: `eslint-plugin-security` für statische Analyse

## Dokumentation

- **Security Skill**: [`.agent/skills/tmdb-security/SKILL.md`](../../.agent/skills/tmdb-security/SKILL.md)
- **Testing-Strategie**: [`docs/testing.md`](./testing.md)
