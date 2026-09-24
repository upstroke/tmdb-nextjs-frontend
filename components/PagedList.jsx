'use client';

import styles from './PagedList.module.scss';
import { useState, useEffect, useRef } from 'react';
import { useI18n, useLocale } from '@/lib/stores/locale';
import { restorePagedList, storeCurrentPage } from '@/lib/utils/pageStateRestore';
import { deduplicateMedia, getMediaKey } from '@/lib/utils/deduplicateMedia';
import CardDefault from '@/components/CardDefault';
import CardFeatured from '@/components/CardFeatured';
import LoadMore from '@/components/LoadMore';
import DialogMessage from '@/components/DialogMessage';

export default function PagedList({ initialData, apiPath, storageKey, cardIdPrefix, listKeyPrefix, heading, emptyMessageKey = 'noContent' }) {
  const { messages } = useI18n();
  const locale = useLocale();

  const [featured, setFeatured] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [scrollTargetId, setScrollTargetId] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    setLoading(true);
    restorePagedList({
      storageKey, initialData,
      fetchPageData: async (pageNumber) => {
        const res = await fetch(`/${locale}/${apiPath}?page=${pageNumber}`, { headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error(messages.loadMoreError);
        return res.json();
      },
    })
      .then((restored) => { setFeatured(restored.featured ?? null); setCards(restored.cards ?? []); setCurrentPage(restored.page ?? 1); setHasMore(restored.hasMore ?? false); })
      .catch((e) => { setError(e instanceof Error ? e.message : messages.unknownError); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scrollTargetId) return;
    observerRef.current?.disconnect();
    const target = document.getElementById(scrollTargetId);
    if (!target) { setScrollTargetId(null); return; }
    const obs = new IntersectionObserver((entries, o) => {
      if (entries.some((e) => e.isIntersecting)) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); o.disconnect(); setScrollTargetId(null); }
    }, { threshold: 0.1 });
    obs.observe(target);
    observerRef.current = obs;
    return () => obs.disconnect();
  }, [scrollTargetId]);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true); setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const nextPage = currentPage + 1;
      const res = await fetch(`/${locale}/${apiPath}?page=${nextPage}`, { headers: { accept: 'application/json' }, signal: controller.signal });
      if (!res.ok) { setError(messages.loadMoreError); return; }
      const result = await res.json();
      const existingKeys = new Set(cards.map(getMediaKey).filter(Boolean));
      const newCards = deduplicateMedia(result.cards ?? []).filter((card) => !existingKeys.has(getMediaKey(card)));
      if (newCards.length === 0) { setHasMore(false); storeCurrentPage(storageKey, currentPage); return; }
      const previousCount = cards.length;
      setCards((prev) => [...prev, ...newCards]);
      setCurrentPage(result.page ?? nextPage);
      setHasMore(result.hasMore === true);
      storeCurrentPage(storageKey, result.page ?? nextPage);
      setScrollTargetId(`${cardIdPrefix}-${previousCount + 1}`);
    } catch (exception) {
      if (exception.name === 'AbortError') { setError(messages.loadTimeout); } else { setError(exception instanceof Error ? exception.message : messages.unknownError); }
    } finally {
      clearTimeout(timeoutId); setLoading(false);
    }
  }

  const emptyMessage = messages[emptyMessageKey] ?? messages.noContent;

  return (
    <div className={styles['paged-list']}>
      {error && <DialogMessage message={error} />}
      {heading && <h2 className="ui dividing header">{heading}</h2>}
      {featured && <CardFeatured {...featured} />}
      {cards.length > 0 ? (
        <div className={styles['paged-list-cards']}>
          <ul className="ui four doubling cards media-card-list">
            {cards.map((item, index) => (
              <li key={`${listKeyPrefix}-${item.mediaType}-${item.id}`} style={{ '--stagger-delay': `${index * 90}ms` }}>
                <CardDefault {...item} scrollId={`${cardIdPrefix}-${index + 1}`} />
              </li>
            ))}
          </ul>
          <LoadMore hasMore={hasMore} loading={loading} onLoad={loadMore} />
        </div>
      ) : !error ? (
        <p className={emptyMessage ? '' : 'u-not-available'}>{emptyMessage}</p>
      ) : null}
    </div>
  );
}
