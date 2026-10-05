# Page Objects für Akzeptanztests (E2E)

## Ziel

Page Objects kapseln die Selektoren und Aktionen einer Seite oder eines Flows. Sie machen E2E-Tests lesbarer, wartbarer und robuster gegenüber Änderungen im UI.

## Test-Ort

Page Objects werden verwendet in:

- **E2E-Tests (Flow-Akzeptanz):** `tests/cypress/acceptance/flows/`
- **Page Objects selbst:** `tests/cypress/acceptance/page-objects/`

## Beispiel

```ts
// tests/cypress/acceptance/page-objects/movie-details-page.ts
export class MovieDetailsPage {
  visit(movieId: number) {
    cy.visit(`/movie/${movieId}`);
    return this;
  }

  get title() {
    return cy.findByRole('heading', { level: 1 });
  }

  get releaseYear() {
    return cy.findByText(/\d{4}/);
  }

  get addToWatchlistButton() {
    return cy.findByRole('button', { name: /zur watchlist hinzufügen/i });
  }

  addToWatchlist() {
    this.addToWatchlistButton.click();
    return cy.findByText(/zur watchlist hinzugefügt/i);
  }
}
```

```ts
// tests/cypress/acceptance/flows/movie-add-to-watchlist.cy.ts
import { MovieDetailsPage } from '../page-objects/movie-details-page';

describe('User-Flow: Film zur Watchlist hinzufügen', () => {
  it('erfolgreich gemäß AC-1 bis AC-3', () => {
    const page = new MovieDetailsPage();
    page.visit(123);
    page.title.should('contain', 'Inception');
    page.addToWatchlist().should('be.visible');
  });
});
```

## Regeln

1. **Ein Page Object = Eine Seite oder ein Flow**  
   Jede Klasse repräsentiert eine logische Einheit (z. B. MovieDetailsPage, SearchPage).

2. **Keine Assertions im Page Object**  
   Page Objects enthalten nur Selektoren und Aktionen, keine `should()`-Assertions.

3. **Methoden returnen `this` oder `cy`**  
   Für Fluent Interface: Methoden returnen `this` oder das Cypress-Objekt für Chaining.

4. **Stabile Selektoren priorisieren**  
   Verwende `findByRole`, `findByText`, `findByLabel` statt `data-testid` oder CSS-Selektoren.

5. **Aktionen kapseln**  
   Komplexe Interaktionen (z. B. "Film zur Watchlist hinzufügen") werden in einer Methode gekapselt.

## Zusammenhang mit anderen Test-Leveln

- **Komponententests** testen einzelne Komponenten isoliert.
- **Page Objects** werden in **Flow-Akzeptanztests (E2E)** verwendet, um komplette User-Flows zu testen.
