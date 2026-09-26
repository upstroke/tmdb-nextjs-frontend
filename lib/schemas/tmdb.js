import { z } from 'zod';

// ── Raw TMDB base schemas (no transform) ─────────────────

const GenreSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
});

const ProductionCompanySchema = z.object({
  id: z.number(),
  name: z.string(),
  logo_path: z.string().nullable(),
});

const CastMemberSchema = z.object({
  id: z.number(),
  credit_id: z.string().optional(),
  name: z.string(),
  character: z.string().default(''),
  order: z.number().nullable().optional(),
  profile_path: z.string().nullable().default(''),
});

const CrewMemberSchema = z.object({
  id: z.number(),
  credit_id: z.string().optional(),
  name: z.string(),
  job: z.string().default(''),
  department: z.string().default(''),
  profile_path: z.string().nullable().default(''),
});

const CreditsSchema = z.object({
  cast: z.array(CastMemberSchema).default([]),
  crew: z.array(CrewMemberSchema).default([]),
});

const WatchProviderEntrySchema = z.object({
  provider_id: z.number(),
  provider_name: z.string(),
  logo_path: z.string().nullable().optional(),
  display_priority: z.number().nullable().optional(),
});

const WatchProvidersSchema = z.record(
  z.string(),
  z.object({
    link: z.string().optional(),
    flatrate: z.array(WatchProviderEntrySchema).default([]),
    rent: z.array(WatchProviderEntrySchema).default([]),
    buy: z.array(WatchProviderEntrySchema).default([]),
  })
);

// ── Normalized output schemas (UI shapes) ─────────────────

/** Normalized card item returned by list and search endpoints. */
export const CardItemSchema = z.object({
  id: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string(),
  date: z.string(),
  rating: z.number(),
  genres: z.array(GenreSchema),
  imageUrl: z.string(),
  posterUrl: z.string(),
  // Added by enrichCardCertifications — absent directly after mapCardItem.
  certification: z.string().optional(),
});

/** Normalized cast entry. */
export const CastSchema = z.object({
  id: z.number(),
  creditId: z.string().optional(),
  name: z.string(),
  character: z.string(),
  order: z.number().nullable().optional(),
  profilePath: z.string(),
  imageUrl: z.string(),
});

/** Normalized crew entry. */
export const CrewSchema = z.object({
  id: z.number(),
  creditId: z.string().optional(),
  name: z.string(),
  job: z.string(),
  department: z.string(),
  profilePath: z.string(),
  imageUrl: z.string(),
});

/** Normalized watch provider entry. */
export const WatchProviderSchema = z.object({
  providerId: z.number(),
  providerName: z.string(),
  type: z.enum(['flatrate', 'rent', 'buy']),
  link: z.string().nullable(),
  logoPath: z.string().nullable(),
  displayPriority: z.number().nullable(),
});

/** Normalized watch provider result for a region. */
export const WatchProviderResultSchema = z.object({
  link: z.string(),
  providers: z.array(WatchProviderSchema),
});

/** Normalized episode entry. */
export const EpisodeSchema = z.object({
  id: z.number(),
  episodeNumber: z.number(),
  name: z.string(),
  overview: z.string(),
  airDate: z.string().nullable(),
  runtime: z.number().nullable(),
  rating: z.number(),
  stillUrl: z.string().nullable(),
});

/** Normalized season entry. */
export const SeasonSchema = z.object({
  id: z.number(),
  seasonNumber: z.number(),
  name: z.string(),
  overview: z.string(),
  airDate: z.string().nullable(),
  posterUrl: z.string().nullable(),
  episodes: z.array(EpisodeSchema),
});

