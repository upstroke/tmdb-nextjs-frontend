/**
 * Unit tests for lib/stores/locale.jsx.
 * Tests cover the pure helper functions and the external setter mechanism.
 * React hooks (useLocale, useSetLocale, useI18n) and LocaleProvider require
 * a React test environment and are excluded here.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock React so the module can be imported in a non-browser environment.
vi.mock('react', () => ({
  createContext: () => ({ Provider: ({ children }) => children }),
  useContext: vi.fn(() => ({ locale: 'en-US', setLocale: vi.fn() })),
  useState: vi.fn((init) => {
    const val = typeof init === 'function' ? init() : init;
    return [val, vi.fn()];
  }),
  useEffect: vi.fn(),
  useCallback: vi.fn((fn) => fn),
}));

import { setLocale, _registerExternalSetter } from '@/lib/stores/locale.jsx';

describe('_registerExternalSetter / setLocale', () => {
  beforeEach(() => {
    // Reset the external setter before each test.
    _registerExternalSetter(null);
  });

  afterEach(() => {
    _registerExternalSetter(null);
  });

  it('does not throw when no setter is registered', () => {
    expect(() => setLocale('de-DE')).not.toThrow();
  });

  it('calls the registered setter with the resolved locale', () => {
    const mockSetter = vi.fn();
    _registerExternalSetter(mockSetter);
    setLocale('de-DE');
    expect(mockSetter).toHaveBeenCalledWith('de-DE');
  });

  it('falls back to DEFAULT_LOCALE for an unknown locale', () => {
    const mockSetter = vi.fn();
    _registerExternalSetter(mockSetter);
    setLocale('ja-JP');
    expect(mockSetter).toHaveBeenCalledWith('en-US');
  });

  it('falls back to DEFAULT_LOCALE for null', () => {
    const mockSetter = vi.fn();
    _registerExternalSetter(mockSetter);
    setLocale(null);
    expect(mockSetter).toHaveBeenCalledWith('en-US');
  });

  it('replaces the setter when _registerExternalSetter is called again', () => {
    const first = vi.fn();
    const second = vi.fn();
    _registerExternalSetter(first);
    _registerExternalSetter(second);
    setLocale('fr-FR');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('fr-FR');
  });
});
