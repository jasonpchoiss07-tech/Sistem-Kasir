import { createApp } from '../src/app';
import { assertProductionSecrets } from '../src/config/env';

/**
 * Vercel serverless entry. An Express app is a valid (req, res) handler, so we
 * export it directly. Realtime (Socket.IO) is NOT initialized here — serverless
 * cannot hold WebSocket connections; realtime runs only in the local dev server
 * (src/server.ts).
 */
assertProductionSecrets();

const app = createApp();

export default app;
