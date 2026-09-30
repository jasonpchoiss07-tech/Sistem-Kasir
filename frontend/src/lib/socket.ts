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
 * Realtime is enabled only when a socket server is reachable. In the Vercel
 * (serverless) deployment there is no WebSocket server, so realtime is off and
 * the UI refreshes on navigation/actions instead. Enabled in local dev, or when
 * explicitly turned on via VITE_REALTIME=on (e.g. a persistent backend host).
 */
export const REALTIME_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_REALTIME === 'on';

/**
 * Connects the shared socket using the JWT for handshake auth.
 * No-op when realtime is disabled (returns null). Safe to call multiple times.
 */
export function connectSocket(token: string): Socket | null {
  if (!REALTIME_ENABLED) return null;
  if (socket) return socket;
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
