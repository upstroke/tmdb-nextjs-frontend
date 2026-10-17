# Test Plan — TabGroupe

## Test Object

`components/TabGroupe.jsx`

The component implements an accessible tab group for season episode lists on TV show detail
pages.

## Test Level

Component test (Vitest browser test).

## Test File

`vitest/component/tabgroupe/TabGroupe.browser.test.jsx`

## Test Approach

The tests verify the accessible tab pattern and keyboard behaviour of the component in isolation.
They focus on user-visible and assistive-technology-relevant behaviour: roles, accessible names,
selection state, roving tabindex, focus movement, panel association, loading state and fallback
content.

## Test Cases

| ID | Title | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| TC-TG-01 | Renders tab list and default active panel | The component is rendered with four tabs; the first tab contains two episodes | Inspect the tablist, active tab, inactive tabs and active panel | The tablist has an accessible name. The first tab has `aria-selected="true"` and `tabindex="0"`. Inactive tabs have `tabindex="-1"` and `aria-selected="false"`. The first panel shows its episode content. Clicking the second tab selects it, calls `onTabSelect` with its id and shows its episode content. |
| TC-TG-02 | Supports keyboard navigation across tabs | The component is rendered with four tabs and the first tab is active | Press `ArrowRight`, `End`, `Home`, `ArrowLeft` and `ArrowRight`; then press an unmapped key | `ArrowRight` selects and focuses the next tab. `End` selects and focuses the last tab. `Home` selects and focuses the first tab. `ArrowLeft` and `ArrowRight` wrap around at the boundaries. An unmapped key does not change the selection. |
| TC-TG-02a | Wraps from the first to the last tab | The first tab is active and focused | Press `ArrowLeft` | The last tab becomes selected and receives focus. |
| TC-TG-02b | Wraps from the last to the first tab | The last tab is active and focused | Press `ArrowRight` | The first tab becomes selected and receives focus. |
| TC-TG-03 | Supports keyboard navigation in the episode list | The component is rendered with an active tab containing two episodes | Press `ArrowDown`, `ArrowUp`, `End`, `Home` and an unmapped key | `ArrowDown` moves focus to the next episode. `ArrowUp` moves focus to the previous episode. `End` moves focus to the last episode. `Home` moves focus to the first episode. Navigation wraps around at the list boundaries. An unmapped key does not move focus. |
| TC-TG-04 | Handles loading and fallback states | The component is rendered with a loading tab and a tab with plain-text content | Open the loading tab, then open the fallback tab | The loading tab shows the loading message. The fallback tab shows its plain-text content. |

## Covered Accessibility Criteria

- ARIA tab pattern: `tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls` and
  `aria-labelledby`.
- Roving tabindex: only the active tab is part of the tab sequence.
- Keyboard operation: Arrow Left/Right, Home and End for tab navigation; Arrow Up/Down, Home and
  End for episode navigation.
- Focus management: the selected tab and the targeted episode receive focus.
- Panel association: each tab is connected to its panel and each panel is labelled by its tab.
- Status communication: the loading state is exposed through a polite live region.

## Coverage Note

The component-level accessibility behaviour of `TabGroupe` is covered by this Vitest browser test.
Cypress remains responsible for page-level accessibility checks, including the hover and focus
contrast of season tabs (A11Y-24 and A11Y-25).
