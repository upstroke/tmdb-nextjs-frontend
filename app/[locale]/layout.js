import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { AppLocaleProvider } from '@/components/providers/LocaleProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale = DEFAULT_LOCALE } = await params;

  if (!SUPPORTED_LOCALES.includes(locale)) notFound();

  return (
    <AppLocaleProvider initialLocale={locale}>
      <Header />
      {children}
      <Footer />
    </AppLocaleProvider>
  );
}
