import { apiRequest } from '@/lib/api';
import type { User } from '@/types/auth';

/** POST /api/auth/login */
export function loginRequest(username: string, password: string) {
  return apiRequest<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/** GET /api/auth/me */
export function meRequest() {
  return apiRequest<{ user: User }>('/auth/me');
}

/** POST /api/auth/logout (stateless on the server) */
export function logoutRequest() {
  return apiRequest<{ message: string }>('/auth/logout', { method: 'POST' });
}
