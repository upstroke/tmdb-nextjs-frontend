# Page Objects für Akzeptanztests (E2E)

## Ziel

Page Objects kapseln die Selektoren und Aktionen einer Seite oder eines Flows. Sie machen E2E-Tests lesbarer, wartbarer und robuster gegenüber Änderungen im UI.

## Test-Ort

Page Objects werden verwendet in:

- **E2E-Tests (Flow-Akzeptanz):** `tests/cypress/acceptance/flows/`
- **Page Objects selbst:** `tests/cypress/POM/` (für alle Test-Levels verfügbar)

## Beispiel

```js
// tests/cypress/POM/HomePage.js
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  visit() {
    cy.visit('/');
    return this;
  }

  get title() {
    return cy.findByRole('heading', { level: 1 });
  }

  get movieCards() {
    return cy.findByRole('list').findAllByRole('listitem');
  }

  navigateToMovie(movieTitle) {
    cy.findByText(movieTitle).first().click();
    return this;
  }
}
```

```js
// tests/cypress/acceptance/flows/homepage.cy.js
import { HomePage } from '../../POM/HomePage';

describe('Homepage', () => {
  const homePage = new HomePage();

  it('zeigt Filmtitel gemäß AC-1', () => {
    homePage.visit();
    homePage.movieCards.should('exist');
  });
});
```

## Regeln

1. **Ein Page Object = Eine Seite oder ein Flow**  
   Jede Klasse repräsentiert eine logische Einheit (z. B. HomePage, MovieDetailsPage).

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
- **POM-Ordner** (`tests/cypress/POM/`) ist für alle Test-Levels verfügbar, nicht nur für Acceptance.
