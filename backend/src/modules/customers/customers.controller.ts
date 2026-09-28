import type { Request, Response } from 'express';
import { validate } from '../../utils/validate';
import { createCustomerSchema, updateCustomerSchema } from './customers.validation';
import * as service from './customers.service';

/** GET /api/customers (OWNER) */
export async function list(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
  const customers = await service.listCustomers(search || undefined);
  res.json({ success: true, data: { customers } });
}

/** GET /api/customers/:id (OWNER) — includes purchase history */
export async function getOne(req: Request, res: Response): Promise<void> {
  const customer = await service.getCustomer(req.params.id);
  res.json({ success: true, data: { customer } });
}

/** POST /api/customers (OWNER) */
export async function create(req: Request, res: Response): Promise<void> {
  const input = validate(createCustomerSchema, req.body);
  const customer = await service.createCustomer(input);
  res.status(201).json({ success: true, data: { customer } });
}

/** PATCH /api/customers/:id (OWNER) */
export async function update(req: Request, res: Response): Promise<void> {
  const input = validate(updateCustomerSchema, req.body);
  const customer = await service.updateCustomer(req.params.id, input);
  res.json({ success: true, data: { customer } });
}
