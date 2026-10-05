# Komponententests (Component Acceptance)

## Ziel

Komponententests dienen der fachlichen Abnahme von UI-Komponenten gegen die Akzeptanzkriterien der User-Stories. Im Gegensatz zu technischen Unit-Tests wird hier das sichtbare und interaktive Verhalten der Komponente aus Anwendersicht geprüft.

## Abgrenzung

| Test-Level | Werkzeug | Ort | Fokus |
|------------|----------|-----|-------|
| Unit-Tests | Vitest | `tests/vitest/` | Technische Korrektheit isolierter Funktionen |
| **Komponententests** | **Cypress** | `tests/cypress/acceptance/components/` | **Fachliches Verhalten von Komponenten gegen Akzeptanzkriterien** |
| Integrationstests | Vitest | `tests/vitest/` | Zusammenspiel mehrerer Module/Services |
| Akzeptanztests (E2E) | Cypress | `tests/cypress/acceptance/flows/` | Komplette User-Flows über mehrere Seiten |

## Test-Ort

Spezifikationen für Komponententests liegen unter:

```
tests/cypress/acceptance/components/
```

Dateinamen enden auf `.cy.{js,ts,jsx,tsx}` und folgen dem Muster:

```
<component-name>.cy.ts
```

Beispiel:

```
tests/cypress/acceptance/components/movie-card.cy.ts
```

## Werkzeug

- **Cypress Component Testing** mit Next.js-Bundler
- Tests laufen im echten Browser (kein JSDOM)
- Volle Unterstützung für Interaktionen (Klicks, Hover, Navigation)

## Beispiel

```ts
// tests/cypress/acceptance/components/movie-card.cy.ts
import { MovieCard } from '@/components/movie-card';

describe('MovieCard (Acceptance)', () => {
  it('zeigt Titel und Release-Jahr gemäß Akzeptanzkriterium AC-1', () => {
    const movie = {
      title: 'Inception',
      releaseDate: '2010-07-16',
      posterPath: '/inception.jpg',
    };

    cy.mount(<MovieCard movie={movie} />);

    cy.findByRole('img', { name: /inception/i }).should('be.visible');
    cy.findByText(/inception/i).should('be.visible');
    cy.findByText(/2010/).should('be.visible');
  });

  it('zeigt Favoriten-Button und markiert als favorisiert gemäß AC-2', () => {
    const movie = {
      title: 'Inception',
      releaseDate: '2010-07-16',
      posterPath: '/inception.jpg',
      isFavorite: true,
    };

    cy.mount(<MovieCard movie={movie} />);

    cy.findByRole('button', { name: /favorit/i })
      .should('be.visible')
      .and('have.attr', 'aria-pressed', 'true');
  });
});
```

## Regeln

1. **Ein Test = Ein Akzeptanzkriterium**  
   Jede `it()`-Beschreibung referenziert explizit ein AC aus der User-Story (z. B. "gemäß AC-1").

2. **Fachliche Sprache**  
   Testbeschreibungen verwenden die Sprache der Product Owner (nicht technische Implementierungsdetails).

3. **Sichtbare Elemente priorisieren**  
   Queries nutzen `findByRole`, `findByText`, `findByLabel` – keine implementation details wie `data-testid` außer bei Screen-Reader-spezifischen Fällen.

4. **Keine Mocks für Fachlogik**  
   Die Komponente wird mit realen Props getestet. Externe Abhängigkeiten (API-Calls) werden über Cypress-Intercepts gemockt, falls nötig.

5. **Barrierefreiheit mitprüfen**  
   Jede Komponente enthält mindestens einen Test für ARIA-Labels oder Keyboard-Interaktion.

## Zusammenhang mit anderen Test-Leveln

- **Unit-Tests** prüfen technische Helper-Funktionen der Komponente (z. B. `formatReleaseDate()`).
- **Komponententests** prüfen das fachliche Verhalten der gesamten Komponente.
- **Integrationstests** prüfen das Zusammenspiel der Komponente mit Parent-Komponenten oder Context-Providern.
- **Akzeptanztests (E2E)** prüfen die Komponente im Kontext kompletter User-Flows.
