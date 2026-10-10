/**
 * Integration tests (jsdom): LanguageSwitcher with the real locale store, resolver,
 * i18n helpers, ui.json and AppLocaleProvider. Only next/navigation is mocked.
 * Test plan: TP-LS-001 (test case IDs TC-LS-xx are noted above each it block).
 *
 * Chain under test:
 *   <select> change -> resolveLocale -> setLocale (store + sessionStorage)
 *   -> ExternalSetterRegistrar -> React state -> useLocale / useI18n
 *   -> pathname rewrite -> router.replace
 *
 * No real navigation: page changes with reloaded data belong to Cypress (cypress/e2e).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';
import LanguageSwitcher from '../../../components/LanguageSwitcher.jsx';
import { AppLocaleProvider, LocaleSyncer } from '@/components/providers/LocaleProvider.jsx';
import { useLocale, useI18n, setLocale } from '@/lib/stores/locale.jsx';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config.js';
import { getLocaleText, getSupportedLocales } from '@/lib/i18n/helpers.js';

const STORAGE_KEY = 'app-locale';
const OTHER_LOCALES = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
const NEXT_LOCALE = OTHER_LOCALES[0];

const nav = vi.hoisted(() => ({ replace: vi.fn(), pathname: '' }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: nav.replace, push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => nav.pathname
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Probe() {
  const locale = useLocale();
  const { labels } = useI18n();
  return (
    <output data-testid="probe" data-locale={locale}>
      {labels.languageSelect}
    </output>
  );
}

function renderSwitcher(pathname = `/${DEFAULT_LOCALE}/movies/1`, extra = null) {
  nav.pathname = pathname;
  return render(
    <AppLocaleProvider>
      <LanguageSwitcher />
      <Probe />
      {extra}
    </AppLocaleProvider>
  );
}

const getSelect = () => screen.getByRole('combobox');
const probeLocale = () => screen.getByTestId('probe').getAttribute('data-locale');
const selectLocale = (value) => fireEvent.change(getSelect(), { target: { value } });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('LanguageSwitcher (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    document.documentElement.lang = '';
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  describe('options and initial state', () => {
    // TC-LS-01
    it('lists one option per supported locale with the short code as label', () => {
      renderSwitcher();

      const options = [...getSelect().querySelectorAll('option')];

      expect(options.map((option) => option.value).sort()).toEqual([...SUPPORTED_LOCALES].sort());
      expect([...getSupportedLocales()].sort()).toEqual([...SUPPORTED_LOCALES].sort());
      options.forEach((option) => {
        expect(option.textContent).toBe(option.value.split('-')[0].toUpperCase());
      });
      expect(getSelect()).toHaveValue(DEFAULT_LOCALE);
      expect(getSelect()).toHaveAttribute(
        'aria-label',
        getLocaleText(DEFAULT_LOCALE).labels.languageSelect
      );
    });

    // TC-LS-09
    it('starts with the locale stored in sessionStorage', () => {
      sessionStorage.setItem(STORAGE_KEY, NEXT_LOCALE);

      renderSwitcher();

      expect(getSelect()).toHaveValue(NEXT_LOCALE);
      expect(probeLocale()).toBe(NEXT_LOCALE);
    });
  });

  describe('switching the locale', () => {
    // TC-LS-02
    it.each(OTHER_LOCALES)(
      'replaces the locale segment in the path when switching to %s',
      (next) => {
        renderSwitcher(`/${DEFAULT_LOCALE}/movies/1`);

        selectLocale(next);

        expect(nav.replace).toHaveBeenCalledTimes(1);
        expect(nav.replace).toHaveBeenCalledWith(`/${next}/movies/1`, { scroll: false });
      }
    );

    // TC-LS-03
    it('prepends the locale when the path has no locale segment', () => {
      renderSwitcher('/movies/1');

      selectLocale(NEXT_LOCALE);

      expect(nav.replace).toHaveBeenCalledWith(`/${NEXT_LOCALE}/movies/1`, { scroll: false });
    });

    // TC-LS-04
    it('replaces the locale on a path that consists of the locale only', () => {
      renderSwitcher(`/${DEFAULT_LOCALE}`);

      selectLocale(NEXT_LOCALE);

      expect(nav.replace).toHaveBeenCalledWith(`/${NEXT_LOCALE}`, { scroll: false });
    });

    // TC-LS-05
    it('saves the selected locale in sessionStorage', () => {
      renderSwitcher();

      selectLocale(NEXT_LOCALE);

      expect(sessionStorage.getItem(STORAGE_KEY)).toBe(NEXT_LOCALE);
    });

    // TC-LS-06
    it('updates the locale state and the UI texts', () => {
      renderSwitcher();
      expect(probeLocale()).toBe(DEFAULT_LOCALE);

      selectLocale(NEXT_LOCALE);

      const { labels } = getLocaleText(NEXT_LOCALE);
      expect(probeLocale()).toBe(NEXT_LOCALE);
      expect(screen.getByTestId('probe')).toHaveTextContent(labels.languageSelect);
      expect(getSelect()).toHaveValue(NEXT_LOCALE);
      expect(getSelect()).toHaveAttribute('aria-label', labels.languageSelect);
    });

    // TC-LS-07
    it('falls back to the default locale for an unsupported value', () => {
      renderSwitcher();
      selectLocale(NEXT_LOCALE);
      expect(probeLocale()).toBe(NEXT_LOCALE);

      act(() => setLocale('xx-XX'));

      expect(probeLocale()).toBe(DEFAULT_LOCALE);
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe(DEFAULT_LOCALE);
    });
  });

  describe('URL as source of truth', () => {
    // TC-LS-08
    it('syncs store and html lang when LocaleSyncer receives a new locale', () => {
      const { rerender } = render(
        <AppLocaleProvider>
          <LocaleSyncer locale={NEXT_LOCALE} />
          <Probe />
        </AppLocaleProvider>
      );

      expect(probeLocale()).toBe(NEXT_LOCALE);
      expect(document.documentElement.lang).toBe(NEXT_LOCALE);
      expect(sessionStorage.getItem(STORAGE_KEY)).toBe(NEXT_LOCALE);

      rerender(
        <AppLocaleProvider>
          <LocaleSyncer locale={DEFAULT_LOCALE} />
          <Probe />
        </AppLocaleProvider>
      );

      expect(probeLocale()).toBe(DEFAULT_LOCALE);
      expect(document.documentElement.lang).toBe(DEFAULT_LOCALE);
    });
  });
});
