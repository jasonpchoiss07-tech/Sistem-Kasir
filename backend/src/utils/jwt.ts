import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

/**
 * Claims embedded in the access token.
 * `sub` is the user id (standard JWT subject claim).
 */
export interface JwtPayload {
  sub: string;
  role: Role;
  username: string;
  name: string;
}

/**
 * Signs a stateless access token. When it expires the user simply logs in
 * again (no refresh token in v1, per the approved plan).
 */
export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwt.secret, options);
}

/**
 * Verifies and decodes an access token. Throws if invalid/expired.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwt.secret);
  return decoded as JwtPayload;
}
