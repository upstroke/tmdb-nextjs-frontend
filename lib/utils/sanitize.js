/**
 * Sanitizes user search input to prevent XSS and other injection attacks.
 *
 * - Removes HTML tags (script, iframe, img, svg, etc.)
 * - Removes javascript: protocol
 * - Removes event handlers (onclick, onerror, onload, etc.)
 * - Removes control characters
 * - Trims whitespace
 * - Truncates to 100 characters
 *
 * @param {unknown} input - The raw user input
 * @returns {string} - Sanitized search string
 */
export function sanitizeSearchInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    // Remove control characters (except tab, newline, carriage return)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove HTML tags (script, iframe, img, svg, object, embed, etc.)
    .replace(
      /<\/(script|iframe|img|svg|object|embed|video|audio|source|track|area|base|canvas|col|command|embed|keygen|map|param|path|rect|use)\b[^>]*>/gi,
      ''
    )
    .replace(
      /<(script|iframe|img|svg|object|embed|video|audio|source|track|area|base|canvas|col|command|embed|keygen|map|param|path|rect|use)\b[^>]*\/?\s*>/gi,
      ''
    )
    // Remove event handlers
    .replace(/\s*\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*\bon\w+\s*=\s*[^\s>"']+/gi, '')
    .trim();

  // Truncate to 100 characters
  return sanitized.length > 100 ? sanitized.slice(0, 100) : sanitized;
}
