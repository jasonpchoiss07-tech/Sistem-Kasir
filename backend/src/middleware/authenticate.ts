import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

/**
 * Authentication middleware.
 * Requires a valid `Authorization: Bearer <token>` header, verifies the JWT,
 * and attaches the decoded user to `req.user`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw ApiError.unauthorized('Missing bearer token');
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      username: payload.username,
      name: payload.name,
    };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}
