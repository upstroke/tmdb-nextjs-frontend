'use client';

import Image from 'next/image';
import { useI18n } from '@/lib/stores/locale';

/**
 * Renders the hero section at the top of a movie or TV show detail page.
 *
 * Displays the backdrop image as a full-width background, an overlaid poster,
 * the item title, and a list of production companies. Falls back to the poster
 * when no backdrop is available.
 *
 * @param {object} props
 * @param {string} props.title - Title of the movie or TV show.
 * @param {string} [props.backdrop] - Absolute URL of the backdrop image.
 * @param {string} [props.posterUrl] - Absolute URL of the poster image.
 * @param {Array<{id?: number|string, name: string}>} [props.productionCompanies=[]] - Production companies to list.
 * @param {string} [props.emptyLabel=''] - Text shown when productionCompanies is empty.
 * @returns {JSX.Element}
 */
export default function DetailsHero({ title, backdrop, posterUrl, productionCompanies = [], emptyLabel = '' }) {
  const { fallbacks } = useI18n();
  const notAvailableText = fallbacks.notAvailable;
  const fallbackImage = backdrop || posterUrl || '/not-available.png';
  const resolvedPosterUrl = posterUrl || '/not-available.png';
  const resolvedTitle = title?.trim() || notAvailableText;
  const resolvedEmptyLabel = emptyLabel?.trim() || notAvailableText;

  return (
    <section
      aria-labelledby="details-hero-title"
      className="details-hero"
      style={{ '--details-hero-backdrop': `url('${fallbackImage}')` }}
    >
      <div className="details-hero-overlay">
        <div className="details-hero-content">
          <div aria-hidden="true" className="details-hero-poster">
            <Image
              src={resolvedPosterUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 30vw, 185px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <h1 className="details-hero-title" id="details-hero-title">{resolvedTitle}</h1>
          <section aria-labelledby="details-hero-companies-heading" className="details-hero-companies">
            <h2 className="u-sr-only" id="details-hero-companies-heading">Produktionsfirmen</h2>
            <ul>
              {productionCompanies.length > 0
                ? productionCompanies.map((company) => (<li key={`header-company-${company.id ?? company.name}`} className="details-hero-company">{company.name}</li>))
                : <li className="details-hero-company">{resolvedEmptyLabel}</li>}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
