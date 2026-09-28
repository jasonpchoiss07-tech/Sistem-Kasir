import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

interface ErrorResponseBody {
  success: false;
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Central error-handling middleware. Must be registered last.
 * Produces a consistent JSON error envelope for the whole API.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // `next` is required for Express to recognize this as an error handler.
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  const body: ErrorResponseBody = {
    success: false,
    error: {
      message,
      statusCode,
      ...(details !== undefined ? { details } : {}),
      ...(!env.isProduction && err instanceof Error ? { stack: err.stack } : {}),
    },
  };

  res.status(statusCode).json(body);
}
