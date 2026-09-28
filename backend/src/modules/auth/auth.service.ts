import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { signToken } from '../../utils/jwt';
import type { LoginInput } from './auth.validation';

/** Shape of the user object exposed to clients (never includes passwordHash). */
export interface PublicUser {
  id: string;
  name: string;
  username: string;
  role: User['role'];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Authenticates a user by username + password.
 * Uses a constant, non-revealing error message so we don't disclose whether
 * the username or the password was the problem.
 */
export async function login(
  input: LoginInput,
): Promise<{ token: string; user: PublicUser }> {
  const user = await prisma.user.findUnique({ where: { username: input.username } });

  const invalid = ApiError.unauthorized('Invalid username or password');

  if (!user) {
    // Compare against a dummy hash to reduce timing side-channels.
    await bcrypt.compare(input.password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidina');
    throw invalid;
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is disabled');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw invalid;
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
    username: user.username,
    name: user.name,
  });

  return { token, user: toPublicUser(user) };
}

/**
 * Returns the current user's fresh profile from the database.
 * Ensures a disabled/deleted account cannot keep using an old token.
 */
export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account not found or disabled');
  }
  return toPublicUser(user);
}
