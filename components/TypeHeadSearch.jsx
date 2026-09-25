'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { deduplicateById } from '@/lib/utils/deduplicateById';
import { useI18n, useLocale } from '@/lib/stores/locale';

const STORAGE_KEY_QUERY = 'search-query';
const STORAGE_KEY_MOVIES = 'search-movies';
const STORAGE_KEY_TV = 'search-tv';
const STORAGE_KEY_CLOSED = 'search-results-closed';

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function clearStorage() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_QUERY);
    sessionStorage.removeItem(STORAGE_KEY_MOVIES);
    sessionStorage.removeItem(STORAGE_KEY_TV);
    sessionStorage.removeItem(STORAGE_KEY_CLOSED);
  } catch { /* ignore */ }
}

function formatRating(value) { return Number(value ?? 0).toFixed(1); }
function formatYear(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return String(date.getFullYear());
}

export default function TypeHeadSearch() {
  const { labels, messages, formats, titles, fallbacks } = useI18n();
  const locale = useLocale();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [resultsClosed, setResultsClosed] = useState(false);
  const [error, setError] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [focusedResultId, setFocusedResultId] = useState(null);
  const [lastSelectedResultId, setLastSelectedResultId] = useState(null);

  const inputRef = useRef(null);
  const debounceTimer = useRef(null);
  const loadingTimer = useRef(null);
  const announcementTimer = useRef(null);
  const controllerRef = useRef(null);
  const prevLocale = useRef(null);
  const resultsClosedRef = useRef(false);

  const searchHintId = 'typeahead-search-hint';
  const resultsId = 'typeahead-search-results';

  useEffect(() => {
    const storedQuery = readStorage(STORAGE_KEY_QUERY, '');
    const storedMovies = readStorage(STORAGE_KEY_MOVIES, []);
    const storedTv = readStorage(STORAGE_KEY_TV, []);
    const storedClosed = readStorage(STORAGE_KEY_CLOSED, false);
    if (storedQuery) setQuery(storedQuery);
    if (storedMovies.length) setMovies(storedMovies);
    if (storedTv.length) setTvShows(storedTv);
    resultsClosedRef.current = storedClosed;
    setResultsClosed(storedClosed);
  }, []);

  const hasResults = movies.length > 0 || tvShows.length > 0;
  const hasSearchTerm = query.trim().length >= 4;
  const resultsVisible = !resultsClosed && (hasResults || loading || !!error);
  const hasStatusMessage = !resultsClosed && (showLoading || !!error || (hasSearchTerm && !hasResults));

  function getAllResultIds() { return [...movies.map((m) => `movie-${m.id}`), ...tvShows.map((t) => `tv-${t.id}`)]; }
  function focusResult(resultId) { setFocusedResultId(resultId); requestAnimationFrame(() => { document.querySelector('a.result[aria-selected="true"]')?.scrollIntoView({ behavior: 'auto', block: 'nearest' }); }); }
  function focusNextResult() { const ids = getAllResultIds(); if (!ids.length) return; const idx = ids.indexOf(focusedResultId ?? ''); focusResult(ids[idx === -1 ? 0 : Math.min(idx + 1, ids.length - 1)]); }
  function focusPreviousResult() { const ids = getAllResultIds(); if (!ids.length) return; const idx = ids.indexOf(focusedResultId ?? ''); focusResult(ids[idx === -1 ? 0 : Math.max(idx - 1, 0)]); }
  function focusFirstResult() { const ids = getAllResultIds(); if (ids.length) focusResult(ids[0]); }
  function focusLastResult() { const ids = getAllResultIds(); if (ids.length) focusResult(ids[ids.length - 1]); }
  function clearAnnouncementFn() { if (announcementTimer.current) clearTimeout(announcementTimer.current); setAnnouncement(''); }
  function scheduleAnnouncement(msg) {
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    setAnnouncement('');
    if (!msg) return;
    announcementTimer.current = setTimeout(() => { requestAnimationFrame(() => setAnnouncement(msg)); }, 500);
  }
  function resetResults() {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    clearAnnouncementFn();
    resultsClosedRef.current = false;
    setShowLoading(false); setLoading(false); setResultsClosed(false);
    setFocusedResultId(null); setMovies([]); setTvShows([]); setError(null);
    clearStorage();
  }
  function resultHref(item) { return item.mediaType === 'movie' ? `/${locale}/movies/${item.id}` : `/${locale}/tv-shows/${item.id}`; }

  function handleResultClick(e, item) {
    e.preventDefault();
    closeResults();
    const href = resultHref(item);
    requestAnimationFrame(() => router.push(href));
  }

  useEffect(() => {
    writeStorage(STORAGE_KEY_CLOSED, resultsClosed);
  }, [resultsClosed]);

  const search = useCallback(async (term, { silent = false } = {}) => {
    controllerRef.current?.abort();
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    clearAnnouncementFn();
    setFocusedResultId(null);
    if (!silent) setShowLoading(false);
    controllerRef.current = new AbortController();
    setLoading(true); setError(null);
    if (!silent) loadingTimer.current = setTimeout(() => setShowLoading(true), 300);
    try {
      const res = await fetch(`/api/${encodeURIComponent(locale)}/search?q=${encodeURIComponent(term)}`, { signal: controllerRef.current.signal });
      if (!res.ok) { if (!silent) { setError(messages.searchError); scheduleAnnouncement(messages.searchError); } return; }
      const data = await res.json();
      const dedupMovies = deduplicateById(data.movies ?? []);
      const dedupTv = deduplicateById(data.tvShows ?? []);
      setMovies(dedupMovies); setTvShows(dedupTv);
      writeStorage(STORAGE_KEY_MOVIES, dedupMovies);
      writeStorage(STORAGE_KEY_TV, dedupTv);
      if (silent) {
        // After a locale change the results are new — always close the layer
        // so the user consciously re-opens it for the updated language results.
        resultsClosedRef.current = true;
        setResultsClosed(true);
      } else {
        writeStorage(STORAGE_KEY_QUERY, term);
        const count = dedupMovies.length + dedupTv.length;
        if (count > 0) { scheduleAnnouncement(messages.searchResultsCount.replace('{count}', String(count))); }
        else if (term.length >= 4) { scheduleAnnouncement(messages.searchNoResults); }
      }
    } catch (ex) {
      if (ex instanceof Error && ex.name === 'AbortError') return;
      if (!silent) { setError(messages.searchError); scheduleAnnouncement(messages.searchError); }
    } finally { if (loadingTimer.current) clearTimeout(loadingTimer.current); setShowLoading(false); setLoading(false); }
  }, [locale, messages]);

  useEffect(() => {
    if (prevLocale.current === null) { prevLocale.current = locale; return; }
    if (locale === prevLocale.current) return;
    prevLocale.current = locale;
    const term = query.trim();
    if (term.length >= 4) void search(term, { silent: true });
  }, [locale, query, search]);

  function handleInput(e) {
    const val = e.currentTarget.value;
    setQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    clearAnnouncementFn(); setFocusedResultId(null);
    const term = val.trim();
    if (term.length < 4) { resetResults(); return; }
    resultsClosedRef.current = false;
    setResultsClosed(false);
    debounceTimer.current = setTimeout(() => search(term), 300);
  }

  function closeResults({ restoreFocus = false } = {}) {
    clearAnnouncementFn();
    resultsClosedRef.current = true;
    setResultsClosed(true);
    if (focusedResultId) setLastSelectedResultId(focusedResultId);
    setFocusedResultId(null);
    if (restoreFocus) inputRef.current?.focus();
  }

  function showResultsPanel() {
    if (query.trim().length >= 4 && (hasResults || loading || error)) {
      resultsClosedRef.current = false;
      setResultsClosed(false);
      if (lastSelectedResultId) { const allIds = getAllResultIds(); if (allIds.includes(lastSelectedResultId)) { setFocusedResultId(lastSelectedResultId); return; } }
      if (hasResults) { const first = getAllResultIds()[0]; if (first) focusResult(first); }
    }
  }

  useEffect(() => {
    function handleClick(e) { if (!e.target.closest('#typeahead-search')) closeResults(); }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  });

  useEffect(() => {
    function handleKeydown(event) {
      if (!resultsVisible || !hasResults) { if (event.key === 'Escape') { event.preventDefault(); closeResults({ restoreFocus: true }); } return; }
      switch (event.key) {
        case 'ArrowDown': event.preventDefault(); focusNextResult(); break;
        case 'ArrowUp': event.preventDefault(); focusPreviousResult(); break;
        case 'Enter': event.preventDefault(); if (focusedResultId) { document.querySelector('a.result[aria-selected="true"]')?.click(); } break;
        case 'Escape': event.preventDefault(); closeResults({ restoreFocus: true }); break;
        case 'Home': event.preventDefault(); focusFirstResult(); break;
        case 'End': event.preventDefault(); focusLastResult(); break;
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  return (
    <search id="typeahead-search" className="typeahead-search">
      <form id="typeahead-search-form" onSubmit={(e) => e.preventDefault()} role="search">
        <label className="u-sr-only" htmlFor="typeahead-search-input">{labels.searchInput}</label>
        <div className="input-wrapper">
          <input
            ref={inputRef} id="typeahead-search-input" type="search" autoComplete="off"
            role="combobox" aria-autocomplete="list" aria-controls={resultsId}
            aria-describedby={searchHintId} aria-expanded={resultsVisible && hasResults}
            aria-haspopup="listbox" aria-activedescendant={focusedResultId ?? undefined}
            value={query} onFocus={showResultsPanel} onChange={handleInput} placeholder={labels.searchInput}
          />
          <i aria-hidden="true" className="search icon" />
          <p className="u-sr-only" id={searchHintId}>{messages.searchHint}</p>
          {hasStatusMessage && (
            <div id="status-messages-layer">
              <section id="status-messages" role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} aria-atomic>
                {error ? (<div className="search-error-panel"><p className="result result-error">{error}</p></div>)
                  : loading ? (<p className="result">{messages.searchLoading}</p>)
                  : hasSearchTerm && !hasResults ? (<div className="search-empty-state"><p className="result">{messages.searchNoResults}</p></div>)
                  : null}
              </section>
            </div>
          )}
        </div>

        {hasResults && (
          <div id={resultsId} role="listbox" aria-label={messages.searchResults} aria-live="polite" aria-atomic={false} className="results-dropdown" hidden={resultsClosed}>
            {movies.length > 0 && (
              <div role="group" aria-labelledby="typeahead-movies-heading">
                <h2 id="typeahead-movies-heading" className={`typeahead-results-heading ui label blue${titles.movies ? '' : ' u-not-available'}`}>{titles.movies}</h2>
                {movies.map((item) => (
                  <a key={item.id} role="option" id={`movie-${item.id}`} className={`result${focusedResultId === `movie-${item.id}` ? ' result-focused' : ''}`} data-result-link="true" href={resultHref(item)} onClick={(e) => handleResultClick(e, item)} aria-selected={focusedResultId === `movie-${item.id}` ? 'true' : 'false'} aria-labelledby={`typeahead-result-type-movie-${item.id} typeahead-result-content-movie-${item.id}`} tabIndex={focusedResultId === `movie-${item.id}` ? 0 : -1}>
                    <figure className="image" aria-hidden="true"><img src={item.posterUrl || item.imageUrl || '/not-available.png'} alt="" /></figure>
                    <div className="content">
                      <span className="u-sr-only" id={`typeahead-result-type-movie-${item.id}`}>{titles.movies}</span>
                      <div id={`typeahead-result-content-movie-${item.id}`}>
                        <header className="result-header"><h3 className={`title${item.title ? '' : ' u-not-available'}`}>{item.title}</h3></header>
                        <p className="description">
                          <time className={item.date ? '' : 'u-not-available'} dateTime={item.date}>{formatYear(item.date)}</time>
                          <span aria-hidden="true"> · </span>
                          <span className="rating">{item.rating !== null && item.rating !== undefined ? (<><i className="yellow star icon" aria-hidden="true" /><span className="u-sr-only">{labels.rating}</span><span className={`rating-value${item.rating ? '' : ' u-not-available'}`}>{formatRating(item.rating)}</span><span className="u-sr-only">{formats.outOfTen}</span></>) : (<span className="u-not-available">{fallbacks.notAvailable}</span>)}</span>
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
            {tvShows.length > 0 && (
              <div role="group" aria-labelledby="typeahead-tv-heading">
                <h2 id="typeahead-tv-heading" className={`typeahead-results-heading ui label teal${titles.tvShows ? '' : ' u-not-available'}`}>{titles.tvShows}</h2>
                {tvShows.map((item) => (
                  <a key={item.id} role="option" id={`tv-${item.id}`} className={`result${focusedResultId === `tv-${item.id}` ? ' result-focused' : ''}`} data-result-link="true" href={resultHref(item)} onClick={(e) => handleResultClick(e, item)} aria-selected={focusedResultId === `tv-${item.id}` ? 'true' : 'false'} aria-labelledby={`typeahead-result-type-tv-${item.id} typeahead-result-content-tv-${item.id}`} tabIndex={focusedResultId === `tv-${item.id}` ? 0 : -1}>
                    <figure className="image" aria-hidden="true"><img src={item.posterUrl || item.imageUrl || '/not-available.png'} alt="" /></figure>
                    <div className="content">
                      <span className="u-sr-only" id={`typeahead-result-type-tv-${item.id}`}>{titles.tvShows}</span>
                      <div id={`typeahead-result-content-tv-${item.id}`}>
                        <header className="result-header"><h3 className={`title${item.title ? '' : ' u-not-available'}`}>{item.title}</h3></header>
                        <p className="description">
                          <time className={item.date ? '' : 'u-not-available'} dateTime={item.date}>{formatYear(item.date)}</time>
                          <span aria-hidden="true"> · </span>
                          <span className="rating">{item.rating !== null && item.rating !== undefined ? (<><i className="yellow star icon" aria-hidden="true" /><span className="u-sr-only">{labels.rating}</span><span className={`rating-value${item.rating ? '' : ' u-not-available'}`}>{formatRating(item.rating)}</span><span className="u-sr-only">{formats.outOfTen}</span></>) : (<span className="u-not-available">{fallbacks.notAvailable}</span>)}</span>
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
      <div className="u-sr-only" aria-live="polite" aria-atomic>{announcement}</div>
    </search>
  );
}
