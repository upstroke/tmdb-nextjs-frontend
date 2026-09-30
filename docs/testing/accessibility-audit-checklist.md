# Accessibility Audit Checklist for JavaScript

**Goal:** This checklist supports a repeatable frontend audit according to WCAG 2.2 AA. It combines automated checks with manual testing for critical user journeys.

> An automated scan is not a complete accessibility audit. Additionally check keyboard, screen reader, zoom/reflow, and the actual understandability of content.

---

## 1. Prepare the Audit

- [ ] Define audit goal: WCAG 2.2 AA (or the binding requirement for the product)
- [ ] Define relevant browsers and devices: at least Chromium, Firefox, WebKit/Safari
- [ ] Select critical user journeys, e.g. sign in, search, submit form, purchase/checkout, edit account
- [ ] Capture representative states: empty, loading, success, error, unauthorized
- [ ] Provide test data containing realistic long texts, special characters, and validation errors
- [ ] Document findings with URL/route, component, reproduction steps, WCAG criterion, impact, priority, and fix suggestion

## 2. Automated Baseline Checks

### Locally in the Browser

- [ ] Run Lighthouse Accessibility in Chrome DevTools
- [ ] Use axe DevTools or WAVE for quick checks
- [ ] Do not blindly accept findings: reproduce and evaluate each finding

### E2E with Cypress and cypress-axe

- [ ] Run axe checks at least for each central route
- [ ] Also check states after interactions: modal open, menu open, forms with errors, toasts, loading states
- [ ] If exceptions are intentionally necessary, document them specifically; do not disable rules globally
- [ ] Run a11y E2E tests in pull requests and before releases

### Component and Unit Tests

- [ ] Test components via roles and accessible names (`getByRole`, `getByLabelText`)
- [ ] For icon buttons, ensure a visible or programmatic name is present
- [ ] Cover error texts, status messages, and dialog titles as test cases
- [ ] Test reusable components like modal, dropdown, tabs, combobox, and date picker especially intensively

## 3. Semantics and Structure

- [ ] Set `lang` on the root `html` and adapt it on language change
- [ ] Provide exactly one meaningful main content area per page with `<main>`
- [ ] Use landmarks meaningfully: `<header>`, `<nav>`, `<main>`, `<footer>`, and optionally `<aside>`
- [ ] Heading hierarchy is logical; headings are not chosen only for their visual style
- [ ] One `<h1>` describes the main purpose of the page
- [ ] Use native HTML elements: `<button>` for actions, `<a>` for navigation, `<input>`/`<select>`/`<textarea>` for forms
- [ ] Do not use clickable `<div>` or `<span>` when a native element is possible
- [ ] Lists are marked up as `<ul>`, `<ol>`, or `<dl>`
- [ ] Use tables only for tabular data; mark up table headers and relationships correctly
- [ ] Iframes have a meaningful `title`

## 4. Keyboard and Focus

- [ ] All interactive elements are reachable exclusively via keyboard
- [ ] Tab order follows the visual and content order
- [ ] Focus is always clearly visible and not obscured by layout/overlays
- [ ] Buttons work with `Enter` and, where appropriate, `Space`
- [ ] Links can be activated with `Enter`
- [ ] There is no keyboard trap; focus can leave every component again
- [ ] A skip link allows skipping repeated navigation to the main content
- [ ] When opening a dialog, focus moves meaningfully into the dialog
- [ ] A modal dialog constrains focus to its content
- [ ] When closing a dialog, focus returns to the triggering element
- [ ] Escape closes dialogs, popovers, or menus when this matches the expected interaction pattern
- [ ] After client-side navigation, the new page content receives meaningful focus or is clearly announced


## 5. Forms and Validation

- [ ] Every input field has a visible `<label>` or a reliable accessible name
- [ ] Placeholder never replaces a label
- [ ] Required fields are recognizable both visually and programmatically, e.g. via `required`
- [ ] Help texts are associated with the field, e.g. via `aria-describedby`
- [ ] Errors are described in an immediately understandable way, not only marked by color
- [ ] Errors are programmatically associated with the affected field (`aria-describedby`, `aria-invalid`)
- [ ] After invalid submission, errors are summarized and/or focus is moved to the first error
- [ ] Success and status messages are announced to screen readers (`role="status"` or appropriate `aria-live`)
- [ ] Input format and expected data are clearly described before submission
- [ ] Time limits are avoidable, extendable, or announced in good time before expiry


## 6. Images, Media, and Content

