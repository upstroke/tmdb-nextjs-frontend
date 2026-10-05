# Testing Strategy

## Test Levels

This project uses four test levels, organized by business criteria rather than by tooling:

| Level                | Tool    | Path                                   | Focus                                                            |
| -------------------- | ------- | -------------------------------------- | ---------------------------------------------------------------- |
| **Unit**             | Vitest  | `tests/vitest/`                        | Isolated functions, helpers, services                            |
| **Integration**      | Vitest  | `tests/vitest/`                        | Interaction between multiple modules/services                    |
| **Component**        | Cypress | `tests/cypress/acceptance/components/` | Business acceptance of UI components against acceptance criteria |
| **Acceptance (E2E)** | Cypress | `tests/cypress/acceptance/flows/`      | Complete user flows across multiple pages                        |

## Folder Structure

```text
tests/
├── vitest/                          # Unit and integration tests
│   ├── accessibility/               # Automated a11y tests
│   ├── security/                    # Security tests (XSS, API key)
│   └── *.test.js                    # Test files
├── cypress/
│   ├── acceptance/                  # Cypress acceptance tests
│   │   ├── components/              # Component tests (Component Acceptance)
│   │   ├── flows/                   # E2E tests (Flow Acceptance)
│   │   └── accessibility/           # Interactive a11y tests
│   ├── POM/                         # Page objects (for all test levels)
│   ├── fixtures/                    # Test data
│   └── support/                     # Cypress configuration and helpers
```

## Tooling

- **Vitest** for unit and integration tests (fast, isolated tests)
- **Cypress** for component and acceptance tests (browser-based, interactive)

## Documentation

- [Unit tests](./testing/unit-tests.md)
- [Integration tests](./testing/integration-tests.md)
- [Component tests](./testing/component-tests.md)
- [Acceptance tests](./testing/acceptance-tests.md)
- [Security tests](./testing/security-tests.md)
- [Accessibility audit](./testing/accessibility-audit-checklist.md)
- [Common rules](./testing/common-rules.md)
- [Page objects](./testing/page-objects.md)
- [AI prompts](../ai-prompts.md)

## Test Pyramid

```text
        /
       /  \      Acceptance (E2E)
      /----\     Component
     /      \    Integration
    /--------\   Unit
```

- **Base**: Many fast unit tests
- **Middle**: Fewer integration tests
- **Top**: Few but valuable component and acceptance tests

## Coverage Goals

- **Vitest**: 80% globally (branches, functions, lines, statements) — enforced via `vitest.config.js`
- **Cypress**: No automated coverage, but qualitative coverage of all acceptance criteria
