import '../styles/app.scss';

export const metadata = {
  title: 'TMDB',
  description: 'Movies and TV Shows powered by TMDB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
