import { fetchTvShows } from '@/lib/services/tmdb';
import CardDefault from '@/components/CardDefault';

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
            <CardDefault
              id={show.id}
              mediaType="tv"
              title={show.name}
              date={show.first_air_date}
              rating={show.vote_average}
              imageUrl={show.poster_path ? `https://image.tmdb.org/t/p/w342${show.poster_path}` : ''}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
