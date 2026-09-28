import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
}

/**
 * Records an audit entry for traceability of important actions.
 * Best-effort: failures are logged but never block the main operation.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        metadata:
          entry.metadata === undefined || entry.metadata === null
            ? Prisma.JsonNull
            : (entry.metadata as Prisma.InputJsonValue),
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[audit] failed to record', entry.action, err);
  }
}

/** Recent audit log entries (owner view). */
export async function listAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { id: true, name: true, username: true } } },
  });
}
