'use client';

import styles from './TabGroupe.module.scss';
import { useState, useRef, useEffect } from 'react';
import { useI18n, useLocale } from '@/lib/stores/locale';
import { formatDate } from '@/lib/utils/formatDate';

export default function TabGroupe({ tabs = [], initialTab, ariaLabel = '', onTabSelect }) {
  const { labels, messages } = useI18n();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState(String(initialTab ?? tabs[0]?.id ?? ''));
  const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState(tabs.map(() => 0));
  const episodeListRefs = useRef({});

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !ariaLabel) {
      console.warn('[TabGroupe] The ariaLabel prop is required for accessibility (WCAG 4.1.2).');
    }
  }, [ariaLabel]);

  function selectTab(id) {
    const strId = String(id);
    setActiveTab(strId);
    const tabIndex = tabs.findIndex((t) => String(t.id) === strId);
    if (tabIndex !== -1) setFocusedEpisodeIndex((prev) => { const next = [...prev]; next[tabIndex] = 0; return next; });
    onTabSelect?.(strId);
  }

  function isSelected(id) { return String(activeTab) === String(id); }

  function handleTabKeydown(event, index) {
    const map = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!(event.key in map)) return;
    event.preventDefault();
    const nextId = tabs[map[event.key]].id;
    selectTab(nextId);
    document.getElementById(`tab-${nextId}`)?.focus();
  }

  function handleEpisodeKeydown(event, tabIndex, episodeIndex, total) {
    const moves = { ArrowDown: (episodeIndex + 1) % total, ArrowUp: (episodeIndex - 1 + total) % total, Home: 0, End: total - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const nextIndex = moves[event.key];
    setFocusedEpisodeIndex((prev) => { const next = [...prev]; next[tabIndex] = nextIndex; return next; });
    setTimeout(() => { const ol = episodeListRefs.current[tabIndex]; if (ol) ol.querySelectorAll('li.episode-item')[nextIndex]?.focus(); }, 0);
  }

  return (
    <>
      <div className={`ui pointing secondary menu ${styles['tab-bar']}`} role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => (
          <button key={tab.id} className={`item${isSelected(tab.id) ? ' active' : ''}`} type="button" role="tab" id={`tab-${tab.id}`} data-tab={tab.id} aria-selected={isSelected(tab.id)} aria-controls={`panel-${tab.id}`} tabIndex={isSelected(tab.id) ? 0 : -1} onClick={() => selectTab(tab.id)} onKeyDown={(e) => handleTabKeydown(e, index)}>
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, tabIndex) => (
        <div key={tab.id} className={`ui tab segment ${styles['tab-panel']}${isSelected(tab.id) ? ' active' : ''}`} id={`panel-${tab.id}`} data-tab={tab.id} role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={!isSelected(tab.id)}>
          {tab.loading ? (
            <p aria-live="polite">{messages.loading}</p>
          ) : tab.episodes && tab.episodes.length > 0 ? (
            <ol className={styles['episodes-list']} ref={(el) => { episodeListRefs.current[tabIndex] = el; }}>
              {tab.episodes.map((episode, episodeIndex) => (
                <li key={episode.id ?? episodeIndex} className={`episode-item ${styles['episode-item']}`} tabIndex={isSelected(tab.id) && episodeIndex === focusedEpisodeIndex[tabIndex] ? 0 : -1} onKeyDown={(e) => handleEpisodeKeydown(e, tabIndex, episodeIndex, tab.episodes.length)}>
                  <h4 className={styles['episode-title']}>{episodeIndex + 1}. {episode.name}</h4>
                  {episode.air_date && (<><span className="u-sr-only">{labels.firstAirDate}</span><time className={styles['episode-air-date']}>{formatDate(episode.air_date, locale)}</time></>)}
                  {episode.overview && <p className={styles['episode-overview']}>{episode.overview}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <p>{tab.content ?? ''}</p>
          )}
        </div>
      ))}
    </>
  );
}
