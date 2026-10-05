# TMDB Accessibility Skill

## Purpose

This skill enables the AI agent to write and maintain accessibility tests for the TMDB Next.js frontend. It ensures the application is usable by people with disabilities and complies with WCAG 2.1 AA standards.

## Scope

- Automated accessibility testing (axe-core)
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast checks
- Focus management
- ARIA attributes validation

## Capabilities

### 1. Write Accessibility Tests (axe-core)

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

### 2. Test Keyboard Navigation

```js
// tests/cypress/acceptance/accessibility/keyboard.cy.js
describe('Keyboard Navigation', () => {
  it('navigates with Tab key', () => {
    cy.visit('/');
    cy.tab().tab().tab();
    cy.focused().should('have.attr', 'data-testid', 'search-input');
  });

  it('activates buttons with Enter', () => {
    cy.visit('/');
    cy.findByRole('button', { name: /search/i }).focus();
    cy.realPress('Enter');
    cy.findByTestId('search-results').should('exist');
  });
});
```

### 3. Test Screen Reader Support

```js
// tests/cypress/acceptance/accessibility/screen-reader.cy.js
describe('Screen Reader Support', () => {
  it('has accessible labels', () => {
    cy.visit('/');
    cy.findByLabelText(/search movies/i).should('exist');
  });

  it('announces dynamic content', () => {
    cy.visit('/');
    cy.findByRole('searchbox').type('Inception{enter}');
    cy.findByRole('status').should('contain', 'Loading');
  });
});
```

### 4. Test Color Contrast

```js
// tests/cypress/acceptance/accessibility/contrast.cy.js
describe('Color Contrast', () => {
  it('meets WCAG AA contrast requirements', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: ['color-contrast'],
    });
  });
});
```

## Accessibility Checklist

### Development

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Errors are announced to screen readers
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast (4.5:1 for normal text)
- [ ] Headings are in logical order
- [ ] Links have descriptive text
- [ ] Dynamic content updates are announced

### Testing

- [ ] Run axe-core on every page
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Test zoom up to 200%
- [ ] Test in high contrast mode

## Scripts

```bash
# Accessibility audit
npm run test:a11y

# Accessibility tests in watch mode
npm run test:a11y:watch
```

## Tools

- **axe-core**: Automated accessibility testing
- **@testing-library/cypress**: Semantic queries
- **cypress-real-events**: Real keyboard/mouse events

## Documentation

- **Accessibility Checklist**: [`docs/testing/accessibility-audit-checklist.md`](../../docs/testing/accessibility-audit-checklist.md)
- **Testing Strategy**: [`docs/testing.md`](../../docs/testing.md)

## When to Use

Use this skill when:
- Adding new components
- Creating new pages
- Modifying existing UI
- Fixing accessibility bugs
- Preparing for accessibility audit
