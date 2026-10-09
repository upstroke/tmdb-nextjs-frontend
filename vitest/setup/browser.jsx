// vitest/setup/browser.jsx
import React from 'react';
import '@testing-library/jest-dom/vitest';

// Polyfill für process.env
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'test',
      TMDB_API_KEY: 'test-key'
    }
  };
}

// Eine einfache, valide React-Komponente für den Link-Mock
const MockLink = ({ children, href, ...props }) => {
  return React.createElement('a', { href, ...props }, children);
};

// Komponente für den Image-Mock
const MockImage = ({ src, alt, ...props }) => {
  return React.createElement('img', { src, alt, ...props });
};

// Next.js Link mit doppeltem Interop-Schutz mocken
vi.mock('next/link', () => ({
  default: MockLink,
  __esModule: true
}));

// Next.js Image mocken
vi.mock('next/image', () => ({
  default: MockImage,
  __esModule: true
}));

// Next-Intl mocken
vi.mock('next-intl', () => ({
  useTranslations: () => ({
    t: (key) => key,
    rich: (key) => key
  }),
  __esModule: true
}));

// Next/Router (Pages Router) mocken
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    replace: vi.fn()
  }),
  __esModule: true
}));

// Next/Navigation (App Router) mocken
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  __esModule: true
}));
