# Acceptance Tests

## Purpose and locations

Cypress tests the running application: navigation, search, detail pages, shared UI, accessibility, and security. Isolated component tests use Vitest browser mode.

- `cypress/e2e/`: application flows.
- `cypress/e2e/security/`: security scenarios.
- `cypress/accessibility/`: full-page accessibility scenarios.
- `cypress/POM/`: reusable Page Objects.
- `cypress/fixtures/` and `cypress/support/`: fixtures and setup.

The configured E2E patterns include both E2E and accessibility specs.

## Managed production runs

Stop any existing server on port 3000 before running:

```bash
npm run test:e2e
npm run test:e2e:security
npm run test:e2e:a11y
npm run test:e2e:open
```

Each command checks port 3000, runs `next build`, checks the port again, starts `next start --port 3000` with NODE_ENV=production, waits for `/en-US`, and starts Cypress. The installed start-server-and-test manages server cleanup after Cypress exits. Interactive mode retains the server while Cypress is open.

Occupied ports cause an error; existing servers are never deliberately reused or killed. Do not start another process on port 3000 during the run. The port preflight is not an exclusive reservation.

Use Chrome and pass additional Cypress CLI arguments after `--`:

```bash
npm run test:e2e -- --spec "cypress/e2e/security/routing.cy.js"
```

Do not override baseUrl with Cypress CLI flags: managed runs target `http://localhost:3000`. The runner sets CYPRESS_BASE_URL to this address, overriding an inherited environment value.

`validate:e2e` and `validate:a11y` use the same managed lifecycle without a second build. Existing `:server` commands remain aliases with the same behavior. No separate server terminal is required.

`cy:run`, `cy:run:security`, and `cy:run:a11y` are low-level Cypress-only commands. Direct Cypress invocation bypasses production startup and the occupied-port check; use managed commands for security validation.

## Data and network boundaries

A valid server-side TMDB_API_KEY is required for live-data scenarios. Preserve existing local environment configuration. Never expose the key in browser code or fixtures.

Browser requests can be intercepted with cy.intercept; server-side TMDB requests cannot. Follow each spec's test plan. Controlled external failures belong in integration tests with the external network mocked.

## Runner validation checklist

- With a dev server on port 3000, managed commands fail before building and leave that process running.
- With a free port, a single production build precedes next start and Cypress.
- A selected spec reaches the managed production server.
- Both passing and failing Cypress runs stop the managed server and propagate a nonzero result on failure.
- Closing the interactive runner stops its server.
- Build failures do not start a server or Cypress.
- Existing :server aliases and validation aliases do not duplicate builds.

These lifecycle checks require local execution; source changes alone do not establish that they pass.

## Accessibility and security

Target WCAG 2.2 AA, use the project's cy.checkPageA11y wrapper and manual audit checklist. Automated checks do not establish full conformance. Keep isolated keyboard and ARIA tests in Vitest browser mode.

Assert user-visible behavior and meaningful request outcomes, reuse Page Objects, and avoid arbitrary waits. Use cy.env rather than Cypress.env. Update the matching test plan when test behavior changes. Cypress results do not contribute to Vitest coverage.

## Related documentation

- [Testing Strategy](../testing.md)
- [Component Tests](component-tests.md)
- [Integration Tests](integration-tests.md)
- [Page Objects](page-objects.md)
- [Accessibility Test Plan](../../cypress/accessibility/accessibility-testplan.md)
- [Manual Accessibility Audit Checklist](accessibility-audit-checklist.md)
- [Security Tests](security-tests.md)
