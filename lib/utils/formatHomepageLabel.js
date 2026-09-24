/**
 * Removes the HTTP or HTTPS protocol from a homepage URL for compact display.
 *
 * @param {string} [url=''] - Complete or already shortened URL.
 * @returns {string} URL without leading protocol.
 */
export function formatHomepageLabel(url = '') {
  return url.replace(/^https?:\/\//, '');
}