- [ ] Informative images have a precise, purpose-related alt text
- [ ] Decorative images are marked with empty `alt=""` or implemented as CSS decoration
- [ ] Image links and image buttons have an accessible name that explains their action or destination
- [ ] Videos have captions; relevant audio content has a transcript or equivalent alternative
- [ ] Autoplay audio is avoided or made reliably controllable
- [ ] No information is conveyed exclusively via color, shape, position, or sound
- [ ] Link texts are understandable outside their immediate context; avoid "click here"
- [ ] Language is clear and error messages name a concrete solution or next action

## 7. Visual Design and Responsive Behavior

- [ ] Normal text achieves at least 4.5:1 contrast against the background
- [ ] Large text and UI components achieve at least 3:1 contrast where the WCAG criterion applies
- [ ] Placeholder, disabled states, focus indicators, and error messages are separately checked for sufficient recognizability
- [ ] At 200% browser zoom, the page remains usable without loss of functionality
- [ ] At strong zoom or narrow viewport width, horizontal scroll for normal text is largely avoidable
- [ ] Text can be enlarged without content being clipped or overlaid
- [ ] Touch targets have sufficient size and spacing, especially for icon buttons
- [ ] Animations and motion can be reduced (`prefers-reduced-motion`)
- [ ] Hover-only information is also reachable and dismissible via keyboard

```css
:focus-visible {
  outline: 3px solid CanvasText;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 8. Dynamic Interfaces

- [ ] Loading states describe what is happening; purely visual spinners are not sufficient
- [ ] Async updates are announced appropriately without flooding screen reader users with messages
- [ ] Live regions contain only the changed, relevant information
- [ ] Route changes, filters, pagination, and search results have understandable feedback
- [ ] Accordions, tabs, menus, and comboboxes follow expected keyboard patterns
- [ ] Visually shown and hidden content remains consistent with focus, screen reader tree, and operability
- [ ] Do not use ARIA when native HTML already provides semantics and interaction
- [ ] Use ARIA roles, states, and properties only supplementarily and correctly

## 9. Screen Reader Testing

### VoiceOver on macOS

- [ ] Turn on VoiceOver: `Cmd + F5`
- [ ] Navigate through content with `Control + Option + Arrow keys`
- [ ] Check whether headings, landmarks, links, buttons, forms, and error messages are announced understandably

### NVDA on Windows

- [ ] Additionally check critical journeys with NVDA and a supported browser
- [ ] Test browse and focus modes on complex controls
- [ ] Check whether dynamic changes, dialog titles, and error messages are announced

### Questions for Every Flow

- [ ] Is the page purpose immediately understandable?
- [ ] Are controls announced with role, name, and state?
- [ ] Are groups, relationships, and instructions comprehensible?
- [ ] Can the flow be completed successfully without visual information?

## 10. Release Gate

- [ ] Linting and automated a11y tests are green in CI
- [ ] Critical user journeys have been tested via keyboard
- [ ] Critical user journeys have been tested at least with VoiceOver or NVDA
- [ ] Zoom/reflow, contrast, and reduced motion have been checked
- [ ] Severe findings (blocker/critical) are fixed before release or explicitly risk-assessed
- [ ] Exceptions have ticket, owner, rationale, workaround, and target date
- [ ] Fixes have been re-validated against the original finding

## 11. Finding Template

| Field             | Content                                           |
|-------------------|---------------------------------------------------|
| ID                | Unique identifier, e.g. `A11Y-023`                |
| Route / Component | Affected URL, flow, and component                 |
| Description       | What happens and why is it a barrier?             |
| Reproduction      | Concrete steps, browser, and assistive technology |
| Expectation       | Accessible target behavior                        |
| WCAG              | Success criterion and level, e.g. 2.4.7 AA        |
| Impact            | Affected user group and practical consequence     |
| Priority          | Blocker, high, medium, or low                     |
| Fix               | Concrete, verifiable change suggestion            |
| Owner / Status    | Responsible person and processing status          |
| Validation        | Date, test method, and result after the fix       |

## Short Routine per Pull Request

- [ ] Semantic HTML instead of generic containers for interaction
- [ ] New interactive elements are fully operable via keyboard
- [ ] Accessible names for buttons, inputs, and icons are present
- [ ] Visible focus is present
- [ ] Forms: labels, help texts, and error association are present
- [ ] New images and media have appropriate text alternatives
- [ ] Contrasts checked
- [ ] axe/Cypress test added or updated for the affected flow
- [ ] For dynamic changes: focus and screen reader announcement checked
