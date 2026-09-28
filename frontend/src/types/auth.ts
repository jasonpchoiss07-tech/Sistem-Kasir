/** Roles mirror the backend Prisma `Role` enum. */
export type Role = 'OWNER' | 'KASIR';

/** Public user shape returned by the backend (never includes passwordHash). */
export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
