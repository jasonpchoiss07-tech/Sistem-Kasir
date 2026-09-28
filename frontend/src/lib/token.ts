const STORAGE_KEY = 'pos_token';

/**
 * Small wrapper around localStorage for the JWT access token.
 * Kept in one place so the API client and auth context stay in sync.
 */
export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },
  set(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
