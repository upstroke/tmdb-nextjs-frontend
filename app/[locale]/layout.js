import 'fomantic-ui-css/components/reset.css';
import 'fomantic-ui-css/components/site.css';
import 'fomantic-ui-css/components/container.css';
import 'fomantic-ui-css/components/grid.css';
import 'fomantic-ui-css/components/menu.css';
import 'fomantic-ui-css/components/header.css';
import 'fomantic-ui-css/components/card.css';
import 'fomantic-ui-css/components/list.css';
import 'fomantic-ui-css/components/button.css';
import 'fomantic-ui-css/components/label.css';
import 'fomantic-ui-css/components/icon.css';
import 'fomantic-ui-css/components/image.css';
import 'fomantic-ui-css/components/tab.css';
import 'fomantic-ui-css/components/segment.css';
import '@/styles/app.scss';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { AppLocaleProvider } from '@/components/providers/LocaleProvider';
import TrendingCacheProvider from '@/components/TrendingCacheProvider';
import HeaderMain from '@/components/HeaderMain';
import FooterMain from '@/components/FooterMain';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'TMDB',
  description: 'Movies and TV Shows powered by TMDB'
};

/**
 * Pre-renders one layout per supported locale.
 *
 * @returns {{ locale: string }[]} Route params for every supported locale.
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

/**
 * Root layout of every locale-prefixed page. Renders `html` and `body` in the
 * locale of the URL, so the server output and the first client render use the
 * same language. Unsupported locales return a 404.
 *
 * @param {object} props - Layout props.
 * @param {import('react').ReactNode} props.children - Page content.
 * @param {Promise<{ locale?: string }>} props.params - Route params with the locale segment.
 * @returns {Promise<JSX.Element>} The document with header, page and footer.
 */
export default async function LocaleLayout({ children, params }) {
  const { locale = DEFAULT_LOCALE } = await params;

  if (!SUPPORTED_LOCALES.includes(locale)) notFound();

  return (
    <html data-scroll-behavior="smooth" lang={locale}>
      <body>
        <AppLocaleProvider initialLocale={locale}>
          <TrendingCacheProvider initialLocale={locale}>
            <div id="root">
              <HeaderMain />
              {children}
              <FooterMain />
            </div>
          </TrendingCacheProvider>
        </AppLocaleProvider>
      </body>
    </html>
  );
}
