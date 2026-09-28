import { io, type Socket } from 'socket.io-client';

/** Realtime events emitted by the backend. */
export type RealtimeEvent =
  | 'transaction:created'
  | 'stock:updated'
  | 'product:changed'
  | 'shipment:updated'
  | 'return:created';

let socket: Socket | null = null;

/**
 * Connects the shared socket using the JWT for handshake auth.
 * Safe to call multiple times; only one connection is kept.
 * In dev, Vite proxies /socket.io to the backend.
 */
export function connectSocket(token: string): Socket {
  if (socket) return socket;
  // Empty origin (dev) → same-origin via Vite proxy; in production this is the
  // backend origin from VITE_API_URL.
  const origin = import.meta.env.VITE_API_URL || '/';
  socket = io(origin, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
