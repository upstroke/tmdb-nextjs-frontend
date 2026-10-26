# Type safety strategy

Type safety is achieved through two complementary tools:

- **JSDoc** — for documenting function signatures, parameters, and return types directly in the source code. JSDoc comments provide IDE type hints and serve as inline documentation. Use `@param`, `@returns`, and `@typedef` for important or non-obvious functions.
- **Zod** — for runtime validation of external data (API responses, form inputs). Zod schemas live in `lib/schemas/` and are used in API routes and wherever data from external sources enters the application.

## When to use which

| Use case | Tool |
| --- | --- |
| Component props | JSDoc `@param` |
| Function signatures | JSDoc `@param` / `@returns` |
| Shared type definitions | JSDoc `@typedef` |
| API response validation | Zod |
| Form input validation | Zod |
| External data ingestion | Zod |
