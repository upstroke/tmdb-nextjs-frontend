/**
 * Loads multiple TMDB resources in parallel, handling required and optional
 * resources with appropriate error handling.
 *
 * All resource load functions are invoked immediately and in parallel.
 * Results are checked in the original resource order after all promises
 * settle. If a required resource fails, result evaluation stops and an error
 * is returned; optional failures are logged but do not prevent returning
 * successful resources.
 *
 * @param {Function} createApi - Factory that returns a TMDB API instance.
 * @param {Array<{name: string, required?: boolean, load: (api: unknown) => Promise}>} resources -
 *   Array of resource descriptors. Each has a `name`, optional `required`
 *   (defaults to `true`), and a `load` function that receives the API
 *   instance and returns a Promise.
 * @param {string} fallbackMessage - Message to use when a non-Error rejection
 *   occurs for a required resource.
 * @returns {Promise<{data: Record<string, unknown>|null, error: string|null}>}
 *   On success: `{ data: { [name]: value, ... }, error: null }`.
 *   On required failure: `{ data: null, error: <message> }`.
 */
export async function loadTmdbResources(createApi, resources, fallbackMessage) {
  const api = createApi();

  // Start all resource promises in parallel immediately.
  const promises = resources.map((resource) => resource.load(api));

  // Wait for all to settle (does not throw on rejection).
  const results = await Promise.allSettled(promises);

  // Check results in the original resource order.
  const data = {};
  for (let i = 0; i < results.length; i++) {
    const resource = resources[i];
    const result = results[i];
    const isRequired = resource.required !== false; // defaults to true

    if (result.status === 'fulfilled') {
      data[resource.name] = result.value;
    } else {
      // A resource was rejected.
      const reason = result.reason;

      if (isRequired) {
        console.error(`[loadTmdbResources] Required resource "${resource.name}" failed.`);

        const errorMessage = reason instanceof Error ? reason.message : fallbackMessage;

        return { data: null, error: errorMessage };
      }

      console.warn(`[loadTmdbResources] Optional resource "${resource.name}" failed.`);
    }
  }

  return { data, error: null };
}
