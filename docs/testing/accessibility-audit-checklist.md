# Accessibility Audit Checklist

## Overview

This checklist ensures the application meets **WCAG 2.1 AA** accessibility standards. Accessibility tests are **acceptance tests** organized by page/component.

## Test Structure

```
tests/cypress/acceptance/accessibility/
├── homepage/          # Homepage A11y audit
├── movieDetail/       # Movie detail page A11y
├── tvShowDetail/      # TV show detail page A11y
└── components/        # Component-specific A11y (CardDefault, Navigation, etc.)
```

---

## Automated Testing

### Cypress + axe-core

```javascript
// tests/cypress/acceptance/accessibility/homepage/homepage.cy.js
describe('Homepage Accessibility', () => {
  it('passes WCAG 2.1 AA audit', () => {
    cy.visitWithLocale('/', 'en-US');
    cy.checkPageA11y();
  });
});
```

### Component A11y

```javascript
// tests/cypress/acceptance/components/cardDefault/cardDefault.cy.js
import { CardDefault } from '../../POM/CardDefault';

const card = CardDefault();

describe('CardDefault Accessibility', () => {
  it('has accessible name and role', () => {
    const movieData = {
      id: 123,
      mediaType: 'movie',
      title: 'Test Movie'
    };

    card.mount(movieData);
    card.card().should('have.attr', 'role', 'link');
    card.title().should('have.attr', 'aria-label');
  });
});
```

---

## Running Audits

```bash
# All acceptance tests (includes accessibility)
npm run test:component
npm run test:e2e

# Specific accessibility test
npx cypress run --e2e --spec "tests/cypress/acceptance/accessibility/homepage/homepage.cy.js"
```

---

## Manual Checklist

### ✅ Keyboard Navigation

- [ ] All interactive elements are focusable
- [ ] Focus order is logical (Tab key)
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Skip links work correctly
- [ ] Modal dialogs trap focus

### ✅ Screen Reader Support

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Dynamic content is announced (aria-live)
- [ ] Landmarks are used correctly (main, nav, etc.)
- [ ] Headings are in logical order

### ✅ Visual Design

- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Text contrast ratio ≥ 3:1 (large text)
- [ ] Color is not the only way to convey information
- [ ] Focus states are clearly visible
- [ ] Text can be zoomed to 200% without loss

### ✅ Interactive Elements

- [ ] All buttons are clickable
- [ ] Links have descriptive text
- [ ] Form errors are clearly identified
- [ ] Required fields are marked
- [ ] Custom controls have proper ARIA roles

### ✅ Content

- [ ] Page has a unique title
- [ ] Language is declared
- [ ] Content is structured with headings
- [ ] Lists are marked up correctly
- [ ] Tables have headers (if used)

---

## Testing Tools

### Automated

- **axe-core** (via cypress-axe) – `cy.checkPageA11y()`
- **WAVE** browser extension
- **Lighthouse** accessibility audit

### Manual

- **Keyboard-only navigation** (Tab, Shift+Tab, Enter, Space, Arrow keys)
- **Screen readers**: NVDA (Windows), VoiceOver (Mac)
- **Browser zoom**: Test up to 200%
- **High contrast mode**

---

## Common Issues

### Critical

- Missing alt text on images
- Missing form labels
- Keyboard inaccessible elements
- Missing focus indicators
- Poor color contrast

### Important

- Missing ARIA labels on custom controls
- Illogical heading structure
- Missing skip links
- Auto-playing media without controls

---

## A11y Test Plans

Each page/component should have a test plan:

```
accessibility/homepage/
├── Homepage-A11y-Testplan.md   # WCAG audit checklist + Gherkin scenarios
└── homepage.cy.js              # Automated tests
```

### Test Plan Content

- **WCAG Success Criteria** – Relevant A/B level criteria
- **Test Scenarios** – Keyboard, Screen Reader, Visual
- **Pass/Fail Criteria** – Zero violations for A + AA
- **Manual Checklist** – Page-specific items

---

## Related Documentation

- [Testing Strategy](../testing.md)
- [Acceptance Tests](acceptance-tests.md)
- [Component Tests](component-tests.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
