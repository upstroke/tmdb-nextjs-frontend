import { useI18n } from '@/lib/stores/i18n';
import notAvailable from '@/lib/assets/not-available.png';

interface ProductionCompany {
  id?: number | string;
  name?: string;
  logoPath?: string;
}

interface DetailsHeroProps {
  title: string;
  backdrop: string;
  posterUrl: string;
  productionCompanies?: ProductionCompany[];
  emptyLabel?: string;
}

/**
 * Renders the shared hero section for detail pages.
 * Backdrop as large background, poster/title/companies as centered overlay.
 */
export default function DetailsHero({
  title,
  backdrop,
  posterUrl,
  productionCompanies = [],
  emptyLabel = '',
}: DetailsHeroProps) {
  const { fallbacks } = useI18n();
  const notAvailableText = fallbacks.notAvailable;
  const fallbackImage = backdrop || posterUrl || notAvailable.src;
  const resolvedPosterUrl = posterUrl || notAvailable.src;
  const resolvedTitle = title?.trim() || notAvailableText;
  const resolvedEmptyLabel = emptyLabel?.trim() || notAvailableText;

  return (
    <section
      aria-labelledby="details-hero-title"
      className="details-hero"
      // @ts-expect-error CSS custom property
      style={{ '--details-hero-backdrop': `url('${fallbackImage}')` }}
    >
      <div className="details-hero-overlay">
        <div className="details-hero-content">
          <div aria-hidden="true" className="details-hero-poster">
            <img alt="" src={resolvedPosterUrl} />
          </div>

          <h1 className="details-hero-title" id="details-hero-title">
            {resolvedTitle}
          </h1>

          <section
            aria-labelledby="details-hero-companies-heading"
            className="details-hero-companies"
          >
            <h2 className="u-sr-only" id="details-hero-companies-heading">
              Produktionsfirmen
            </h2>
            <ul>
              {productionCompanies.length > 0 ? (
                productionCompanies.map((company) => (
                  <li
                    key={`header-company-${company.id ?? company.name}`}
                    className="details-hero-company"
                  >
                    {company.name}
                  </li>
                ))
              ) : (
                <li className="details-hero-company">{resolvedEmptyLabel}</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
