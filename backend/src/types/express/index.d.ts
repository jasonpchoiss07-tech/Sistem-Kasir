import type { Role } from '@prisma/client';

/**
 * Augments Express' Request with the authenticated user, populated by the
 * `authenticate` middleware after a valid JWT is verified.
 */
declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: Role;
      username: string;
      name: string;
    }

    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
