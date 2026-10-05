# Testing-Strategie

## Test-Levels

Dieses Projekt verwendet vier Test-Levels, die sich nach fachlichen Kriterien und nicht nach Werkzeugen gliedern:

| Level | Werkzeug | Pfad | Fokus |
|-------|----------|------|-------|
| **Unit** | Vitest | `tests/vitest/` | Isolierte Funktionen, Helper, Services |
| **Integration** | Vitest | `tests/vitest/` | Zusammenspiel mehrerer Module/Services |
| **Komponente** | Cypress | `tests/cypress/acceptance/components/` | Fachliche Abnahme von UI-Komponenten gegen Akzeptanzkriterien |
| **Akzeptanz (E2E)** | Cypress | `tests/cypress/acceptance/flows/` | Komplette User-Flows über mehrere Seiten |

## Werkzeuge

- **Vitest** für Unit- und Integrationstests (schnelle, isolierte Tests)
- **Cypress** für Komponenten- und Akzeptanztests (Browser-basiert, interaktiv)

## Dokumentationen

- [Unit-Tests](./testing/unit-tests.md)
- [Integrationstests](./testing/integration-tests.md)
- [Komponententests](./testing/component-tests.md)
- [Akzeptanztests](./testing/acceptance-tests.md)
- [Page Objects](./testing/page-objects.md)
- [Accessibility Audit](./testing/accessibility-audit-checklist.md)
- [Common Rules](./testing/common-rules.md)

## Test-Pyramide

```
        /
       /  \      Akzeptanz (E2E)
      /----\     Komponente
     /      \    Integration
    /--------\   Unit
```

- **Basis**: Viele schnelle Unit-Tests
- **Mitte**: Weniger Integrationstests
- **Spitze**: Wenige, aber wertvolle Komponenten- und Akzeptanztests

## Coverage-Ziele

- **Vitest**: 80% global (branches, functions, lines, statements) – erzwungen durch `vitest.config.js`
- **Cypress**: Kein automatisches Coverage, aber qualitative Abdeckung aller Akzeptanzkriterien
