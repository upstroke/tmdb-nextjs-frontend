// lib/utils/sanitize.js

/**
 * Sanitizes user input for search queries by:
 * - Trimming whitespace
 * - Removing potentially dangerous characters
 * - Limiting length
 * @param {string} input - Raw user input
 * @param {object} [options]
 * @param {number} [options.maxLength=200] - Maximum allowed length
 * @returns {string} Sanitized search query
 */
export function sanitizeSearchInput(input, options = {}) {
  const { maxLength = 200 } = options;

  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove control characters and null bytes
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}
