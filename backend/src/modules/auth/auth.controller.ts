import type { Request, Response } from 'express';
import { validate } from '../../utils/validate';
import { ApiError } from '../../utils/ApiError';
import { loginSchema } from './auth.validation';
import * as authService from './auth.service';

/** POST /api/auth/login */
export async function login(req: Request, res: Response): Promise<void> {
  const input = validate(loginSchema, req.body);
  const result = await authService.login(input);
  res.json({ success: true, data: result });
}

/** GET /api/auth/me (requires authentication) */
export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ success: true, data: { user } });
}

/**
 * POST /api/auth/logout
 * Stateless JWT: nothing to invalidate server-side, the client discards the
 * token. Kept for a clean client contract.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: { message: 'Logged out' } });
}
