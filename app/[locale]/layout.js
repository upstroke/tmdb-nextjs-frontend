import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { LocaleSyncer } from '@/components/providers/LocaleProvider';
import HeaderMain from '@/components/HeaderMain';
import FooterMain from '@/components/FooterMain';
import { notFound } from 'next/navigation';

/**
 * Pre-renders the layout for every supported locale.
 *
 * @returns {{ locale: string }[]} One params object per supported locale.
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

/**
 * Layout for all pages below `/[locale]`. Renders the header and footer around
 * the page and syncs the route locale into the locale store.
 *
 * Responds with a 404 when the `locale` param is not a supported locale.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Page content to render between header and footer.
 * @param {Promise<{ locale?: string }>} props.params - Route params (async in Next.js 15+).
 * @returns {Promise<JSX.Element>}
 */
export default async function LocaleLayout({ children, params }) {
  const { locale = DEFAULT_LOCALE } = await params;

  if (!SUPPORTED_LOCALES.includes(locale)) notFound();

  return (
    <>
      <LocaleSyncer locale={locale} />
      <HeaderMain />
      {children}
      <FooterMain />
    </>
  );
}
