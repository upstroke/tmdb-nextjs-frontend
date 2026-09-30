import '@testing-library/jest-dom';
import { server } from '../mocks/msw.server.js';

// Start MSW server before all tests, reset per-test overrides after each,
// and shut down cleanly when the suite finishes.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
