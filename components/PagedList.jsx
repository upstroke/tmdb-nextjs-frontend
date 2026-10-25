'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n, useLocale } from '@/lib/stores/locale';
import { restorePagedList, storeCurrentPage } from '@/lib/utils/pageStateRestore';
import { deduplicateMedia, getMediaKey } from '@/lib/utils/deduplicateMedia';
import CardDefault from '@/components/CardDefault';
import CardFeatured from '@/components/CardFeatured';
import LoadMore from '@/components/LoadMore';
import DialogMessage from '@/components/DialogMessage';

/**
 * Client-side paginated list of media cards with featured item, load-more
 * functionality, scroll restoration, and duplicate removal.
 *
 * On mount the component attempts to restore the previously viewed page from
 * sessionStorage via `restorePagedList`. Subsequent pages are fetched from the
 * internal API route at `/api/[locale]/[apiPath]`.
 *
 * When `cacheInitialData` is true, the supplied initial data comes from the
 * shared trending cache. Its `page` is the last loaded dedicated feed page
 * (zero when no dedicated page has loaded), not the next page to request.
 * PagedList increments this value exactly once. Session restoration is skipped
 * in cache mode. The caller must keep this mode stable throughout the mount.
 *
 * Errors are surfaced through `DialogMessage`. This includes an error that the
 * server page passes in `initialData.error` when the first page could not be
 * loaded. Duplicate items across pages are removed using `deduplicateMedia`.
 *
 * @param {object} props
 * @param {object} props.initialData - Initial list data.
 * @param {string} props.apiPath - API path segment for pagination.
 * @param {string} props.storageKey - sessionStorage page key.
 * @param {string} props.cardIdPrefix - Card id prefix for scroll targeting.
 * @param {string} props.listKeyPrefix - React list key prefix.
 * @param {string} [props.heading] - List heading.
 * @param {string} [props.emptyMessageKey='noContent'] - Empty-state message key.
 * @param {boolean} [props.cacheInitialData=false] - Whether cards come from cache.
 * @param {(cards: Array<object>, loadedPage: number, allCards: Array<object>) => void} [props.onCardsAppended] - Receives new cards, loaded page and the complete displayed list.
 * @returns {JSX.Element}
 */
export default function PagedList({
  initialData,
  apiPath,
  storageKey,
  cardIdPrefix,
  listKeyPrefix,
  heading,
  emptyMessageKey = 'noContent',
  cacheInitialData = false,
  onCardsAppended
}) {
  const { messages } = useI18n();
  const locale = useLocale();

  const [featured, setFeatured] = useState(
    cacheInitialData ? initialData?.featured ?? null : null
  );
  const [cards, setCards] = useState(
    cacheInitialData ? initialData?.cards ?? [] : []
  );
  const [currentPage, setCurrentPage] = useState(
    cacheInitialData ? initialData?.page ?? 1 : 1
  );
  const [hasMore, setHasMore] = useState(
    cacheInitialData ? initialData?.hasMore === true : false
  );
  const [error, setError] = useState(
    cacheInitialData && initialData?.error ? initialData.error : null
  );
  const [loading, setLoading] = useState(!cacheInitialData);
  const [scrollTargetId, setScrollTargetId] = useState(null);
  const initializedRef = useRef(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (cacheInitialData) return;

    restorePagedList({
      storageKey,
      initialData,
      fetchPageData: async (pageNumber) => {
        const res = await fetch(`/api/${locale}/${apiPath}?page=${pageNumber}`, {
          headers: { accept: 'application/json' }
        });
        if (!res.ok) throw new Error(messages.loadMoreError);
        return res.json();
      }
    })
      .then((restored) => {
        setFeatured(restored.featured ?? null);
        setCards(restored.cards ?? []);
        setCurrentPage(restored.page ?? 1);
        setHasMore(restored.hasMore ?? false);
        if (initialData?.error) setError(initialData.error);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : messages.unknownError);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scrollTargetId) return;
    observerRef.current?.disconnect();
    const target = document.getElementById(scrollTargetId);
    if (!target) return;
    const obs = new IntersectionObserver(
      (entries, o) => {
        if (entries.some((e) => e.isIntersecting)) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          o.disconnect();
          setScrollTargetId(null);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(target);
    observerRef.current = obs;
    return () => obs.disconnect();
  }, [scrollTargetId]);

  /**
   * Loads and deduplicates the next page, preserving existing timeout,
   * no-new-card termination, session storage and scroll behavior.
   * @returns {Promise<void>} Completes after the request settles.
   */
  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const nextPage = currentPage + 1;
      const res = await fetch(`/api/${locale}/${apiPath}?page=${nextPage}`, {
        headers: { accept: 'application/json' },
        signal: controller.signal
      });
      if (!res.ok) {
        setError(messages.loadMoreError);
        return;
      }
      const result = await res.json();
      const existingKeys = new Set(cards.map(getMediaKey).filter(Boolean));
      const newCards = deduplicateMedia(result.cards ?? []).filter(
        (card) => !existingKeys.has(getMediaKey(card))
      );
      const loadedPage = result.page ?? nextPage;

      if (newCards.length === 0) {
        setHasMore(false);
        if (!cacheInitialData) {
          storeCurrentPage(storageKey, currentPage);
        }
        return;
      }
      const previousCount = cards.length;
      setCards((prev) => [...prev, ...newCards]);
      setCurrentPage(loadedPage);
      setHasMore(result.hasMore === true);
      onCardsAppended?.(newCards, loadedPage, [...cards, ...newCards]);
      if (!cacheInitialData) {
        storeCurrentPage(storageKey, loadedPage);
      }
      setScrollTargetId(`${cardIdPrefix}-${previousCount + 1}`);
    } catch (exception) {
      if (exception.name === 'AbortError') {
        setError(messages.loadTimeout);
      } else {
        setError(exception instanceof Error ? exception.message : messages.unknownError);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  const emptyMessage = messages[emptyMessageKey] ?? messages.noContent;

  return (
    <div className="paged-list">
      {error && <DialogMessage message={error} />}
      {heading && <h2 className="ui dividing header">{heading}</h2>}
      {featured && <CardFeatured {...featured} />}
      {cards.length > 0 ? (
        <div className="paged-list-cards">
          <ul className="ui four doubling cards media-card-list">
            {cards.map((item, index) => (
              <li
                key={`${listKeyPrefix}-${item.mediaType}-${item.id}`}
                style={{ '--stagger-delay': `${index * 90}ms` }}
              >
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
