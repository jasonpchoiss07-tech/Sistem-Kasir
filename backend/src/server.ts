import http from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { disconnectPrisma } from './config/prisma';
import { initRealtime } from './realtime/socket';
import { assertProductionSecrets } from './config/env';

assertProductionSecrets();

const app = createApp();
const server = http.createServer(app);

// Attach realtime (Socket.IO) to the same HTTP server.
initRealtime(server);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] POS backend running at http://localhost:${env.port}`);
  // eslint-disable-next-line no-console
  console.log(`[server] Health check: http://localhost:${env.port}/api/health`);
  // eslint-disable-next-line no-console
  console.log(`[server] Realtime (Socket.IO) enabled`);
  // eslint-disable-next-line no-console
  console.log(`[server] Environment: ${env.nodeEnv}`);
});

/**
 * Graceful shutdown: close the HTTP server and disconnect Prisma.
 */
async function shutdown(signal: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`\n[server] Received ${signal}, shutting down...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
