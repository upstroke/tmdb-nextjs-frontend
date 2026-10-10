'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { deduplicateById } from '@/lib/utils/deduplicateById';
import { useI18n, useLocale } from '@/lib/stores/locale';

const STORAGE_KEY_QUERY = 'search-query';
const STORAGE_KEY_MOVIES = 'search-movies';
const STORAGE_KEY_TV = 'search-tv';
const STORAGE_KEY_CLOSED = 'search-results-closed';

/**
 * Reads a JSON-serialised value from sessionStorage.
 *
 * @param {string} key - sessionStorage key.
 * @param {*} fallback - Value returned when the key is missing or parsing fails.
 * @returns {*} The parsed value or `fallback`.
 */
function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Serialises a value as JSON and writes it to sessionStorage.
 * Silently ignores storage errors (e.g. private-browsing quota).
 *
 * @param {string} key - sessionStorage key.
 * @param {*} value - Value to serialise and store.
 * @returns {void}
 */
function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/**
 * Removes all typeahead-search keys from sessionStorage.
 *
 * @returns {void}
 */
function clearStorage() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_QUERY);
    sessionStorage.removeItem(STORAGE_KEY_MOVIES);
    sessionStorage.removeItem(STORAGE_KEY_TV);
    sessionStorage.removeItem(STORAGE_KEY_CLOSED);
  } catch {
    /* ignore */
  }
}

/**
 * Formats a numeric rating to one decimal place.
 *
 * @param {number|string|null|undefined} value - Raw rating value.
 * @returns {string} Rating string, e.g. `"7.4"`.
 */
function formatRating(value) {
  return Number(value ?? 0).toFixed(1);
}

/**
 * Extracts the four-digit year from an ISO date string.
 *
 * @param {string|null|undefined} value - ISO date string (e.g. `"2023-05-12"`).
 * @returns {string} The year as a string, or an empty string when the input is
 *   missing or not a valid date.
 */
function formatYear(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return String(date.getFullYear());
}

/**
 * Typeahead search widget embedded in the global header.
 *
 * Debounces user input by 300 ms and fetches suggestions from
 * `/api/[locale]/search?q=` once the query reaches 4 characters.
 * Results are split into movies and TV shows and displayed in an
 * accessible combobox / listbox dropdown.
 *
 * Each result announces the meaning of its year to screen readers through a
 * visually hidden label: `labels.releaseDate` for movies and
 * `labels.firstAirDate` for TV shows. The label is always rendered. When the
 * year is missing, `fallbacks.notAvailable` is shown as the value.
 *
 * Persists the last query and result set in sessionStorage so the
 * dropdown can be restored after navigating back to the page.
 *
 * When the locale changes while a query is active, results are
 * silently re-fetched in the new language and the dropdown is closed
 * so the user consciously re-opens it.
 *
 * Keyboard navigation (handled on the search form, not on the window):
 * - Arrow Down / Up — move focus through results
 * - Home / End — jump to first or last result once a result is focused;
 *   otherwise they move the text cursor in the input as usual
 * - Enter — navigate to the focused result
 * - Escape — close the dropdown and return focus to the input
 *
 * @returns {JSX.Element}
 */
