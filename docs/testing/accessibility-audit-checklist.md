# Accessibility Audit Checklist

Diese Checkliste gliedert Accessibility-Tests nach Test-Levels und Werkzeugen.

## Übersicht

| Test-Level | Werkzeug | Pfad | Fokus |
|------------|----------|------|-------|
| **Unit** | Vitest + axe-core | `tests/vitest/accessibility/` | Automatisierte A11y-Checks isolierter Komponenten |
| **Komponente** | Cypress | `tests/cypress/acceptance/components/` | Interaktive A11y-Checks an einzelnen Komponenten |
| **Akzeptanz (E2E)** | Cypress | `tests/cypress/acceptance/flows/` | A11y in kompletten User-Flows |

---

## Unit-Tests (Vitest + axe-core)

**Pfad:** `tests/vitest/accessibility/`

### Automatisierte Checks

- [ ] **ARIA-Rollen**: Alle interaktiven Elemente haben korrekte `role`-Attribute
- [ ] **Labels**: Alle Formularelemente haben verknüpfte `<label>` oder `aria-label`
- [ ] **Kontraste**: Text-Hintergrund-Kontrast ≥ 4.5:1 (WCAG AA)
- [ ] **Fokus-Indikatoren**: Alle fokussierbaren Elemente haben sichtbaren Fokus
- [ ] **Semantik**: Korrekte Überschriften-Hierarchie (`h1`–`h6`)
- [ ] **Bilder**: Alle `<img>` haben aussagekräftige `alt`-Texte
- [ ] **Links**: Link-Texte sind beschreibend (nicht "hier klicken")

### Beispiel

```ts
// tests/vitest/accessibility/movie-card.test.ts
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { MovieCard } from '@/components/movie-card';

expect.extend(toHaveNoViolations);

it('hat keine A11y-Verstöße', async () => {
  const { container } = render(
    <MovieCard movie={{ title: 'Inception', releaseDate: '2010-07-16' }} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Komponententests (Cypress)

**Pfad:** `tests/cypress/acceptance/components/`

### Interaktive Checks

- [ ] **Keyboard-Navigation**: Alle Interaktionen sind per Tastatur möglich
- [ ] **Fokus-Reihenfolge**: Logische Fokus-Reihenfolge (Tab-Reihenfolge)
- [ ] **Screen-Reader-Tests**: Wichtige Inhalte werden vorgelesen
- [ ] **Fokus-Fallen**: Kein Fokus-Trap in Modalen/Dialogen
- [ ] **Dynamische Inhalte**: `aria-live`-Regionen für Updates

### Beispiel

```ts
// tests/cypress/acceptance/components/movie-card.cy.ts
import { MovieCard } from '@/components/movie-card';

describe('MovieCard (A11y)', () => {
  it('ist per Tastatur navigierbar', () => {
    cy.mount(<MovieCard movie={{ title: 'Inception' }} />);
    cy.tab().should('have.focus');
    cy.tab().should('have.focus');
  });

  it('hat korrekte ARIA-Labels', () => {
    cy.mount(<MovieCard movie={{ title: 'Inception' }} />);
    cy.findByRole('img', { name: /inception/i }).should('exist');
    cy.findByRole('button', { name: /favorit/i }).should('exist');
  });
});
```

---

## Akzeptanztests (E2E, Cypress)

**Pfad:** `tests/cypress/acceptance/flows/`

### Flow-weite Checks

- [ ] **Kompletter Flow per Tastatur**: User-Flow ist ohne Maus möglich
- [ ] **Fokus-Management**: Fokus wird nach Navigation/Modal-Öffnung korrekt gesetzt
- [ ] **Fehlermeldungen**: Fehler sind per Screen-Reader lesbar (`aria-invalid`, `aria-describedby`)
- [ ] **Ladezustände**: Loading-States sind angekündigt (`aria-busy`, `aria-live`)

### Beispiel

```ts
// tests/cypress/acceptance/flows/search-and-add.cy.ts
describe('User-Flow: Film suchen und hinzufügen (A11y)', () => {
  it('ist komplett per Tastatur bedienbar', () => {
    cy.visit('/');
    cy.findByRole('searchbox', { name: /filme suchen/i }).type('Inception{enter}');
    cy.findByText(/inception/i).first().tab().type('{enter}');
    cy.url().should('include', '/movie/');
    cy.findByRole('button', { name: /zur watchlist hinzufügen/i })
      .tab()
      .type('{enter}');
    cy.findByText(/zur watchlist hinzugefügt/i).should('be.visible');
  });
});
```

---

## Manuelle Checks (alle Levels)

Diese Checks erfordern manuelle Prüfung und können nicht automatisiert werden:

- [ ] **Logische Lesereihenfolge**: DOM-Reihenfolge entspricht visueller Reihenfolge
- [ ] **Bewegte Inhalte**: Animationen sind pausierbar (`prefers-reduced-motion`)
- [ ] **Farbunabhängigkeit**: Informationen nicht nur über Farbe vermittelt
- [ ] **Zoom**: Funktioniert bis 200% ohne Funktionsverlust
- [ ] **Touch-Targets**: Mindestens 44×44 Pixel für interaktive Elemente

---

## Tools

- **axe-core**: Automatisierte A11y-Checks in Vitest und Cypress
- **WAVE Browser-Extension**: Visuelle A11y-Analyse
- **Screen-Reader**: NVDA (Windows), VoiceOver (macOS), JAWS
- **Tastatur-Test**: Nur Tab, Shift+Tab, Enter, Space, Pfeiltasten verwenden
