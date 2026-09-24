'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/stores/i18n';
import { useLocale } from '@/lib/stores/locale';
import { formatDate } from '@/lib/utils/formatDate';

interface Episode {
  id?: number | string;
  name: string;
  air_date?: string;
  overview?: string;
}

interface Tab {
  id: string | number;
  label: string;
  loading?: boolean;
  episodes?: Episode[];
  content?: string;
}

interface TabGroupeProps {
  tabs?: Tab[];
  initialTab?: string | number;
  ariaLabel?: string;
  onTabSelect?: (id: string) => void;
}

/**
 * Accessible tab group with keyboard navigation (WCAG 4.1.2).
 * Supports episode lists inside each tab panel.
 */
export default function TabGroupe({
  tabs = [],
  initialTab,
  ariaLabel = '',
  onTabSelect,
}: TabGroupeProps) {
  const { labels, messages } = useI18n();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<string>(
    String(initialTab ?? tabs[0]?.id ?? '')
  );
  const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState<number[]>(
    tabs.map(() => 0)
  );
  const episodeListRefs = useRef<Record<number, HTMLOListElement | null>>({});

  // Warn in dev if ariaLabel is missing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !ariaLabel) {
      console.warn('[TabGroupe] The ariaLabel prop is required for accessibility (WCAG 4.1.2).');
    }
  }, [ariaLabel]);

  function selectTab(id: string | number) {
    const strId = String(id);
    setActiveTab(strId);
    const tabIndex = tabs.findIndex((t) => String(t.id) === strId);
    if (tabIndex !== -1) {
      setFocusedEpisodeIndex((prev) => { const next = [...prev]; next[tabIndex] = 0; return next; });
    }
    onTabSelect?.(strId);
  }

  function isSelected(id: string | number) {
    return String(activeTab) === String(id);
  }

  function handleTabKeydown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const map: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in map)) return;
    event.preventDefault();
    const nextId = tabs[map[event.key]].id;
    selectTab(nextId);
    document.getElementById(`tab-${nextId}`)?.focus();
  }

  async function handleEpisodeKeydown(
    event: React.KeyboardEvent<HTMLLIElement>,
    tabIndex: number,
    episodeIndex: number,
    total: number
  ) {
    const moves: Record<string, number> = {
      ArrowDown: (episodeIndex + 1) % total,
      ArrowUp: (episodeIndex - 1 + total) % total,
      Home: 0,
      End: total - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const nextIndex = moves[event.key];
    setFocusedEpisodeIndex((prev) => { const next = [...prev]; next[tabIndex] = nextIndex; return next; });
    setTimeout(() => {
      const ol = episodeListRefs.current[tabIndex];
      if (ol) {
        (ol.querySelectorAll('li.episode-item')[nextIndex] as HTMLElement)?.focus();
      }
    }, 0);
  }

  return (
    <>
      <div className="ui pointing secondary menu" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`item${isSelected(tab.id) ? ' active' : ''}`}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            data-tab={tab.id}
            aria-selected={isSelected(tab.id)}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isSelected(tab.id) ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(e) => handleTabKeydown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, tabIndex) => (
        <div
          key={tab.id}
          className={`ui tab segment${isSelected(tab.id) ? ' active' : ''}`}
          id={`panel-${tab.id}`}
          data-tab={tab.id}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={!isSelected(tab.id)}
        >
          {tab.loading ? (
            <p aria-live="polite">{messages.loading}</p>
          ) : tab.episodes && tab.episodes.length > 0 ? (
            <ol
              className="episodes-list"
              ref={(el) => { episodeListRefs.current[tabIndex] = el; }}
            >
              {tab.episodes.map((episode, episodeIndex) => (
                <li
                  key={episode.id ?? episodeIndex}
                  className="episode-item"
                  tabIndex={
                    isSelected(tab.id) && episodeIndex === focusedEpisodeIndex[tabIndex] ? 0 : -1
                  }
                  onKeyDown={(e) =>
                    handleEpisodeKeydown(e, tabIndex, episodeIndex, tab.episodes!.length)
                  }
                >
                  <h4 className="episode-title">
                    {episodeIndex + 1}. {episode.name}
                  </h4>
                  {episode.air_date && (
                    <>
                      <span className="u-sr-only">{labels.firstAirDate}</span>
                      <time className="episode-air-date">
                        {formatDate(episode.air_date, locale)}
                      </time>
                    </>
                  )}
                  {episode.overview && (
                    <p className="episode-overview">{episode.overview}</p>
                  )}
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
