/**
 * MSW Node.js server for Vitest.
 *
 * Lifecycle is managed globally in tests/setup/vitest.js:
 *   beforeAll  → server.listen()
 *   afterEach  → server.resetHandlers()  (removes per-test overrides)
 *   afterAll   → server.close()
 *
 * Per-test overrides:
 *   import { server } from '$tests/mocks/msw.server.js';
 *   import { tmdbErrorHandler } from '$tests/mocks/msw.handlers.js';
 *
 *   it('handles 503', () => {
 *     server.use(tmdbErrorHandler('/api/en-US/movies', 503));
 *     // ... test ...
 *   });
 */

import { setupServer } from 'msw/node';
import { handlers } from './msw.handlers.js';

export const server = setupServer(...handlers);
