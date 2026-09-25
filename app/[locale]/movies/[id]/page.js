import { createTmdbApi } from '@/lib/services/tmdb-api';
import { getLocaleText } from '@/lib/i18n/resolver';
import { formatDate } from '@/lib/utils/formatDate';
import { formatHomepageLabel } from '@/lib/utils/formatHomepageLabel';
import { deduplicateById } from '@/lib/utils/deduplicateById';
import { getCertificationMeta } from '@/lib/utils/certificationMeta';
import DetailsHero from '@/components/DetailsHero';
import MediaTypeLabel from '@/components/MediaTypeLabel';
import DialogMessage from '@/components/DialogMessage';

export default async function MovieDetailPage({ params }) {
  const { locale, id } = await params;
  const { labels, fallbacks, formats, messages, buttons } = getLocaleText(locale);
  const apiKey = process.env.TMDB_API_KEY;
  const activeRegion = locale.split('-')[1] ?? 'US';

  if (!apiKey) {
    return <DialogMessage message={messages.apiKeyMissing} />;
  }

  let movie = null;
  let providers = null;
  let error = null;

  try {
    const api = createTmdbApi(fetch, apiKey, locale);
    const [details, watchProviders] = await Promise.all([
      api.getMovieDetails(id),
      api.getWatchProviders('movie', id),
    ]);
    movie = { ...details, trailerUrls: details.trailerUrls ?? [] };
    providers = watchProviders;
  } catch (e) {
    console.error('Failed to load movie details:', e);
    error = e instanceof Error ? e.message : messages.movieLoadError;
  }

  if (error) return <DialogMessage message={error} />;
  if (!movie) return <DialogMessage message={messages.movieLoadError} />;

  const title = movie.title?.trim() || fallbacks.notAvailable;
  const backdrop = movie.imageUrl || '/not-available.png';
  const posterUrl = movie.posterUrl || movie.imageUrl || '/not-available.png';
  const genres = deduplicateById(movie.genres ?? []);
  const productionCompanies = deduplicateById(movie.productionCompanies ?? []);
  const castMembers = deduplicateById(movie.cast ?? []);
  const crew = deduplicateById(movie.crew ?? []);
  const formattedReleaseDate = movie.releaseDate?.trim()
    ? formatDate(movie.releaseDate, locale)
    : '';
  const certificationMeta = getCertificationMeta(movie.certification, activeRegion);
  const certStyle = certificationMeta
    ? {
        '--certification-icon-color': certificationMeta.color === '#ffffff' ? 'transparent' : certificationMeta.color,
        '--certification-icon-border-color': certificationMeta.color === '#ffffff' ? '#999' : certificationMeta.color,
      }
    : { '--certification-icon-color': '#dedede', '--certification-icon-border-color': '#dedede' };

  return (
    <>
      <DetailsHero
        title={title}
        backdrop={backdrop}
        posterUrl={posterUrl}
        productionCompanies={productionCompanies}
        emptyLabel={fallbacks.notAvailable}
      />

      <main className="ui text container details-view">
        <header className="details-header">
          <dl className="details-meta">
            <div>
              <dt className="u-sr-only">{labels.mediaType}</dt>
              <dd><MediaTypeLabel mediaType="movie" /></dd>
            </div>
            <div className="details-meta-item">
              <dt className="u-sr-only">{labels.certification}</dt>
              <dd className="meta certification" style={certStyle}>
                <span className="certification-content">
                  <span className="certification-icon" aria-hidden="true" />
                  <span className={certificationMeta?.label ? '' : 'u-not-available'}>
                    {certificationMeta?.label ?? fallbacks.notAvailable}
                  </span>
                </span>
              </dd>
            </div>
            <div>
              <dt className="u-sr-only">{labels.rating}</dt>
              <dd>
                <span className="ui label">
                  <i className="yellow star icon" aria-hidden="true" />
                  {movie.rating != null ? (
                    <><b className={`rating-value${movie.rating ? '' : ' u-not-available'}`}>{movie.rating}</b><span className={formats.outOfTen ? '' : 'u-not-available'}>{formats.outOfTen}</span></>
                  ) : (
                    <span className="u-not-available">{fallbacks.notAvailable}</span>
                  )}
                </span>
              </dd>
            </div>
          </dl>

          <section aria-labelledby="genres-heading">
            <h2 id="genres-heading" className="u-sr-only">{labels.genres}</h2>
            {genres.length ? (
              <ul className="ui celled horizontal list genres">
                {genres.map((genre) => (
                  <li key={`movie-genre-${genre.id ?? genre.name}`} className={`item${genre.name ? '' : ' u-not-available'}`}>{genre.name}</li>
                ))}
              </ul>
            ) : (
              <p className={messages.noGenres ? '' : 'u-not-available'}>{messages.noGenres}</p>
            )}
          </section>
        </header>

        <section aria-labelledby="overview-heading">
          <h3 id="overview-heading" className={`ui medium header${labels.overview ? '' : ' u-not-available'}`}>{labels.overview}</h3>
          <p className={`overview${movie.overview ? '' : ' u-not-available'}`}>{movie.overview || fallbacks.notAvailable}</p>
        </section>

        <section aria-labelledby="homepage-heading">
          <h3 id="homepage-heading" className={`ui medium dividing header${labels.homepage ? '' : ' u-not-available'}`}>{labels.homepage}</h3>
          <p>
            {movie.homepage ? (
              <a className={`home-link${formatHomepageLabel(movie.homepage) ? '' : ' u-not-available'}`} href={movie.homepage} target="_blank" rel="noopener noreferrer">
                {formatHomepageLabel(movie.homepage)}
              </a>
            ) : (
              <span className="u-not-available">{fallbacks.notAvailable}</span>
            )}
          </p>
        </section>

        <section aria-labelledby="trailer-heading">
          <h3 id="trailer-heading" className={`ui medium dividing header${labels.trailer ? '' : ' u-not-available'}`}>{labels.trailer}</h3>
          {movie.trailerUrls.length ? (
            <ul className="ui list trailer-list">
              {movie.trailerUrls.map((url, index) => (
                <li key={`movie-trailer-${index}`}>
                  <a className="ui red button" href={url} target="_blank" rel="noopener noreferrer">
                    <i className="youtube icon" aria-hidden="true" />
                    {(buttons.watchTrailer ?? '').replace('{index}', String(index + 1))}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="u-not-available">{fallbacks.notAvailable}</p>
          )}
        </section>

        <section aria-labelledby="release-heading">
          <h3 id="release-heading" className={`ui medium dividing header${labels.releaseDate ? '' : ' u-not-available'}`}>{labels.releaseDate}</h3>
          <p>
            <time className={formattedReleaseDate ? '' : 'u-not-available'} dateTime={movie.releaseDate || undefined}>
              {formattedReleaseDate || fallbacks.notAvailable}
            </time>
          </p>
        </section>

        <section aria-labelledby="watch-providers-heading">
          <h3 id="watch-providers-heading" className="ui medium dividing header">
            {labels.streamingProviders} <small className="justwatch-attribution">{labels.streamingDataProvidedBy} <strong>&copy;JustWatch</strong></small>
          </h3>
          {providers?.providers?.length ? (
            <ul className="ui relaxed divided list providers-list">
              {providers.providers.map((provider) => (
                <li key={`movie-provider-${provider.providerId}-${provider.type}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {provider.logoPath && (
                      <img src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`} alt="" width={40} height={40} style={{ borderRadius: '0.25rem', background: '#f0f0f0' }} />
                    )}
                    <div>
                      {provider.link ? (
                        <a href={provider.link} target="_blank" rel="noopener noreferrer" className="home-link"><strong>{provider.providerName}</strong></a>
                      ) : (
                        <strong>{provider.providerName}</strong>
                      )}
                      <span> — {labels[`providerType${provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}`]}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="u-not-available">{fallbacks.notAvailable}</p>
          )}
        </section>

        <section aria-labelledby="production-heading">
          <h3 id="production-heading" className={`ui medium dividing header${labels.production ? '' : ' u-not-available'}`}>{labels.production}</h3>
          {productionCompanies.length ? (
            <ul className="ui relaxed divided list">
              {productionCompanies.map((company) => (
                <li key={`movie-company-${company.id ?? company.name}`}><strong>{company.name}</strong></li>
              ))}
            </ul>
          ) : (
            <p className="u-not-available">{fallbacks.notAvailable}</p>
          )}
        </section>

        <section aria-labelledby="runtime-heading">
          <h3 id="runtime-heading" className={`ui medium dividing header${labels.runtime ? '' : ' u-not-available'}`}>{labels.runtime}</h3>
          <p>
            {movie.runtime != null ? (
              <span>{movie.runtime} min</span>
            ) : (
              <span className="u-not-available">{fallbacks.notAvailable}</span>
            )}
          </p>
        </section>

        <section aria-labelledby="cast-heading">
          <h3 id="cast-heading" className={`ui medium dividing header${labels.cast ? '' : ' u-not-available'}`}>{labels.cast}</h3>
          {castMembers.length ? (
            <ul className="ui relaxed divided list">
              {castMembers.map((member) => (
                <li key={`movie-cast-${member.creditId ?? member.id ?? member.name}`}>
                  <strong>{member.name}</strong>{member.character && <span> — {member.character}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="u-not-available">{fallbacks.notAvailable}</p>
          )}
        </section>

        <section aria-labelledby="crew-heading">
          <h3 id="crew-heading" className={`ui medium dividing header${labels.crew ? '' : ' u-not-available'}`}>{labels.crew}</h3>
          {crew.length ? (
            <ul className="ui relaxed divided list">
              {crew.map((member) => (
                <li key={`movie-crew-${member.creditId ?? member.id ?? member.name}`}>
                  <strong>{member.name}</strong>{member.job && <span> — {member.job}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="u-not-available">{fallbacks.notAvailable}</p>
          )}
        </section>
      </main>
    </>
  );
}
