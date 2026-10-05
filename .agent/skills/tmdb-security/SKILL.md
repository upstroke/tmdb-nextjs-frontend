# TMDB Security Skill

## Überblick

Dieser Skill definiert die Security-Prinzipien für das TMDB Next.js Frontend. Da es sich um eine read-only Anwendung handelt, liegt der Fokus auf Input-Validierung, API-Key-Handling und Dependency-Security.

## Security-Risiken

| Risiko | Beschreibung | Gegenmaßnahme |
|--------|--------------|---------------|
| **XSS über Suche** | User-Input in Suchfeld könnte Script-Tags enthalten | Input sanitization, React escapt automatisch |
| **API-Key-Exposure** | TMDB API-Key könnte im Client exponiert sein | API-Key server-side halten (API Route) |
| **External Content** | TMDB liefert externe URLs (Bilder, Links) | URLs validieren, keine `dangerouslySetInnerHTML` |
| **Dependency-Security** | Unsichere npm-Pakete | Regelmäßige `npm audit`, Dependabot |

## Security-Tests

### Unit-Tests (Vitest)

**Pfad:** `tests/vitest/security/`

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
});

// tests/vitest/security/api-key.test.js
describe('Security: API-Key Handling', () => {
  it('API-Key ist nicht im Client-Code exponiert', () => {
    // Prüft, dass API-Key über Server-Side API Route gehandled wird
    expect(process.env.TMDB_API_KEY).toBeDefined();
    expect(window?.TMDB_API_KEY).toBeUndefined();
  });
});
```

### Komponententests (Cypress)

**Pfad:** `tests/cypress/acceptance/components/security/`

```js
// tests/cypress/acceptance/components/security/search-xss.cy.js
describe('Security: Search XSS Prevention', () => {
  it('zeigt keine Script-Injection in Suchergebnissen', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /filme suchen/i })
      .type('<script>alert("xss")</script>{enter}');
    // Sollte keine Alert-Box zeigen und Suchbegriff sicher anzeigen
    cy.findByText(/<script>/i).should('not.exist');
  });
});
```

## Security-Checkliste

- [ ] **Input-Validierung**: Alle User-Inputs werden sanitisiert
- [ ] **API-Key**: Nur server-side, nicht im Client
- [ ] **External URLs**: Validierung von TMDB-gelieferten URLs
- [ ] **Kein dangerouslySetInnerHTML**: Außer bei explizit vertrauenswürdigem Content
- [ ] **npm audit**: Regelmäßig ausführen (`npm run audit`)
- [ ] **Dependencies aktuell**: Dependabot oder Renovate aktivieren

## Dokumentation

- **Testing-Strategie**: [`docs/testing.md`](../../docs/testing.md)
- **Security-Tests**: [`docs/testing/security-tests.md`](../../docs/testing/security-tests.md)

## Tools

- **npm audit**: `npm run audit` – Prüft auf bekannte Sicherheitslücken
- **Dependabot**: Automatische Security-Updates für Dependencies
- **ESLint security-plugin**: Statische Analyse auf Security-Issues
