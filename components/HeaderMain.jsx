'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/stores/locale';
import TypeHeadSearch from './TypeHeadSearch';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderMain() {
  const locale = useLocale();

  return (
    <header className="header-main ui fixed menu">
      <div className="ui container">
        <Link className="header-main-logo item" href={`/${locale}`}>
          <span>🎬</span>
          <span className="header-main-logo-text">TMDB</span>
        </Link>
        <div className="right menu">
          <div className="item">
            <TypeHeadSearch />
          </div>
          <div className="item">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
