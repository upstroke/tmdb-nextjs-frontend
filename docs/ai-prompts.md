# AI-Prompts für Testing

Diese Prompts helfen AI-Coding-Assistents, korrekte Tests für das Projekt zu generieren.

## Kontext für AI-Assistents

Verwende diese Informationen, um Tests im korrekten Stil und Pfad zu generieren:

### Test-Levels und Pfade

| Level | Werkzeug | Pfad | Datei-Endung |
|-------|----------|------|-------------|
| Unit | Vitest | `tests/vitest/` | `.test.ts` |
| Integration | Vitest | `tests/vitest/` | `.test.ts` |
| Komponente | Cypress | `tests/cypress/acceptance/components/` | `.cy.ts` |
| Akzeptanz (E2E) | Cypress | `tests/cypress/acceptance/flows/` | `.cy.ts` |

### Wichtige Regeln

1. **Unit-Tests**: Isolierte Funktionen, keine DOM-Interaktionen
2. **Integrationstests**: Zusammenspiel mehrerer Module, ggf. mit mgemockten Services
3. **Komponententests**: Fachliche Abnahme gegen Akzeptanzkriterien, Cypress Component Testing
4. **Akzeptanztests**: Komplette User-Flows, Cypress E2E mit Page Objects

## Prompt: Unit-Test generieren

```
Erstelle einen Unit-Test für diese Funktion im Vitest-Stil.

- Pfad: `tests/vitest/<passender-ordner>/<funktion>.test.ts`
- Verwende `describe`, `it`, `expect` aus Vitest
- Mocke externe Abhängigkeiten mit `vi.fn()`
- Teste Edge Cases und Fehlerfälle
```

## Prompt: Integrationstest generieren

```
Erstelle einen Integrationstest für dieses Modul im Vitest-Stil.

- Pfad: `tests/vitest/<passender-ordner>/<modul>.test.ts`
- Teste das Zusammenspiel mit abhängigen Modulen
- Verwende reale Dependencies, wo sinnvoll; mocke nur externe Services (API, DB)
```

## Prompt: Komponententest generieren (Acceptance)

```
Erstelle einen Komponententest im Cypress Component Testing-Stil.

- Pfad: `tests/cypress/acceptance/components/<komponente>.cy.ts`
- Verwende `cy.mount()` und Cypress Queries (`cy.findByRole`, `cy.findByText`)
- Jeder Test entspricht einem Akzeptanzkriterium (AC) aus der User-Story
- Beschreibe Tests in fachlicher Sprache ("zeigt Titel gemäß AC-1")
- Prüfe Barrierefreiheit (ARIA-Labels, Keyboard-Interaktion)
```

## Prompt: Akzeptanztest (E2E) generieren

```
Erstelle einen E2E-Test im Cypress-Stil.

- Pfad: `tests/cypress/acceptance/flows/<user-flow>.cy.ts`
- Verwende Page Objects aus `tests/cypress/acceptance/page-objects/`
- Teste komplette User-Flows (z. B. "Film suchen → Details → zur Watchlist hinzufügen")
- Verwende `cy.visit()`, `cy.intercept()` für API-Mocks
- Prüfe sichtbare Elemente und Navigation
```

## Prompt: Page Object generieren

```
Erstelle ein Page Object für diese Seite/Komponente.

- Pfad: `tests/cypress/acceptance/page-objects/<seite>.ts`
- Exportiere eine Klasse oder ein Objekt mit Queries und Aktionen
- Verwende `cy.findByRole`, `cy.findByText` für stabile Selektoren
- Kapsle komplexe Interaktionen in Methoden
```

## Prompt: Accessibility-Test generieren

```
Erstelle einen Accessibility-Test für diese Komponente.

- Für automatisierte Tests: Vitest + axe-core in `tests/vitest/accessibility/`
- Für interaktive Tests: Cypress in `tests/cypress/acceptance/components/` oder `tests/cypress/acceptance/flows/`
- Prüfe ARIA-Labels, Keyboard-Navigation, Kontraste, Screen-Reader-Kompatibilität
```
