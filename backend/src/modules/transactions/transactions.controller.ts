import type { Request, Response } from 'express';
import { validate } from '../../utils/validate';
import { env } from '../../config/env';
import { emitRealtime } from '../../realtime/socket';
import {
  checkoutSchema,
  listTransactionsQuerySchema,
  shipmentUpdateSchema,
} from './transactions.validation';
import * as service from './transactions.service';

/** POST /api/transactions — checkout (OWNER + KASIR). */
export async function checkout(req: Request, res: Response): Promise<void> {
  const input = validate(checkoutSchema, req.body);
  const transaction = await service.checkout(input, req.user!.id);
  emitRealtime('transaction:created', { id: transaction.id, type: transaction.type });
  emitRealtime('stock:updated', {});
  res.status(201).json({
    success: true,
    data: { storeName: env.storeName, transaction },
  });
}

/** GET /api/transactions — history list with filters (OWNER + KASIR). */
export async function list(req: Request, res: Response): Promise<void> {
  const query = validate(listTransactionsQuerySchema, req.query);
  const transactions = await service.listTransactions(query);
  res.json({ success: true, data: { transactions } });
}

/** GET /api/transactions/:id — receipt data (OWNER + KASIR). */
export async function getOne(req: Request, res: Response): Promise<void> {
  const transaction = await service.getTransaction(req.params.id);
  res.json({
    success: true,
    data: { storeName: env.storeName, transaction },
  });
}

/** PATCH /api/transactions/:id/shipment — update delivery status (both roles). */
export async function updateShipment(req: Request, res: Response): Promise<void> {
  const input = validate(shipmentUpdateSchema, req.body);
  const shipment = await service.updateShipment(req.params.id, input);
  emitRealtime('shipment:updated', { transactionId: req.params.id });
  res.json({ success: true, data: { shipment } });
}
