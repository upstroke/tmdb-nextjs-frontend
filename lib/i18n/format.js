/**
 * Fills `{key}` placeholders in a translated message.
 *
 * Pure function without browser APIs, so it works in server and client
 * components and adds no client-side script of its own.
 * Unknown placeholders stay unchanged.
 *
 * @param {string} template - Message with placeholders, e.g. "Poster of {title}".
 * @param {Record<string, string|number>} [values={}] - Values by placeholder name.
 * @returns {string} The message with all known placeholders replaced.
 * @example
 * formatMessage('Watch trailer {index}', { index: 2 }); // 'Watch trailer 2'
 */
export function formatMessage(template, values = {}) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}
