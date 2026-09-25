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

export const metadata = {
  title: 'TMDB',
  description: 'Movies and TV Shows powered by TMDB',
};

export default function RootLayout({ children }) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <AppLocaleProvider>
          <div id="root">
            {children}
          </div>
        </AppLocaleProvider>
      </body>
    </html>
  );
}
