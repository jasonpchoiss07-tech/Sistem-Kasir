import type { Request, Response } from 'express';
import * as service from './dashboard.service';

/** GET /api/dashboard/summary (OWNER only) */
export async function summary(_req: Request, res: Response): Promise<void> {
  const data = await service.getSummary();
  res.json({ success: true, data });
}
