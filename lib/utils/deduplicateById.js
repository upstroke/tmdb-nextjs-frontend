/**
 * Removes entries without a valid ID and duplicate IDs from a list.
 *
 * The first entry with a specific ID is preserved.
 * Further entries with the same ID are removed.
 * The original order is maintained.
 *
 * @param {Array<{id: string|number}>} items - List of objects with IDs.
 * @returns {Array<{id: string|number}>} Cleaned list without duplicate IDs.
 */
export function deduplicateById(items = []) {
  const seen = new Set();

  return items.filter((item) => {
    if (item?.id == null || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
