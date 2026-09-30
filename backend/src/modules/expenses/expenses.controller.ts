import type { Request, Response } from 'express';
import { validate } from '../../utils/validate';
import { emitRealtime } from '../../realtime/socket';
import { recordAudit } from '../../services/audit';
import { createExpenseSchema, listExpensesQuerySchema } from './expenses.validation';
import * as service from './expenses.service';

/** GET /api/expenses?from=&to=&category= (OWNER) — history + total */
export async function list(req: Request, res: Response): Promise<void> {
  const query = validate(listExpensesQuerySchema, req.query);
  const { expenses, total } = await service.listExpenses(query);
  res.json({ success: true, data: { expenses, total } });
}

/** POST /api/expenses (OWNER) */
export async function create(req: Request, res: Response): Promise<void> {
  const input = validate(createExpenseSchema, req.body);
  const userId = req.user!.id;
  const expense = await service.createExpense(input, userId);
  emitRealtime('expense:changed', { id: expense.id });
  await recordAudit({
    userId,
    action: 'EXPENSE_CREATE',
    entity: 'Expense',
    entityId: expense.id,
    metadata: {
      category: expense.category,
      amount: expense.amount.toString(),
      occurredAt: expense.occurredAt.toISOString(),
      note: expense.note,
    },
  });
  res.status(201).json({ success: true, data: { expense } });
}

/** DELETE /api/expenses/:id (OWNER) */
export async function remove(req: Request, res: Response): Promise<void> {
  const result = await service.deleteExpense(req.params.id);
  emitRealtime('expense:changed', { id: req.params.id });
  await recordAudit({
    userId: req.user?.id,
    action: 'EXPENSE_DELETE',
    entity: 'Expense',
    entityId: req.params.id,
  });
  res.json({ success: true, data: result });
}
