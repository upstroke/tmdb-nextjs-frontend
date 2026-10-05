# TMDB Accessibility Skill

## Überblick

Dieser Skill definiert die Accessibility-Strategie für das TMDB Next.js Frontend. Accessibility-Tests sind über alle Test-Levels integriert.

## Test-Levels für Accessibility

| Level | Werkzeug | Pfad | Fokus |
|-------|----------|------|-------|
| **Unit** | Vitest + axe-core | `tests/vitest/accessibility/` | Automatisierte A11y-Checks isolierter Komponenten |
| **Komponente** | Cypress | `tests/cypress/acceptance/components/` | Interaktive A11y-Checks an einzelnen Komponenten |
| **Akzeptanz (E2E/Flows)** | Cypress | `tests/cypress/acceptance/flows/` | A11y in kompletten User-Flows (End-to-End) |

## Wichtige Regeln

1. **ARIA-Rollen**: Alle interaktiven Elemente haben korrekte `role`-Attribute
2. **Labels**: Alle Formularelemente haben verknüpfte `<label>` oder `aria-label`
3. **Kontraste**: Text-Hintergrund-Kontrast ≥ 4.5:1 (WCAG AA)
4. **Fokus-Indikatoren**: Alle fokussierbaren Elemente haben sichtbaren Fokus
5. **Keyboard-Navigation**: Alle Interaktionen sind per Tastatur möglich
6. **Screen-Reader-Tests**: Wichtige Inhalte werden vorgelesen

## Automatisierte Tests (Vitest)

```js
// tests/vitest/accessibility/movie-card.test.js
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { MovieCard } from '@/components/movie-card';

expect.extend(toHaveNoViolations);

it('hat keine A11y-Verstöße', async () => {
  const { container } = render(<MovieCard movie={{ title: 'Inception' }} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Interaktive Tests (Cypress)

```js
// tests/cypress/acceptance/components/movie-card.cy.js
describe('MovieCard (A11y)', () => {
  it('ist per Tastatur navigierbar', () => {
    cy.mount(<MovieCard movie={{ title: 'Inception' }} />);
    cy.tab().should('have.focus');
  });

  it('hat korrekte ARIA-Labels', () => {
    cy.mount(<MovieCard movie={{ title: 'Inception' }} />);
    cy.findByRole('img', { name: /inception/i }).should('exist');
  });
});
```

## Dokumentation

- **Accessibility Audit Checklist**: [`docs/testing/accessibility-audit-checklist.md`](../../docs/testing/accessibility-audit-checklist.md)
- **Testing-Strategie**: [`docs/testing.md`](../../docs/testing.md)

## Tools

- **axe-core**: Automatisierte A11y-Checks in Vitest und Cypress
- **WAVE Browser-Extension**: Visuelle A11y-Analyse
- **Screen-Reader**: NVDA (Windows), VoiceOver (macOS)
- **Tastatur-Test**: Nur Tab, Shift+Tab, Enter, Space, Pfeiltasten verwenden
