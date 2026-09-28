import type { Request, Response } from 'express';
import { validate } from '../../utils/validate';
import { emitRealtime } from '../../realtime/socket';
import { recordAudit } from '../../services/audit';
import { createReturnSchema } from './returns.validation';
import * as service from './returns.service';

/** POST /api/returns (OWNER) */
export async function create(req: Request, res: Response): Promise<void> {
  const input = validate(createReturnSchema, req.body);
  const result = await service.createReturn(input, req.user!.id);
  emitRealtime('return:created', {});
  emitRealtime('stock:updated', {});
  await recordAudit({
    userId: req.user?.id,
    action: 'RETURN_CREATE',
    entity: 'Transaction',
    entityId: input.transactionId,
    metadata: { reason: input.reason ?? null, items: input.items },
  });
  res.status(201).json({ success: true, data: { return: result } });
}

/** GET /api/returns (OWNER) */
export async function list(_req: Request, res: Response): Promise<void> {
  const returns = await service.listReturns();
  res.json({ success: true, data: { returns } });
}
