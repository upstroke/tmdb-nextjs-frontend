# TMDB Development Skill

## Überblick

Dieser Skill definiert die Development-Praktiken für das TMDB Next.js Frontend.

## Development-Workflow

1. **Feature-Branch erstellen**: `git checkout -b feature/mein-feature`
2. **Lokal entwickeln und testen**
3. **Tests ausführen**:
   - `npm run test:unit` – Vitest Unit- und Integrationstests
   - `npm run test:component` – Cypress Komponententests
   - `npm run test:e2e` – Cypress E2E-Tests (Flows)
4. **Committen und pushen**
5. **Pull Request erstellen**

## Test-Integration im Development

Tests sind integraler Bestandteil des Development-Prozesses:

- **Unit/Integration**: Schnelle Tests während der Entwicklung (`npm run test:unit`)
- **Komponente**: Fachliche Abnahme von UI-Komponenten (`npm run test:component`)
- **Akzeptanz (E2E/Flows)**: Komplette User-Flows testen (`npm run test:e2e`)

## Ordnerstruktur (Tests)

```
tests/
├── vitest/                          # Unit- und Integrationstests
│   ├── accessibility/               # Automatisierte A11y-Tests
│   └── *.test.js
├── cypress/
│   ├── acceptance/
│   │   ├── components/              # Komponententests
│   │   ├── flows/                   # E2E-Tests (Flows)
│   │   └── accessibility/           # Interaktive A11y-Tests
│   ├── POM/                         # Page Objects
│   ├── fixtures/
│   └── support/
```

## Dokumentation

- **Testing-Strategie**: [`docs/testing.md`](../../docs/testing.md)
- **AI-Prompts für Tests**: [`docs/ai-prompts.md`](../../docs/ai-prompts.md)
