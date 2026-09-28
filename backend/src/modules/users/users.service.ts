import { prisma } from '../../config/prisma';

/**
 * Lists all users, excluding the password hash.
 * Owner-only (enforced at the route via requireOwner). This backs the PRD
 * "Owner mengelola akun kasir" area; full CRUD is added in a later step.
 */
export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  });
}
