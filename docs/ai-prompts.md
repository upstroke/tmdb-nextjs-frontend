# AI Prompts for Testing

These prompts help AI coding assistants generate correct tests for this project.

## Context for AI Assistants

Use this information to generate tests in the correct style and location:

### Test Levels and Paths

| Level            | Tool    | Path                                   | File Extension |
| ---------------- | ------- | -------------------------------------- | -------------- |
| Unit             | Vitest  | `tests/vitest/`                        | `.test.js`     |
| Integration      | Vitest  | `tests/vitest/`                        | `.test.js`     |
| Component        | Cypress | `tests/cypress/acceptance/components/` | `.cy.js`       |
| Acceptance (E2E) | Cypress | `tests/cypress/acceptance/flows/`      | `.cy.js`       |

### Important Rules

1. **Unit tests**: Isolated functions, no DOM interactions
2. **Integration tests**: Interaction between multiple modules, optionally with mocked services
3. **Component tests**: Business acceptance against acceptance criteria, Cypress Component Testing
4. **Acceptance tests**: Complete user flows, Cypress E2E with page objects

## Prompt: Generate a Unit Test

```text
Create a unit test for this function in the Vitest style.

- Path: `tests/vitest/<appropriate-folder>/<function>.test.js`
- Use `describe`, `it`, and `expect` from Vitest
- Mock external dependencies using `vi.fn()`
- Test edge cases and error cases
```

## Prompt: Generate an Integration Test

```text
Create an integration test for this module in the Vitest style.

- Path: `tests/vitest/<appropriate-folder>/<module>.test.js`
- Test the interaction with dependent modules
- Use real dependencies where sensible; mock only external services (API, database)
```

## Prompt: Generate a Component Test (Acceptance)

```text
Create a component test in the Cypress Component Testing style.

- Path: `tests/cypress/acceptance/components/<component>.cy.js`
- Use `cy.mount()` and Cypress queries (`cy.findByRole`, `cy.findByText`)
- Each test corresponds to one acceptance criterion (AC) from the user story
- Describe tests in business language ("displays the title according to AC-1")
- Check accessibility (ARIA labels, keyboard interaction)
```

## Prompt: Generate an Acceptance Test (E2E)

```text
Create an E2E test in the Cypress style.

- Path: `tests/cypress/acceptance/flows/<user-flow>.cy.js`
- Use page objects from `tests/cypress/POM/`
- Test complete user flows (e.g., "search for a movie → open details → add it to the watchlist")
- Use `cy.visit()` and `cy.intercept()` for API mocks
- Check visible elements and navigation
```

## Prompt: Generate a Page Object

```text
Create a page object for this page/component.

- Path: `tests/cypress/POM/<page>.js`
- Export a class or object containing queries and actions
- Use `cy.findByRole` and `cy.findByText` for stable selectors
- Encapsulate complex interactions in methods
- Use JavaScript (`.js`), not TypeScript
```

## Prompt: Generate an Accessibility Test

```text
Create an accessibility test for this component.

- For automated tests: Vitest + axe-core in `tests/vitest/accessibility/`
- For interactive tests: Cypress in `tests/cypress/acceptance/components/` or `tests/cypress/acceptance/flows/`
- Check ARIA labels, keyboard navigation, contrast, and screen-reader compatibility
```
