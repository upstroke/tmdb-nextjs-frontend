/**
 * @typedef {object} MediaItem
 * @property {string|number} id - Unique ID of the media item.
 * @property {string} mediaType - Media type, e.g. `movie` or `tv`.
 */

/**
 * Creates a stable key to uniquely identify a media item.
 *
 * Both `mediaType` and `id` must be present. If either value is missing,
 * the function returns `null` so the item is ignored during deduplication.
 *
 * @param {MediaItem} item
 * @returns {string|null} Combined key in the format `mediaType-id` or `null`.
 */
export function getMediaKey(item) {
  if (!item || item.id == null || !item.mediaType) return null;
  return `${item.mediaType}-${item.id}`;
}

/**
 * Removes duplicate media items from an array.
 *
 * Deduplication is based on the combination of `mediaType` and `id`.
 * The first entry with a unique key is preserved, later duplicates are removed.
 * Elements without a valid key are skipped.
 *
 * @param {Array<MediaItem>} items - List of media items to clean up.
 * @returns {Array<MediaItem>} New array with only the first occurrence of each unique media item.
 */
export function deduplicateMedia(items = []) {
  const seen = new Set();

  return items.filter((item) => {
    const key = getMediaKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
