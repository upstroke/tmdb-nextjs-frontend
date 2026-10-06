# Component Tests

Component tests are located in `tests/cypress/component/` and are run with Cypress Component Testing.

## Configuration

### Vite Configuration Files

This project requires **two separate Vite configuration files** due to limitations in Cypress's Vite DevServer:

1. **`vitest.config.js`** – Used by Vitest for Unit and Integration tests (ESM)
2. **`vite.config.js`** – Used by Cypress Component Testing (ESM)

### Why Two Config Files?

Cypress Component Testing uses the `@cypress/vite-dev-server` package, which:

- Searches hardcoded for `vite.config.*` in the project root
- Does not automatically detect or load `vitest.config.js`
- Requires a separate Vite config even though both configs use identical plugins and aliases

This is a **known limitation** of Cypress 13.x and has been reported by the community. The Cypress team is aware of this overhead, but as of version 13.17.0, there is no built-in solution to share a single config file between Vitest and Cypress.

### Config Structure

Both files export the same core configuration:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './',
      '$tests': './tests',
    },
  },
});
```

The `vitest.config.js` additionally wraps this in a `test: { ... }` configuration for Vitest-specific settings.

## Running Component Tests

```bash
npm run test:component
```

## When to Use Component Tests

Component tests are ideal for:

- Testing individual React components in isolation
- Verifying component behavior with different props and states
- Testing user interactions within a single component
- Faster feedback than Acceptance tests (no full app boot required)

## When to Use Acceptance Tests Instead

- **Acceptance Tests** (`tests/cypress/acceptance/flows/`): Complete user flows, navigation, full app behavior
- **Integration Tests** (`tests/unit/routes/`): API route handlers with service integration (Vitest)
- **Unit Tests** (`tests/unit/`): Isolated utility functions, services, stores (Vitest)

## Related Documentation

- [Testing Overview](../testing.md) – Complete testing strategy
- [Unit Tests](unit-tests.md) – Vitest unit testing
- [Integration Tests](integration-tests.md) – Vitest route handler testing
- [Acceptance Tests](acceptance-tests.md) – Cypress flow testing
