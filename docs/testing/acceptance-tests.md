# Acceptance Tests

## Purpose

Cypress acceptance tests verify the running application from the user's perspective: navigation, search, detail pages, shared UI behavior, accessibility, and security. They complement Vitest unit, integration, and browser component tests. Isolated component tests use Vitest browser mode, not Cypress component testing.

## Location

- `cypress/e2e/`: end-to-end user flows and shared application behavior.
- `cypress/e2e/security/`: manipulated input, security headers, redirects, and API key exposure.
- `cypress/accessibility/`: page-level accessibility checks and targeted keyboard, focus, contrast, and live-region scenarios.
- `cypress/POM/`: reusable Page Objects.
- `cypress/fixtures/`: Cypress-specific fixtures.
- `cypress/support/`: Cypress setup and custom commands.

The E2E spec patterns in `cypress.config.js` include both `cypress/e2e/**` and `cypress/accessibility/**`. The previous `tests/cypress/acceptance/` structure and Cypress component-runner examples do not describe the current setup.

## Running Tests

Start the application separately on `http://localhost:3000`, then run:

```bash
# All configured Cypress E2E specs, including accessibility and security
npm run test:e2e

# Interactive E2E runner
npm run test:e2e:open

# Accessibility specs only
npm run test:e2e:a11y

# Security specs only
npm run test:e2e:security

# One existing accessibility spec
npx cypress run --e2e --browser chrome --spec "cypress/accessibility/pages/page-axe.cy.js"
```

The npm scripts use Chrome. `npm run test:component` runs Vitest component tests; it is not a Cypress acceptance-test command.

## Production Validation

`npm run validate:e2e` builds the application and then runs the Cypress E2E suite. `npm run validate:a11y` builds it and then runs the accessibility suite. A build does not start a server: these commands still require a running application on `http://localhost:3000`.

For production testing, stop any existing server as needed, run `npm run build`, start the built application with `npm run start`, and run the relevant Cypress command in another terminal. Restart or rebuild after server-side changes so tests exercise the intended code.

## Data and Network Boundaries

Use Cypress fixtures and Page Objects where appropriate. Browser-originated requests can be stubbed with `cy.intercept()`, but it does not intercept server-side TMDB requests.

Accessibility checks for lists and detail pages use live TMDB data and require a valid server-side `TMDB_API_KEY`. Search scenarios can stub browser requests. Follow the relevant test plan for each spec's exact data requirements rather than assuming all tests are fully mocked. Never expose the API key in browser code or fixtures.

## Accessibility and Security

The project targets WCAG 2.2 AA. Use the accessibility test plan for automated coverage and the separate manual checklist for screen-reader, keyboard, zoom, and visual audits. Passing automated checks alone does not establish full WCAG conformance.

Keep component-level keyboard and ARIA checks in Vitest browser mode when isolation is appropriate; use Cypress for full-application behavior and cross-page flows.

Security scenarios should verify controlled handling of malformed external input and check that secrets do not reach the browser. See the security test documentation and matching test plan.

## Best Practices and Maintenance

- Assert on user-visible behavior and meaningful request/response outcomes, not implementation details.
- Prefer role, accessible-name, and text queries where possible.
- Keep tests independent and use Cypress's retryable assertions rather than arbitrary waits.
- Reuse existing Page Objects and custom commands instead of inventing parallel patterns.
- Do not use `Cypress.env()` in specs; `allowCypressEnv` is false, so use `cy.env()` when needed.
- Update the matching test plan and affected documentation whenever a test changes. Keep scenario IDs, paths, descriptions, and assertions consistent.

Cypress results are separate from Vitest coverage. `npm run check` and `npm run validate` do not run Cypress; execute the relevant browser checks separately.

## Related Documentation

- [Testing Strategy](../testing.md)
- [Component Tests](component-tests.md)
- [Integration Tests](integration-tests.md)
- [Page Objects](page-objects.md)
- [Accessibility Test Plan](../../cypress/accessibility/accessibility-testplan.md)
- [Manual Accessibility Audit Checklist](accessibility-audit-checklist.md)
- [Security Tests](security-tests.md)
