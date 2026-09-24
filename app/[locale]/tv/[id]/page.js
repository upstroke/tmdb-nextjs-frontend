import { fetchTvDetails } from '@/lib/services/tmdb';

export default async function TvDetailPage({ params }) {
  const { locale, id } = params;

  const show = await fetchTvDetails(Number(id), locale);

  return (
    <div>
      <h1>{show.name}</h1>
      <p>{show.overview}</p>
    </div>
  );
}
