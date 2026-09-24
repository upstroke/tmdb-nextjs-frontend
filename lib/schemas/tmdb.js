import { z } from 'zod';

// ── Basis-Schemas (intern, kein Transform) ────────────────

const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const ProductionCompanySchema = z.object({
  id: z.number(),
  name: z.string(),
  logo_path: z.string().nullable(),
  origin_country: z.string(),
});

const CastMemberSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    character: z.string(),
    profile_path: z.string().nullable(),
    order: z.number(),
  })
  .transform((d) => ({
    id: d.id,
    name: d.name,
    character: d.character,
    profilePath: d.profile_path,
    order: d.order,
  }));

const CrewMemberSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    job: z.string(),
    department: z.string(),
    profile_path: z.string().nullable(),
  })
  .transform((d) => ({
    id: d.id,
    name: d.name,
    job: d.job,
    department: d.department,
    profilePath: d.profile_path,
  }));

const CreditsSchema = z.object({
  cast: z.array(CastMemberSchema),
  crew: z.array(CrewMemberSchema),
});

const StreamProviderSchema = z
  .object({
    provider_id: z.number(),
    provider_name: z.string(),
    logo_path: z.string(),
    display_priority: z.number(),
  })
  .transform((d) => ({
    id: d.provider_id,
    name: d.provider_name,
    logoPath: d.logo_path,
    displayPriority: d.display_priority,
  }));

const WatchProviderResultSchema = z.object({
  link: z.string().optional(),
  flatrate: z.array(StreamProviderSchema).optional(),
  rent: z.array(StreamProviderSchema).optional(),
  buy: z.array(StreamProviderSchema).optional(),
});

const WatchProvidersSchema = z
  .object({
    results: z.record(WatchProviderResultSchema),
  })
  .transform((d) => d.results);

// ── Listen-Schemas ───────────────────────────────────────

export const MovieListItemSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    overview: z.string().default(''),
    poster_path: z.string().nullable(),
    release_date: z.string().default(''),
    vote_average: z.number().default(0),
  })
  .transform((d) => ({
    id: d.id,
    title: d.title,
    overview: d.overview,
    posterPath: d.poster_path,
    releaseDate: d.release_date,
    rating: d.vote_average,
  }));

export const TvListItemSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    overview: z.string().default(''),
    poster_path: z.string().nullable(),
    first_air_date: z.string().default(''),
    vote_average: z.number().default(0),
  })
  .transform((d) => ({
    id: d.id,
    title: d.name,
    overview: d.overview,
    posterPath: d.poster_path,
    firstAirDate: d.first_air_date,
    rating: d.vote_average,
  }));

/**
 * Factory for paginated API responses.
 * @template {import('zod').ZodTypeAny} T
 * @param {T} itemSchema
 * @returns {import('zod').ZodObject<any>}
 */
export const PaginatedResponseSchema = (itemSchema) =>
  z.object({
    page: z.number(),
    results: z.array(itemSchema),
    total_pages: z.number(),
    total_results: z.number(),
  });

// ── Detail-Schemas ───────────────────────────────────────

export const MovieDetailSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    overview: z.string().default(''),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    release_date: z.string().default(''),
    vote_average: z.number().default(0),
    runtime: z.number().nullable(),
    tagline: z.string().nullable().default(''),
    status: z.string(),
    genres: z.array(GenreSchema).default([]),
    production_companies: z.array(ProductionCompanySchema).default([]),
    homepage: z.string().nullable().default(''),
    credits: CreditsSchema.optional(),
    'watch/providers': WatchProvidersSchema.optional(),
  })
  .transform((d) => ({
    id: d.id,
    title: d.title,
    overview: d.overview,
    posterPath: d.poster_path,
    backdropPath: d.backdrop_path,
    releaseDate: d.release_date,
    rating: d.vote_average,
    runtime: d.runtime,
    tagline: d.tagline ?? '',
    status: d.status,
    genres: d.genres,
    productionCompanies: d.production_companies,
    homepage: d.homepage ?? '',
    cast: d.credits?.cast?.slice(0, 20) ?? [],
    crew: d.credits?.crew ?? [],
    watchProviders: d['watch/providers'] ?? {},
  }));

export const TvDetailSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    overview: z.string().default(''),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    first_air_date: z.string().default(''),
    last_air_date: z.string().nullable().default(''),
    vote_average: z.number().default(0),
    number_of_seasons: z.number(),
    number_of_episodes: z.number(),
    tagline: z.string().nullable().default(''),
    status: z.string(),
    genres: z.array(GenreSchema).default([]),
    production_companies: z.array(ProductionCompanySchema).default([]),
    homepage: z.string().nullable().default(''),
    networks: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
          logo_path: z.string().nullable(),
        })
      )
      .default([]),
    credits: CreditsSchema.optional(),
    'watch/providers': WatchProvidersSchema.optional(),
  })
  .transform((d) => ({
    id: d.id,
    title: d.name,
    overview: d.overview,
    posterPath: d.poster_path,
    backdropPath: d.backdrop_path,
    firstAirDate: d.first_air_date,
    lastAirDate: d.last_air_date ?? '',
    rating: d.vote_average,
    seasons: d.number_of_seasons,
    episodes: d.number_of_episodes,
    tagline: d.tagline ?? '',
    status: d.status,
    genres: d.genres,
    productionCompanies: d.production_companies,
    homepage: d.homepage ?? '',
    networks: d.networks.map((n) => ({
      id: n.id,
      name: n.name,
      logoPath: n.logo_path,
    })),
    cast: d.credits?.cast?.slice(0, 20) ?? [],
    crew: d.credits?.crew ?? [],
    watchProviders: d['watch/providers'] ?? {},
  }));

// ── JSDoc-Typen aus Zod-Schemas ───────────────────────────

/**
 * @typedef {import('zod').infer<typeof MovieListItemSchema>} MovieListItem
 * @typedef {import('zod').infer<typeof TvListItemSchema>} TvListItem
 * @typedef {import('zod').infer<typeof MovieDetailSchema>} MovieDetail
 * @typedef {import('zod').infer<typeof TvDetailSchema>} TvDetail
 */
