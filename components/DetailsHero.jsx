'use client';

import Image from 'next/image';
import { useI18n } from '@/lib/stores/locale';

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
          <div aria-hidden="true" className="details-hero-poster" style={{ position: 'relative' }}>
            <Image
              src={resolvedPosterUrl}
              alt=""
              fill
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
