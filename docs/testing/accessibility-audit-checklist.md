# Manual Accessibility Audit Checklist

## Purpose

Use this checklist for manual checks against the project's WCAG 2.2 AA accessibility goal. It complements automated tests; completing it or passing axe checks alone does not establish full WCAG conformance. Unchecked items are not evidence of a successful audit.

## Automated Coverage

The [Accessibility Test Plan](../../cypress/accessibility/accessibility-testplan.md) is the source of truth for automated scenarios, spec files, data requirements, and execution instructions. Its Covered in Vitest section documents component-level coverage for TabGroupe, TypeHeadSearch, and the skip link. Cypress covers page-level and full-application accessibility behavior. Do not duplicate the scenario inventory here.

See [Testing Strategy](../testing.md) for runner configuration and commands.

## Audit Record

For each audit, record the date, commit or release, tested routes and locales, browser and operating system, assistive technology, viewport or zoom settings, and results. Record failures with reproduction steps and issue references. Mark non-applicable checks with a reason rather than checking them as passed.

## Keyboard Navigation

- [ ] All interactive controls are reachable and operable using the keyboard.
- [ ] Tab and Shift+Tab follow a logical order.
- [ ] Focus indicators are visible and focused controls are not entirely obscured.
- [ ] No keyboard traps occur; modal focus remains inside the dialog until it closes.
- [ ] Skip links become visible on focus and move focus to main content.
- [ ] Dialog opening, closing, and focus restoration behave appropriately.
- [ ] Search results and season tabs support their documented keyboard interactions.
- [ ] Loading additional results and changing language preserve or move focus appropriately.

## Screen Reader Checks

- [ ] Test representative routes with VoiceOver on macOS and/or NVDA on Windows; record the actual combinations used.
- [ ] Page titles, document language, landmarks, and headings provide useful orientation.
- [ ] Informative images have meaningful alternatives; decorative images do not add noise.
- [ ] Inputs, buttons, links, and custom controls have meaningful accessible names.
- [ ] Roles, states, and relationships of search results, tabs, and dialogs are conveyed correctly.
- [ ] Search counts, empty results, errors, and loading states are announced without unnecessary repetition.
- [ ] Both en-US and de-DE provide understandable labels and announcements.

## Visual and Responsive Checks

- [ ] Normal text has a contrast ratio of at least 4.5:1; large text at least 3:1.
- [ ] Required visual information in controls and states has sufficient non-text contrast.
- [ ] Color is not the only way information is conveyed.
- [ ] Resting, hover, focus, selected, and error states remain understandable.
- [ ] Text can be resized to 200% without loss of content or functionality.
- [ ] At a viewport width of 320 CSS pixels, content reflows without two-dimensional scrolling except where essential. Test zoom separately; a narrow viewport is not itself a zoom test.
- [ ] User text-spacing adjustments do not hide or truncate essential content or controls.
- [ ] Forced-colors or high-contrast settings preserve readable content and identifiable controls.
- [ ] Interactive targets satisfy applicable WCAG 2.2 AA target-size requirements or a documented exception.

## Content and Interaction

- [ ] Link text describes its purpose in context.
- [ ] Labels and instructions are understandable.
- [ ] Errors are identified in text and associated with the affected input where applicable.
- [ ] Required fields are identified where applicable.
- [ ] Headings, lists, and tables use appropriate semantics.
- [ ] Hover or focus content is dismissible, hoverable, and persistent where required.
- [ ] Pointer interactions have keyboard alternatives; dragging has a non-dragging alternative where applicable.
- [ ] Motion and any automatically updating content do not prevent use; relevant pause or stop controls are available where needed.

## Results and Follow-up

Document observed behavior, not only checkbox completion. Link failures to issues and record retest results after fixes. Keep automated coverage changes in the accessibility test plan and matching specs rather than maintaining a second inventory here.

## Related Documentation

- [Accessibility Test Plan](../../cypress/accessibility/accessibility-testplan.md)
- [Testing Strategy](../testing.md)
- [Component Tests](component-tests.md)
- [Acceptance Tests](acceptance-tests.md)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
