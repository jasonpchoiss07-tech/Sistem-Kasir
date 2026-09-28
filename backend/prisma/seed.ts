import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Development seed.
 *
 * Creates the two accounts the app needs to function per the PRD:
 *   - exactly one OWNER (full control)
 *   - one KASIR (sales only)
 *
 * Idempotent: uses upsert on the unique `username`, so re-running does not
 * create duplicates. Passwords are hashed with bcrypt (never stored plaintext).
 *
 * Change these credentials before any real/production use.
 */
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main(): Promise<void> {
  const ownerPassword = await bcrypt.hash('owner123', SALT_ROUNDS);
  const kasirPassword = await bcrypt.hash('kasir123', SALT_ROUNDS);

  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      name: 'Owner',
      username: 'owner',
      passwordHash: ownerPassword,
      role: Role.OWNER,
    },
  });

  const kasir = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: {
      name: 'Kasir',
      username: 'kasir',
      passwordHash: kasirPassword,
      role: Role.KASIR,
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:');
  // eslint-disable-next-line no-console
  console.log(`  OWNER -> username: ${owner.username} / password: owner123`);
  // eslint-disable-next-line no-console
  console.log(`  KASIR -> username: ${kasir.username} / password: kasir123`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
