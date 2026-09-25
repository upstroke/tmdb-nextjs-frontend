import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { LocaleSyncer } from '@/components/providers/LocaleProvider';
import HeaderMain from '@/components/HeaderMain';
import FooterMain from '@/components/FooterMain';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

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
