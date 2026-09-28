import { PrismaClient } from '@prisma/client';

/**
 * Lazily-initialized shared PrismaClient.
 *
 * The real client is only created on first property access, so the server can
 * boot during Step 1 (Foundation) before any Prisma models are defined or
 * PostgreSQL is available. Once models exist and `prisma generate` has run,
 * this transparently behaves like a normal PrismaClient instance.
 */
let client: PrismaClient | null = null;

function getClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
    });
  }
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

export async function disconnectPrisma(): Promise<void> {
  if (client) {
    await client.$disconnect();
  }
}
