// lib/utils/sanitize.js

/**
 * Sanitizes user input for search queries by:
 * - Trimming whitespace
 * - Removing dangerous HTML tags (script, iframe, object, etc.)
 * - Removing control characters
 * - Limiting length
 * @param {string} input - Raw user input
 * @param {object} [options]
 * @param {number} [options.maxLength=100] - Maximum allowed length
 * @returns {string} Sanitized search query
 */
export function sanitizeSearchInput(input, options = {}) {
  const { maxLength = 100 } = options;

  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove dangerous HTML tags only (script, iframe, object, embed, etc.)
  // This allows normal < and > characters in text like "Movie & TV <Show>"
  sanitized = sanitized.replace(/<(script|iframe|object|embed|form|input|button|meta|link|style)\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<\/(script|iframe|object|embed|form|input|button|meta|link|style)>/gi, '');

  // Remove event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove control characters and null bytes
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}
