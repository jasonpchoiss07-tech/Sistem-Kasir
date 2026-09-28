import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';

/** Realtime events broadcast to connected clients. */
export type RealtimeEvent =
  | 'transaction:created'
  | 'stock:updated'
  | 'product:changed'
  | 'shipment:updated'
  | 'return:created';

let io: Server | null = null;

/**
 * Attaches a Socket.IO server to the given HTTP server.
 * Connections must present a valid JWT via the handshake `auth.token`,
 * reusing the same auth as the REST API.
 */
export function initRealtime(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.corsOrigin, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('unauthorized'));
    try {
      const payload = verifyToken(token);
      socket.data.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (_socket: Socket) => {
    // Clients only listen for broadcasts; no inbound events needed for v1.
  });

  return io;
}

/** Broadcasts an event to all connected clients (no-op if not initialized). */
export function emitRealtime(event: RealtimeEvent, payload: Record<string, unknown> = {}): void {
  io?.emit(event, payload);
}
