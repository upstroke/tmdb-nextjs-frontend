'use client';

import { useLocale } from '@/lib/stores/locale';
import HeaderMain from '@/components/HeaderMain';
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

export function Header() {
  const locale = useLocale();

  const navItems = NAV_ITEMS.map((item) => ({
    id: item.id,
    label: item.labelKey,
    icon: item.icon,
    path: item.getPath(locale),
    storageKey: item.storageKey ?? '',
    active: (pathname) => item.active(pathname, locale),
  }));

  return (
    <HeaderMain navItems={navItems}>
      <TypeHeadSearch />
    </HeaderMain>
  );
}

export default Header;
