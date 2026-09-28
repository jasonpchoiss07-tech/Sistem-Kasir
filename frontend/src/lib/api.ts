import { tokenStore } from './token';
import { API_ORIGIN } from './asset';

/**
 * Base URL for the backend API.
 * - Development: VITE_API_URL is empty → "/api" (Vite proxies to the backend).
 * - Production: VITE_API_URL = backend origin (e.g. https://api.site.com) →
 *   "https://api.site.com/api".
 */
export const API_BASE_URL = `${API_ORIGIN}/api`;

/** Error thrown for non-2xx API responses, carrying the HTTP status. */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** Standard success envelope from the backend. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/**
 * Thin fetch wrapper: attaches the bearer token, parses JSON, and throws an
 * ApiError on failure. Returns the parsed `data` payload directly.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error?.message ?? `Request failed (${response.status})`;
    throw new ApiError(response.status, message, body?.error?.details);
  }

  return (body as ApiSuccess<T>).data;
}
