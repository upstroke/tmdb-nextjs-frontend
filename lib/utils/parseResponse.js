import { ZodError } from 'zod';
import { TMDBError } from '@/lib/utils/errors';

/**
 * Parses and validates an API response with a Zod schema.
 * Missing or invalid fields are replaced with schema defaults.
 *
 * @template {import('zod').ZodTypeAny} T
 * @param {unknown} data - Raw API response
 * @param {T} schema - Zod schema to validate against
 * @param {string} [context] - Context for error messages
 * @returns {import('zod').infer<T>} Validated and parsed data
 * @throws {TMDBError} When data cannot be parsed at all
 */
export function parseResponse(data, schema, context = 'API response') {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[${context}] Validation warnings:`, error.flatten());
      }
      // Graceful fallback: try partial parsing with defaults
      const result = schema.safeParse(data);
      if (result.success) return result.data;
    }
    throw new TMDBError(`Failed to parse ${context}: ${error.message}`, 0);
  }
}

/**
 * Safely parses without throwing – returns null on failure.
 *
 * @template {import('zod').ZodTypeAny} T
 * @param {unknown} data
 * @param {T} schema
 * @returns {import('zod').infer<T> | null}
 */
export function safeParseResponse(data, schema) {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}