/** Normalized detail object for movies and TV shows. */
export const MediaDetailSchema = z.object({
  id: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string(),
  releaseDate: z.string(),
  overview: z.string(),
  homepage: z.string(),
  trailerUrls: z.array(z.string()),
  genres: z.array(GenreSchema),
  rating: z.number(),
  runtime: z.number().nullable(),
  episodeRunTime: z.array(z.number()),
  productionCompanies: z.array(ProductionCompanySchema),
  imageUrl: z.string(),
  posterUrl: z.string(),
  cast: z.array(CastSchema),
  crew: z.array(CrewSchema),
  certification: z.string(),
  providers: WatchProviderResultSchema.nullable(),
  // TV-only
  numberOfSeasons: z.number().nullable().optional(),
  numberOfEpisodes: z.number().nullable().optional(),
  seasons: z.array(SeasonSchema).optional(),
});

/**
 * Normalized featured item (homepage hero).
 * Reflects the full return value of getFeaturedToday(), which merges
 * mapFeaturedItem / mapDetails with certification, providers and trailerUrls.
 */
export const FeaturedItemSchema = z.object({
  id: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string(),
  releaseDate: z.string(),
  overview: z.string(),
  homepage: z.string(),
  genres: z.array(GenreSchema),
  imageUrl: z.string(),
  posterUrl: z.string(),
  productionCompanies: z.array(ProductionCompanySchema),
  certification: z.string(),
  providers: WatchProviderResultSchema.nullable(),
  trailerUrls: z.array(z.string()),
});

/** Generic paginated list response. */
export const ListResponseSchema = z.object({
  page: z.number(),
  results: z.array(CardItemSchema),
  hasMore: z.boolean(),
});

// ── API boundary schemas ───────────────────────────────

/** Route params containing only locale. */
export const LocaleParamSchema = z.object({
  locale: z.string().min(2).max(10),
});

/** Route params containing locale and a numeric TMDB id. */
export const IdParamSchema = z.object({
  locale: z.string().min(2).max(10),
  id: z.coerce.number().int().positive(),
});

/** Query params for the search endpoint (?q=). */
export const SearchQuerySchema = z.object({
  q: z.string().trim().min(4).max(200),
});

/** Query params for paginated list endpoints (?page=&type=). */
export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  type: z.enum(['popular', 'top_rated', 'trending']).optional(),
});

/** Query params for TV season endpoints (?season=). */
export const SeasonQuerySchema = z.object({
  season: z.coerce.number().int().min(0),
});

/** JSON response shape of the search API route. */
export const SearchResponseSchema = z.object({
  movies: z.array(CardItemSchema),
  tvShows: z.array(CardItemSchema),
  results: z.array(CardItemSchema),
  error: z.string().nullable(),
});

// ── JSDoc types inferred from Zod schemas ─────────────────

/**
 * @typedef {import('zod').infer<typeof CardItemSchema>} CardItem
 * @typedef {import('zod').infer<typeof CastSchema>} Cast
 * @typedef {import('zod').infer<typeof CrewSchema>} Crew
 * @typedef {import('zod').infer<typeof WatchProviderSchema>} WatchProvider
 * @typedef {import('zod').infer<typeof WatchProviderResultSchema>} WatchProviderResult
 * @typedef {import('zod').infer<typeof EpisodeSchema>} Episode
 * @typedef {import('zod').infer<typeof SeasonSchema>} Season
 * @typedef {import('zod').infer<typeof MediaDetailSchema>} MediaDetail
 * @typedef {import('zod').infer<typeof FeaturedItemSchema>} FeaturedItem
 * @typedef {import('zod').infer<typeof ListResponseSchema>} ListResponse
 * @typedef {import('zod').infer<typeof LocaleParamSchema>} LocaleParam
 * @typedef {import('zod').infer<typeof IdParamSchema>} IdParam
 * @typedef {import('zod').infer<typeof SearchQuerySchema>} SearchQuery
 * @typedef {import('zod').infer<typeof ListQuerySchema>} ListQuery
 * @typedef {import('zod').infer<typeof SeasonQuerySchema>} SeasonQuery
 * @typedef {import('zod').infer<typeof SearchResponseSchema>} SearchResponse
 */
