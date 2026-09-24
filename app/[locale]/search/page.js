import { searchMedia } from '@/lib/services/tmdb';
import CardDefault from '@/components/CardDefault';

export default async function SearchPage({ params, searchParams }) {
  const { locale } = params;
  const query = searchParams?.q ?? '';
  const page = Number(searchParams?.page ?? 1);

  if (!query) {
    return <div><h1>Search</h1><p>Enter a search term.</p></div>;
  }

  const data = await searchMedia(query, 'multi', locale, page);

  return (
    <div>
      <h1>Search: {query}</h1>
      <ul>
        {data.results.map((item) => (
          <li key={item.id}>
            <CardDefault
              id={item.id}
              mediaType={item.media_type === 'tv' ? 'tv' : 'movie'}
              title={item.title ?? item.name}
              date={item.release_date ?? item.first_air_date}
              rating={item.vote_average}
              imageUrl={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : ''}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
