import type { Role } from '@/types/auth';

/** Landing route for each role after login. */
export function homeFor(role: Role): string {
  return role === 'OWNER' ? '/dashboard' : '/pos';
}
