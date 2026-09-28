import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

/**
 * Role-based access control guard. Must run after `authenticate`.
 * Allows the request only if the authenticated user's role is in `allowed`.
 */
export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!allowed.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}

/** Convenience guard: OWNER only. */
export const requireOwner = requireRole(Role.OWNER);
