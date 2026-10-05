# TMDB Testing Skill

## Überblick

Dieser Skill definiert die Test-Strategie für das TMDB Next.js Frontend. Alle Tests folgen der fachlichen Struktur und nicht der Werkzeug-Struktur.

## Test-Levels

| Level | Werkzeug | Pfad | Fokus |
|-------|----------|------|-------|
| **Unit** | Vitest | `tests/vitest/` | Isolierte Funktionen, Helper, Services |
| **Integration** | Vitest | `tests/vitest/` | Zusammenspiel mehrerer Module/Services |
| **Komponente** | Cypress | `tests/cypress/acceptance/components/` | Fachliche Abnahme von UI-Komponenten gegen Akzeptanzkriterien |
| **Akzeptanz (E2E)** | Cypress | `tests/cypress/acceptance/flows/` | Komplette User-Flows über mehrere Seiten |

## Ordnerstruktur

```
tests/
├── vitest/                          # Unit- und Integrationstests
│   ├── accessibility/               # Automatisierte A11y-Tests
│   └── *.test.js                    # Test-Dateien
├── cypress/
│   ├── acceptance/                  # Cypress Acceptance Tests
│   │   ├── components/              # Komponententests (Component Acceptance)
│   │   ├── flows/                   # E2E-Tests (Flow-Akzeptanz)
│   │   └── accessibility/           # Interaktive A11y-Tests
│   ├── POM/                         # Page Objects (für alle Test-Levels)
│   ├── fixtures/                    # Test-Daten
│   └── support/                     # Cypress-Konfiguration und Helpers
```

## Wichtige Regeln

1. **Fachliche Sprache**: Testbeschreibungen verwenden die Sprache der Product Owner (nicht technische Implementierungsdetails).
2. **Ein Test = Ein Akzeptanzkriterium**: Jede `it()`-Beschreibung referenziert explizit ein AC aus der User-Story.
3. **Sichtbare Elemente priorisieren**: Queries nutzen `findByRole`, `findByText`, `findByLabel` – keine implementation details.
4. **Barrierefreiheit mitprüfen**: Jede Komponente enthält mindestens einen Test für ARIA-Labels oder Keyboard-Interaktion.

## Cypress-Config

Die Cypress-Konfiguration (`cypress.config.js`) verwendet folgende `specPattern`:

- **Component Testing**: `tests/cypress/acceptance/components/**/*.cy.js`
- **E2E Testing**: `tests/cypress/acceptance/flows/**/*.cy.js`

## Page Objects

Page Objects befinden sich in `tests/cypress/POM/` und werden in E2E-Tests verwendet:

```js
// tests/cypress/POM/HomePage.js
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  visit() {
    cy.visit('/');
    return this;
  }
}
```

## Dokumentation

- **Zentrale Testing-Doku**: [`docs/testing.md`](../../docs/testing.md)
- **Komponententests**: [`docs/testing/component-tests.md`](../../docs/testing/component-tests.md)
- **Akzeptanztests**: [`docs/testing/acceptance-tests.md`](../../docs/testing/acceptance-tests.md)
- **Accessibility**: [`docs/testing/accessibility-audit-checklist.md`](../../docs/testing/accessibility-audit-checklist.md)
- **AI-Prompts**: [`docs/ai-prompts.md`](../../docs/ai-prompts.md)

## Coverage-Ziele

- **Vitest**: 80% global (branches, functions, lines, statements) – erzwungen durch `vitest.config.js`
- **Cypress**: Kein automatisches Coverage, aber qualitative Abdeckung aller Akzeptanzkriterien
