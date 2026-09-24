import { fetchTvShows } from '@/lib/services/tmdb';
import { TvShowCard } from '@/components/media/TvShowCard';

export default async function TvShowsPage({ params, searchParams }) {
  const { locale } = params;
  const page = Number(searchParams?.page ?? 1);

  const data = await fetchTvShows('popular', locale, page);

  return (
    <div>
      <h1>TV Shows</h1>
      <ul>
        {data.results.map((show) => (
          <li key={show.id}>
            <TvShowCard show={show} locale={locale} />
          </li>
        ))}
      </ul>
    </div>
  );
}
