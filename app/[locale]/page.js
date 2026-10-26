import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/helpers';
import { LocaleParamSchema } from '@/lib/schemas/tmdb';
import TrendingCacheInitializer from '@/components/TrendingCacheInitializer';
import HomeTrendingList from '@/components/HomeTrendingList';
import PagedList from '@/components/PagedList';

/** @typedef {import('@/lib/schemas/tmdb').FeaturedItem} FeaturedItem */
/** @typedef {import('@/lib/schemas/tmdb').CardItem} CardItem */

/**
 * Home page (`/[locale]`). Server component that loads today's trending media
 * from TMDB and renders it as a paged list.
 *
 * The first trending item is loaded in detail and shown as the featured item.
 * When its details fail to load or are not valid, the page still renders
 * without it. Errors while loading the trending list are passed to `PagedList`
 * through `initialData.error`. Invalid route params and a missing
 * `TMDB_API_KEY` render a short message instead of the list. The invalid
 * params message uses the raw locale when available and falls back to the
 * default locale otherwise.
 *
 * @param {object} props
 * @param {Promise<{ locale: string }>} props.params - Route params (async in Next.js 15+).
 * @returns {Promise<JSX.Element>}
 */
export default async function HomePage({ params }) {
  const rawParams = await params;
  const paramsParsed = LocaleParamSchema.safeParse(rawParams);
  if (!paramsParsed.success) {
    const { messages: fallbackMessages } = getLocaleText(rawParams?.locale);
    return (
      <main id="main-content" tabIndex={-1} className="ui container fluid home-page">
        <p>{fallbackMessages.invalidUrlParams}</p>
      </main>
    );
  }

  const { locale } = paramsParsed.data;

  const { messages, titles } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return (
      <main id="main-content" tabIndex={-1} className="ui container fluid home-page">
        <p>{messages.apiKeyMissing}</p>
      </main>
    );
  }

  const api = createTmdbApi(fetch, apiKey, locale);

  /** @type {FeaturedItem|null} */
  let featured = null;
  /** @type {CardItem[]} */
  let cards = [];
  let hasMore = false;
  /** @type {string|null} */
  let error = null;

  try {
    const result = await api.getTrendingAll(1);

    if (!result) {
      throw new Error(messages.contentLoadError);
    }

    const source = result?.results?.[0] ?? result?.results?.[1] ?? null;

    if (source) {
      try {
        const details =
          source.mediaType === 'tv'
            ? await api.getTVShowDetails(source.id)
            : await api.getMovieDetails(source.id);

        if (details) {
          featured = {
            id: details.id,
            mediaType: details.mediaType,
            title: details.title,
            releaseDate: details.releaseDate,
            overview: details.overview,
            homepage: details.homepage,
            genres: details.genres ?? [],
            imageUrl: details.imageUrl,
            posterUrl: details.posterUrl
          };
        }
      } catch (e) {
        console.error('Featured details could not be loaded:', e);
      }
    }

    cards = result.results ?? [];
    hasMore = result.hasMore === true;
  } catch (e) {
    console.error('Failed to load homepage:', e);
    error = messages.contentLoadError;
  }

  const initialData = { featured, cards, page: 1, hasMore, error };

  return (
    <main id="main-content" tabIndex={-1} className="ui container fluid home-page">
      <TrendingCacheInitializer cards={cards} />
      <HomeTrendingList
        initialData={initialData}
        apiPath="trending"
        storageKey="home-page"
        cardIdPrefix="home-card"
        listKeyPrefix="page-home"
        heading={titles.trendingToday}
      />
    </main>
  );
}
