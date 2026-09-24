import Image from 'next/image';
import { useI18n } from '@/lib/stores/locale';

export default function DetailsHero({ title, backdropUrl, posterUrl, tagline }) {
  const { fallbacks } = useI18n();
  const notAvailableText = fallbacks.notAvailable;
  const heroTitle = title?.trim() || notAvailableText;
  const heroTagline = tagline?.trim() || '';

  return (
    <div className="details-hero">
      {backdropUrl && (
        <div className="details-hero-backdrop">
          <Image src={backdropUrl} alt="" fill style={{ objectFit: 'cover' }} priority />
          <div className="details-hero-backdrop-overlay" />
        </div>
      )}
      <div className="details-hero-body">
        {posterUrl && (
          <figure className="details-hero-poster">
            <Image src={posterUrl} alt={`${heroTitle} Poster`} width={185} height={278} />
          </figure>
        )}
        <div className="details-hero-text">
          <h1 className={`details-hero-title${heroTitle ? '' : ' u-not-available'}`}>{heroTitle}</h1>
          {heroTagline && <p className="details-hero-tagline">{heroTagline}</p>}
        </div>
      </div>
    </div>
  );
}
