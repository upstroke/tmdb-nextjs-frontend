'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n, useLocale } from '@/lib/stores/locale';
import TypeHeadSearch from '@/components/TypeHeadSearch';

const NAV_ITEMS = [
  {
    id: 'nav-home',
    labelKey: 'home',
    icon: 'home',
    getPath: (locale) => `/${locale}`,
    storageKey: null,
    active: (pathname, locale) => pathname === `/${locale}` || pathname === `/${locale}/`,
  },
  {
    id: 'nav-movies',
    labelKey: 'movies',
    icon: 'film',
    getPath: (locale) => `/${locale}/movies`,
    storageKey: 'movies-page',
    active: (pathname, locale) => pathname.startsWith(`/${locale}/movies`),
  },
  {
    id: 'nav-tv',
    labelKey: 'tvShows',
    icon: 'tv',
    getPath: (locale) => `/${locale}/tv-shows`,
    storageKey: 'tv-shows-page',
    active: (pathname, locale) => pathname.startsWith(`/${locale}/tv-shows`),
  },
];

export default function HeaderMain() {
  const locale = useLocale();
  const { labels, titles } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = NAV_ITEMS.map((item) => ({
    id: item.id,
    label: item.labelKey,
    icon: item.icon,
    path: item.getPath(locale),
    storageKey: item.storageKey ?? '',
    active: (p) => item.active(p, locale),
  }));

  function getStoredPage(key) {
    if (typeof window === 'undefined' || !key) return 1;
    try { return Math.max(1, Number(sessionStorage.getItem(key) ?? '1') || 1); } catch { return 1; }
  }

  function getNavHref(path, storageKey) {
    const storedPage = getStoredPage(storageKey);
    return storedPage > 1 ? `${path}?page=${storedPage}` : path;
  }

  function resolveLabel(label) {
    return titles[label] ?? labels[label] ?? label;
  }

  return (
    <header className="header" id="menuHeader">
      <button
        className="burger-icon"
        type="button"
        aria-label={labels.navigationToggle}
        aria-expanded={menuOpen ? 'true' : 'false'}
        aria-controls="navmenu"
        onPointerDown={() => setMenuOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>
      <div className="nav-wrapper">
        <nav id="navmenu" aria-label={labels.mainNavigation}>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="nav-item" id={item.id}>
                <Link
                  className={item.active(pathname) ? 'link-active' : undefined}
                  href={getNavHref(item.path, item.storageKey)}
                  aria-current={item.active(pathname) ? 'page' : undefined}
                >
                  <i className={`${item.icon} icon`} aria-hidden="true" />
                  <span className="text-node">{resolveLabel(item.label)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <TypeHeadSearch />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
