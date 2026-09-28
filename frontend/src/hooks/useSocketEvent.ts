import { useEffect } from 'react';
import { getSocket, type RealtimeEvent } from '@/lib/socket';

/**
 * Subscribes to a realtime event for the lifetime of the component.
 * No-op if the socket is not connected yet. Pass a stable handler
 * (e.g. a useCallback) to avoid unnecessary re-subscriptions.
 */
export function useSocketEvent(event: RealtimeEvent, handler: (payload?: unknown) => void): void {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}
