import type { ZodTypeAny, z } from 'zod';
import { ApiError } from './ApiError';

/**
 * Validates and parses unknown input against a Zod schema, returning the
 * schema's *output* type (so defaults/transforms are reflected).
 * On failure, throws a 400 ApiError with structured field details.
 */
export function validate<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw ApiError.badRequest('Validation failed', details);
  }
  return result.data;
}
