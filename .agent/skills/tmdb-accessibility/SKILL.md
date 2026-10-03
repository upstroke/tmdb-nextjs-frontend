---
name: tmdb-accessibility
description: Implement, review, or test accessibility in the TMDB Next.js frontend, including keyboard behavior, focus management, semantics, ARIA, screen-reader support, and accessibility audits.
version: 0.1.0
---

# TMDB accessibility

## Use this skill

Use this skill for every change to interactive UI, forms, navigation, dynamic
content, dialogs, menus, search, media controls, page structure, or visible
status and error messages.

Read `docs/testing/accessibility-audit-checklist.md` before editing. Inspect
the affected component, its keyboard behavior, nearby tests, and similar
accessible components already in the repository.

## Workflow

1. Identify the user interaction, semantic structure, and dynamic state being
   changed.
2. Use native HTML controls and semantics before adding ARIA.
3. Ensure all functionality works with keyboard-only operation.
4. Verify visible focus, logical tab order, accessible names, labels, and
   descriptions.
5. For dynamic content, ensure loading, success, validation, and error changes
   are perceivable without relying on color, animation, or pointer input.
6. For dialogs, menus, popovers, tabs, and disclosures, verify the component’s
   roles, state, focus movement, Escape behavior where applicable, and focus
   restoration.
7. Add automated coverage for repeatable behavior and state remaining manual
   audit steps.
8. Run relevant project tests and report actual outcomes.

## Constraints

- Do not use `div` or `span` as a substitute for a native interactive element.
- Do not add ARIA that duplicates or conflicts with native semantics.
- Do not remove visible focus or trap keyboard users.
- Do not use color as the only state or error indicator.
- Do not assume an automated check replaces keyboard and screen-reader review.
- Respect reduced-motion preferences for nonessential motion.

## Completion report

Report semantic and keyboard decisions, focus behavior, automated tests run,
manual checks performed or still required, and any known accessibility risk.
