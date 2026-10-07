import ui from '@/lib/i18n/ui.json';

const enUS = ui.locales['en-US'];

/**
 * Default i18n mock for en-US.
 * Matches the shape returned by getLocaleText() / useI18n().
 * Values are imported directly from lib/i18n/ui.json — no duplication.
 *
 * @type {import('@/lib/i18n/resolver.js').LocaleText}
 */
export const i18nMockDefault = {
  locale: 'en-US',
  labels: enUS.labels,
  messages: enUS.messages,
  titles: enUS.titles,
  buttons: enUS.buttons,
  formats: enUS.formats,
  fallbacks: enUS.fallbacks
};
