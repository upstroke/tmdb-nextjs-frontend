# Akzeptanztests (Acceptance Tests)

## Ziel

Akzeptanztests prüfen, ob die implementierten Features die Anforderungen der User-Stories erfüllen. Sie dienen als letzte Qualitätsstufe vor dem Release und simulieren reale Nutzungsszenarien.

## Ebenen der Akzeptanztests

Akzeptanztests gliedern sich in zwei Ebenen:

1. **Komponenten-Akzeptanz** – Fachliche Abnahme einzelner UI-Komponenten gegen Akzeptanzkriterien (AC) der User-Stories.
2. **Flow-Akzeptanz (E2E)** – Abnahme kompletter User-Flows über mehrere Seiten und Interaktionen hinweg.

## Komponententests (Component Acceptance)

Komponententests sind Teil der Akzeptanztests und prüfen das fachliche Verhalten von UI-Komponenten gegen die Akzeptanzkriterien.

**Spezifikationen:** `tests/cypress/acceptance/components/`

Detaillierte Regeln und Beispiele finden sich in [component-tests.md](./component-tests.md).

## Flow-Akzeptanztests (E2E)

E2E-Tests prüfen komplette Nutzerabläufe (z. B. "Film suchen → Details ansehen → zur Watchlist hinzufügen").

**Spezifikationen:** `tests/cypress/acceptance/flows/`

## Werkzeug

- **Cypress** für beide Ebenen (Component Testing + E2E)
- Tests laufen im echten Browser mit voller Interaktionsunterstützung

## Beispiel (E2E)

```ts
// tests/cypress/acceptance/flows/search-and-add.cy.ts
describe('User-Flow: Film suchen und zur Watchlist hinzufügen', () => {
  it('erfolgreich gemäß AC-1 bis AC-3', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /filme suchen/i }).type('Inception{enter}');
    cy.findByText(/inception/i).first().click();
    cy.url().should('include', '/movie/');
    cy.findByRole('button', { name: /zur watchlist hinzufügen/i }).click();
    cy.findByText(/zur watchlist hinzugefügt/i).should('be.visible');
  });
});
```

## Regeln

1. **Ein Test = Ein Akzeptanzkriterium oder Flow**  
   Jede `it()`-Beschreibung referenziert explizit ACs oder einen User-Flow.

2. **Fachliche Sprache**  
   Testbeschreibungen verwenden die Sprache der Product Owner.

3. **Sichtbare Elemente priorisieren**  
   Queries nutzen `findByRole`, `findByText`, `findByLabel`.

4. **Barrierefreiheit mitprüfen**  
   Jede Komponente und jeder Flow enthält mindestens einen Test für ARIA-Labels oder Keyboard-Interaktion.

## Zusammenhang mit anderen Test-Leveln

- **Unit-Tests** prüfen technische Helper-Funktionen.
- **Integrationstests** prüfen das Zusammenspiel mehrerer Module.
- **Komponententests** (dieses Dokument) prüfen fachliches Verhalten von Komponenten.
- **Flow-Akzeptanztests** (dieses Dokument) prüfen komplette User-Flows.
