'use client';

import styles from './HeaderMain.module.scss';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '@/lib/stores/locale';

export default function HeaderMain({ navItems = [], children }) {
  const { labels, titles } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className={styles['header']} id="menuHeader">
      <button
        className={styles['burger-icon']}
        type="button"
        aria-label={labels.navigationToggle}
        aria-expanded={menuOpen ? 'true' : 'false'}
        aria-controls="navmenu"
        onPointerDown={() => setMenuOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>
      <div className={styles['nav-wrapper']}>
        <nav id="navmenu" aria-label={labels.mainNavigation}>
          <ul className={styles['nav-list']}>
            {navItems.map((item) => (
              <li key={item.id} className={styles['nav-item']} id={item.id}>
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
        {children}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