export default function TypeHeadSearch() {
  const { labels, messages, formats, titles, fallbacks } = useI18n();
  const locale = useLocale();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  // Start closed so the layer never flashes open before sessionStorage is read.
  const [resultsClosed, setResultsClosed] = useState(true);
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
  const resultsClosedRef = useRef(true);

  const searchHintId = 'typeahead-search-hint';
  const resultsId = 'typeahead-search-results';

  useEffect(() => {
    const storedQuery = readStorage(STORAGE_KEY_QUERY, '');
    const storedMovies = readStorage(STORAGE_KEY_MOVIES, []);
    const storedTv = readStorage(STORAGE_KEY_TV, []);
    const storedClosed = readStorage(STORAGE_KEY_CLOSED, true);
    if (storedQuery) setQuery(storedQuery);
    if (storedMovies.length) setMovies(storedMovies);
    if (storedTv.length) setTvShows(storedTv);
    resultsClosedRef.current = storedClosed;
    setResultsClosed(storedClosed);
  }, []);

  const hasResults = movies.length > 0 || tvShows.length > 0;
  const hasSearchTerm = query.trim().length >= 4;
  const resultsVisible = !resultsClosed && (hasResults || loading || !!error);
  const hasStatusMessage =
    !resultsClosed && (showLoading || !!error || (hasSearchTerm && !hasResults));

  function getAllResultIds() {
    return [...movies.map((m) => `movie-${m.id}`), ...tvShows.map((t) => `tv-${t.id}`)];
  }
  function focusResult(resultId) {
    setFocusedResultId(resultId);
    requestAnimationFrame(() => {
      document
        .querySelector('a.result[aria-selected="true"]')
        ?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    });
  }
  function focusNextResult() {
    const ids = getAllResultIds();
    if (!ids.length) return;
    const idx = ids.indexOf(focusedResultId ?? '');
    focusResult(ids[idx === -1 ? 0 : Math.min(idx + 1, ids.length - 1)]);
  }
  function focusPreviousResult() {
    const ids = getAllResultIds();
    if (!ids.length) return;
    const idx = ids.indexOf(focusedResultId ?? '');
    focusResult(ids[idx === -1 ? 0 : Math.max(idx - 1, 0)]);
  }
  function focusFirstResult() {
    const ids = getAllResultIds();
    if (ids.length) focusResult(ids[0]);
  }
  function focusLastResult() {
    const ids = getAllResultIds();
    if (ids.length) focusResult(ids[ids.length - 1]);
  }
  function clearAnnouncementFn() {
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    setAnnouncement('');
  }
  function scheduleAnnouncement(msg) {
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    setAnnouncement('');
    if (!msg) return;
    announcementTimer.current = setTimeout(() => {
      requestAnimationFrame(() => setAnnouncement(msg));
    }, 500);
  }

  /**
   * Resets all search state and clears sessionStorage.
   *
   * Called when the query drops below the minimum length (4 characters).
   * Cancels any pending loading timer, clears the live-region announcement,
   * empties the movie and TV show result arrays, and removes all search keys
   * from sessionStorage.
   *
   * @returns {void}
   */
  function resetResults() {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    clearAnnouncementFn();
    resultsClosedRef.current = false;
    setShowLoading(false);
    setLoading(false);
    setResultsClosed(false);
    setFocusedResultId(null);
    setMovies([]);
    setTvShows([]);
    setError(null);
    clearStorage();
  }

  /**
   * Returns the internal navigation href for a search result item.
   *
   * @param {import('@/lib/schemas/tmdb').CardItem} item - Search result item.
   * @returns {string} Locale-prefixed path to the movie or TV show detail page.
   */
  function resultHref(item) {
    return item.mediaType === 'movie'
      ? `/${locale}/movies/${item.id}`
      : `/${locale}/tv-shows/${item.id}`;
  }

  /**
   * Handles a click on a search result link.
   *
   * Prevents the default anchor navigation, closes the results dropdown, and
   * defers the programmatic router push to the next animation frame so the
   * dropdown close animation can complete first.
   *
   * @param {React.MouseEvent<HTMLAnchorElement>} e - The click event.
   * @param {import('@/lib/schemas/tmdb').CardItem} item - The result item that was clicked.
   * @returns {void}
   */
  function handleResultClick(e, item) {
    e.preventDefault();
    closeResults();
    const href = resultHref(item);
    requestAnimationFrame(() => router.push(href));
  }

  useEffect(() => {
    writeStorage(STORAGE_KEY_CLOSED, resultsClosed);
  }, [resultsClosed]);

  /**
   * Fetches search suggestions for the given query term.
   *
   * Aborts any in-flight request before starting a new one. Deduplicates
   * movies and TV shows from the API response using `deduplicateById` and
   * persists the results to sessionStorage.
   *
   * When called with `silent: true` (locale-change refetch), results are
   * stored but the dropdown is kept closed so the user consciously re-opens
   * it. No loading indicator or live-region announcement is emitted in silent
   * mode.
   *
   * @param {string} term - Trimmed search query (minimum 4 characters).
   * @param {{ silent?: boolean }} [options={}] - Options object.
   * @param {boolean} [options.silent=false] - When true, suppresses UI feedback
   *   (loading indicator, announcements) and closes the dropdown after fetching.
   * @returns {Promise<void>}
   */
  const search = useCallback(
    async (term, { silent = false } = {}) => {
      controllerRef.current?.abort();
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
      clearAnnouncementFn();
      setFocusedResultId(null);
      if (!silent) setShowLoading(false);
      controllerRef.current = new AbortController();
      setLoading(true);
      setError(null);
      if (!silent) loadingTimer.current = setTimeout(() => setShowLoading(true), 300);
      try {
        const res = await fetch(
          `/api/${encodeURIComponent(locale)}/search?q=${encodeURIComponent(term)}`,
          { signal: controllerRef.current.signal }
        );
        if (!res.ok) {
          if (!silent) {
            setError(messages.searchError);
            scheduleAnnouncement(messages.searchError);
          }
          return;
        }
        const data = await res.json();
        const dedupMovies = deduplicateById(data.movies ?? []);
        const dedupTv = deduplicateById(data.tvShows ?? []);
        setMovies(dedupMovies);
        setTvShows(dedupTv);
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
          if (count > 0) {
            scheduleAnnouncement(messages.searchResultsCount.replace('{count}', String(count)));
          } else if (term.length >= 4) {
            scheduleAnnouncement(messages.searchNoResults);
          }
        }
      } catch (ex) {
        if (ex instanceof Error && ex.name === 'AbortError') return;
        if (!silent) {
          setError(messages.searchError);
          scheduleAnnouncement(messages.searchError);
        }
      } finally {
        if (loadingTimer.current) clearTimeout(loadingTimer.current);
        setShowLoading(false);
        setLoading(false);
      }
    },
    [locale, messages]
  );

  useEffect(() => {
    if (prevLocale.current === null) {
      prevLocale.current = locale;
      return;
    }
    if (locale === prevLocale.current) return;
    prevLocale.current = locale;
    const term = query.trim();
    if (term.length >= 4) void search(term, { silent: true });
  }, [locale, query, search]);

  function handleInput(e) {
    const val = e.currentTarget.value;
    setQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    clearAnnouncementFn();
    setFocusedResultId(null);
    const term = val.trim();
    if (term.length < 4) {
      resetResults();
      return;
    }
    resultsClosedRef.current = false;
    setResultsClosed(false);
    debounceTimer.current = setTimeout(() => search(term), 300);
  }

  /**
   * Closes the results dropdown and optionally returns focus to the input.
   *
   * Persists the focused result id as `lastSelectedResultId` so that the
   * same item can be pre-focused when the panel is re-opened. Also cancels
   * any pending live-region announcement.
   *
   * @param {{ restoreFocus?: boolean }} [options={}] - Options object.
   * @param {boolean} [options.restoreFocus=false] - When true, moves focus back
   *   to the search input after closing.
   * @returns {void}
   */
  function closeResults({ restoreFocus = false } = {}) {
    clearAnnouncementFn();
    resultsClosedRef.current = true;
    setResultsClosed(true);
    if (focusedResultId) setLastSelectedResultId(focusedResultId);
    setFocusedResultId(null);
    if (restoreFocus) inputRef.current?.focus();
  }

  /**
   * Opens the results dropdown when the input receives focus.
   *
   * Only shows the panel when the query is at least 4 characters long and
   * results, a loading state, or an error are available. Restores focus to
   * the last selected result when applicable; otherwise focuses the first
   * result in the list.
   *
   * @returns {void}
   */
  function showResultsPanel() {
    if (query.trim().length >= 4 && (hasResults || loading || error)) {
      resultsClosedRef.current = false;
      setResultsClosed(false);
      if (lastSelectedResultId) {
        const allIds = getAllResultIds();
        if (allIds.includes(lastSelectedResultId)) {
          setFocusedResultId(lastSelectedResultId);
          return;
        }
      }
      if (hasResults) {
        const first = getAllResultIds()[0];
        if (first) focusResult(first);
      }
    }
  }

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('#typeahead-search')) closeResults();
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  });

  /**
   * Handles keyboard navigation for keys pressed inside the search form.
   *
   * Home and End only jump to the first or last result when a result is
   * already focused. Otherwise the keys keep their default behaviour and move
   * the text cursor in the input.
   *
   * @param {React.KeyboardEvent<HTMLFormElement>} event - The keydown event.
   * @returns {void}
   */
  function handleKeyDown(event) {
    if (!resultsVisible || !hasResults) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeResults({ restoreFocus: true });
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusNextResult();
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusPreviousResult();
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedResultId) {
          document.querySelector('a.result[aria-selected="true"]')?.click();
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeResults({ restoreFocus: true });
        break;
      case 'Home':
        if (!focusedResultId) break;
        event.preventDefault();
        focusFirstResult();
        break;
      case 'End':
        if (!focusedResultId) break;
        event.preventDefault();
        focusLastResult();
        break;
    }
  }

  return (
    <search id="typeahead-search" className="typeahead-search">
      <form
        id="typeahead-search-form"
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        role="search"
      >
        <label className="u-sr-only" htmlFor="typeahead-search-input">
          {labels.searchInput}
        </label>
        <div className="input-wrapper">
          <input
            ref={inputRef}
            id="typeahead-search-input"
            type="search"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={resultsId}
            aria-describedby={searchHintId}
            aria-expanded={resultsVisible && hasResults}
            aria-haspopup="listbox"
            aria-activedescendant={focusedResultId ?? undefined}
            value={query}
            onFocus={showResultsPanel}
            onChange={handleInput}
            placeholder={labels.searchInput}
          />
          <i aria-hidden="true" className="search icon" />
          <p className="u-sr-only" id={searchHintId}>
            {messages.searchHint}
          </p>
          {hasStatusMessage && (
            <div id="status-messages-layer">
              <section
                id="status-messages"
                role={error ? 'alert' : 'status'}
                aria-live={error ? 'assertive' : 'polite'}
                aria-atomic
              >
                {error ? (
                  <div className="search-error-panel">
                    <p className="result result-error">{error}</p>
                  </div>
                ) : loading ? (
                  <p className="result">{messages.searchLoading}</p>
                ) : hasSearchTerm && !hasResults ? (
                  <div className="search-empty-state">
                    <p className="result">{messages.searchNoResults}</p>
                  </div>
                ) : null}
              </section>
            </div>
          )}
        </div>

        {hasResults && (
          <div
            id={resultsId}
            role="listbox"
            aria-label={messages.searchResults}
            aria-live="polite"
            aria-atomic={false}
            className="results-dropdown"
            hidden={resultsClosed}
          >
            {movies.length > 0 && (
              <div role="group" aria-labelledby="typeahead-movies-heading">
                <h2
                  id="typeahead-movies-heading"
                  className={`typeahead-results-heading ui label blue${titles.movies ? '' : ' u-not-available'}`}
                >
                  {titles.movies}
                </h2>
                {movies.map((item) => (
                  <a
                    key={item.id}
                    role="option"
                    id={`movie-${item.id}`}
                    className={`result${focusedResultId === `movie-${item.id}` ? ' result-focused' : ''}`}
                    data-result-link="true"
                    href={resultHref(item)}
                    onClick={(e) => handleResultClick(e, item)}
                    aria-selected={focusedResultId === `movie-${item.id}` ? 'true' : 'false'}
                    aria-labelledby={`typeahead-result-type-movie-${item.id} typeahead-result-content-movie-${item.id}`}
                    tabIndex={focusedResultId === `movie-${item.id}` ? 0 : -1}
                  >
                    <figure className="image" aria-hidden="true">
                      <img src={item.posterUrl || item.imageUrl || '/not-available.png'} alt="" />
                    </figure>
                    <div className="content">
                      <span className="u-sr-only" id={`typeahead-result-type-movie-${item.id}`}>
                        {titles.movies}
                      </span>
                      <div id={`typeahead-result-content-movie-${item.id}`}>
                        <header className="result-header">
                          <h3 className={`title${item.title ? '' : ' u-not-available'}`}>
                            {item.title}
                          </h3>
                        </header>
                        <p className="description">
                          <span className="u-sr-only">{labels.releaseDate}</span>
                          <time className={item.date ? '' : 'u-not-available'} dateTime={item.date}>
                            {formatYear(item.date) || fallbacks.notAvailable}
                          </time>
                          <span aria-hidden="true"> · </span>
                          <span className="rating">
                            {item.rating !== null && item.rating !== undefined ? (
                              <>
                                <i className="yellow star icon" aria-hidden="true" />
                                <span className="u-sr-only">{labels.rating}</span>
                                <span
                                  className={`rating-value${item.rating ? '' : ' u-not-available'}`}
                                >
                                  {formatRating(item.rating)}
                                </span>
                                <span className="u-sr-only">{formats.outOfTen}</span>
                              </>
                            ) : (
                              <span className="u-not-available">{fallbacks.notAvailable}</span>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
            {tvShows.length > 0 && (
              <div role="group" aria-labelledby="typeahead-tv-heading">
                <h2
                  id="typeahead-tv-heading"
                  className={`typeahead-results-heading ui label teal${titles.tvShows ? '' : ' u-not-available'}`}
                >
                  {titles.tvShows}
                </h2>
                {tvShows.map((item) => (
                  <a
                    key={item.id}
                    role="option"
                    id={`tv-${item.id}`}
                    className={`result${focusedResultId === `tv-${item.id}` ? ' result-focused' : ''}`}
                    data-result-link="true"
                    href={resultHref(item)}
                    onClick={(e) => handleResultClick(e, item)}
                    aria-selected={focusedResultId === `tv-${item.id}` ? 'true' : 'false'}
                    aria-labelledby={`typeahead-result-type-tv-${item.id} typeahead-result-content-tv-${item.id}`}
                    tabIndex={focusedResultId === `tv-${item.id}` ? 0 : -1}
                  >
                    <figure className="image" aria-hidden="true">
                      <img src={item.posterUrl || item.imageUrl || '/not-available.png'} alt="" />
                    </figure>
                    <div className="content">
                      <span className="u-sr-only" id={`typeahead-result-type-tv-${item.id}`}>
                        {titles.tvShows}
                      </span>
                      <div id={`typeahead-result-content-tv-${item.id}`}>
                        <header className="result-header">
                          <h3 className={`title${item.title ? '' : ' u-not-available'}`}>
                            {item.title}
                          </h3>
                        </header>
                        <p className="description">
                          <span className="u-sr-only">{labels.firstAirDate}</span>
                          <time className={item.date ? '' : 'u-not-available'} dateTime={item.date}>
                            {formatYear(item.date) || fallbacks.notAvailable}
                          </time>
                          <span aria-hidden="true"> · </span>
                          <span className="rating">
                            {item.rating !== null && item.rating !== undefined ? (
                              <>
                                <i className="yellow star icon" aria-hidden="true" />
                                <span className="u-sr-only">{labels.rating}</span>
                                <span
                                  className={`rating-value${item.rating ? '' : ' u-not-available'}`}
                                >
                                  {formatRating(item.rating)}
                                </span>
                                <span className="u-sr-only">{formats.outOfTen}</span>
                              </>
                            ) : (
                              <span className="u-not-available">{fallbacks.notAvailable}</span>
                            )}
                          </span>
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
      <div className="u-sr-only" aria-live="polite" aria-atomic>
        {announcement}
      </div>
    </search>
  );
}
