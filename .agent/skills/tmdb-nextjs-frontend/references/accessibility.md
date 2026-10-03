# Accessibility reference

Accessibility requirements apply to every user-facing change.

## Baseline checks

- Semantic HTML is used before ARIA.
- Interactive elements are reachable and operable by keyboard.
- Focus is visible and logically ordered.
- Controls have accessible names.
- Form fields have associated labels.
- Errors and status changes are announced appropriately.
- Color is never the only means of conveying information.
- Headings and landmarks follow a logical structure.
- Images have appropriate alternative text.
- Motion respects reduced-motion preferences.

## Component-specific checks

For dialogs and overlays:

- Move focus into the component when opened.
- Keep focus within the component while modal.
- Restore focus to the trigger when closed.
- Support Escape where appropriate.
- Announce the dialog purpose and state.

For navigation and menus:

- Preserve predictable tab order.
- Ensure current page or selected state is communicated.
- Ensure expandable controls expose expanded and collapsed state.

For dynamic content:

- Announce loading, success, and error states where users need them.
- Avoid unexpected focus loss.
- Preserve context when lists, filters, or search results update.

## Audit workflow

1. Test with keyboard only.
2. Inspect semantic structure and accessible names.
3. Test relevant screen-reader announcements.
4. Check color contrast and visual focus.
5. Test reduced-motion behavior.
6. Add automated coverage for repeatable behavior.
7. Record remaining manual checks and known limitations.
