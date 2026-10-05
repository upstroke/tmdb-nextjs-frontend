# Accessibility Audit Checklist

## Overview

This checklist ensures the application meets WCAG 2.1 AA accessibility standards. Use it during development and before releases.

## Automated Testing

### Cypress + axe-core

```js
// tests/cypress/acceptance/accessibility/homepage.cy.js
describe('Homepage Accessibility', () => {
  it('has no accessibility violations', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

### Running Audits

```bash
# All accessibility tests
npm run test:a11y

# Watch mode
npm run test:a11y:watch
```

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

## Testing Tools

### Automated
- **axe-core** (via cypress-axe)
- **WAVE** browser extension
- **Lighthouse** accessibility audit

### Manual
- **Keyboard-only navigation** (Tab, Shift+Tab, Enter, Space, Arrow keys)
- **Screen readers**: NVDA (Windows), VoiceOver (Mac)
- **Browser zoom**: Test up to 200%
- **High contrast mode**

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

## Documentation

- [Testing Strategy](../testing.md)
- [Component Tests](./component-tests.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
