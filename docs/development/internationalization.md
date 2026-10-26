# Internationalization

Translation catalogs for UI text and rating formats are stored in:

- `lib/i18n/ui.json`
- `lib/i18n/ratings.json`

Locale logic is located in:

- `lib/i18n/config.js` for locale configuration (default and supported locales)
- `lib/i18n/helpers.js` for text lookup and fallbacks
- `lib/i18n/resolver.js` for resolving the active locale per request

The current route is preserved when the language changes.

Locale information must be propagated through internal navigation and server-side TMDB requests.
