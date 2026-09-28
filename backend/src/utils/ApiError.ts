/**
 * Application-level error carrying an HTTP status code.
 * Throw this anywhere in the request lifecycle and the central error handler
 * will translate it into a consistent JSON response.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Bad Request', details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not Found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict', details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }

  static internal(message = 'Internal Server Error'): ApiError {
    return new ApiError(500, message);
  }
}
