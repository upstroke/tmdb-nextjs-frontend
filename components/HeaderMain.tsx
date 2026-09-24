'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '@/lib/stores/i18n';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  storageKey: string;
  active: (pathname: string) => boolean;
}

interface HeaderMainProps {
  navItems?: NavItem[];
  children?: React.ReactNode;
}

/**
 * Renders the global header with navigation, mobile menu,
 * optional content slot, and language selector.
 */
export default function HeaderMain({ navItems = [], children }: HeaderMainProps) {
  const { labels } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function getStoredPage(key: string): number {
    if (typeof window === 'undefined') return 1;
    try {
      return Math.max(1, Number(sessionStorage.getItem(key) ?? '1') || 1);
    } catch {
      return 1;
    }
  }

  function getNavHref(path: string, storageKey: string): string {
    const storedPage = getStoredPage(storageKey);
    // NOTE: locale is handled via the locale store in Next.js,
    // not via URL search params. Adjust if using ?locale= approach.
    return storedPage > 1 ? `${path}?page=${storedPage}` : path;
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
        <span />
        <span />
        <span />
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
                  <span className="text-node">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Slot for TypeHeadSearch or other content */}
        {children}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
