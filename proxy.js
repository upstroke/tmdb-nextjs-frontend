import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config';

/**
 * Next.js proxy that redirects requests without a locale prefix.
 *
 * Static assets, `/_next` and `/api` paths pass through untouched. Paths that
 * already start with a supported locale also pass through. All other paths are
 * redirected to the same path prefixed with a locale. The locale is picked by
 * matching the first two letters of each supported locale against the
 * `Accept-Language` header, falling back to `DEFAULT_LOCALE`.
 *
 * @param {import('next/server').NextRequest} request - Incoming request.
 * @returns {import('next/server').NextResponse} A pass-through or redirect response.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Skip non-page requests
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if pathname already has a supported locale prefix
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Detect locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const detectedLocale =
    SUPPORTED_LOCALES.find((locale) =>
      acceptLanguage.toLowerCase().includes(locale.toLowerCase().slice(0, 2))
    ) ?? DEFAULT_LOCALE;

  // Redirect to locale-prefixed URL
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)']
};
