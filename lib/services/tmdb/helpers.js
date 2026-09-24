const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function getMediaType(item, fallback = null) {
  return fallback ?? item.media_type ?? (item.title ? 'movie' : item.name ? 'tv' : null);
}

export function getTitle(item) {
  return item.title ?? item.name ?? '';
}

export function getDate(item) {
  return item.release_date ?? item.first_air_date ?? '';
}

export function getImageUrl(path, size = 'w500') {
  if (!path) return '';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
