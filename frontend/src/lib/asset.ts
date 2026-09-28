/**
 * Backend origin. Empty in development (Vite proxies /api, /uploads, /socket.io
 * to the backend). In production set VITE_API_URL to the backend base URL,
 * e.g. https://api.namatoko.com
 */
export const API_ORIGIN = import.meta.env.VITE_API_URL || '';

/**
 * Resolves a stored asset path (e.g. "/uploads/x.png") to an absolute URL when
 * a backend origin is configured. Leaves absolute/blob/data URLs untouched so
 * local image previews keep working.
 */
export function assetUrl(pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith('/')) return `${API_ORIGIN}${pathOrUrl}`;
  return pathOrUrl; // http(s):, blob:, data:
}
