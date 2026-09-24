'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/stores/localeStore';

export default function Header() {
  const { locale, setLocale, SUPPORTED_LOCALES } = useLocale();

  return (
    <div className="ui fixed menu">
      <div className="ui container">
        <Link href="/" className="header item">TMDB</Link>
        <Link href="/movies" className="item">Movies</Link>
        <Link href="/tv" className="item">TV Shows</Link>
        <div className="right menu">
          <div className="item">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc}
                className={`ui button ${locale === loc ? 'primary' : 'basic'} tiny`}
                onClick={() => setLocale(loc)}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
