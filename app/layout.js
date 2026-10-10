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
import '../styles/app.scss';
import { AppLocaleProvider } from '@/components/providers/LocaleProvider';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

export const metadata = {
  title: 'TMDB',
  description: 'Movies and TV Shows powered by TMDB'
};

/**
 *
 * @param root0
 * @param root0.children
 * @param root0.params
 */
export default async function RootLayout({ children, params }) {
  const { locale } = (await params) ?? {};
  const lang = locale ?? DEFAULT_LOCALE;

  return (
    <html data-scroll-behavior="smooth" lang={lang}>
      <body>
        <AppLocaleProvider>
          <div id="root">{children}</div>
        </AppLocaleProvider>
      </body>
    </html>
  );
}
