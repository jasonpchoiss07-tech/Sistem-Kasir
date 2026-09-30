import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import type { CreateExpenseInput, ListExpensesQuery } from './expenses.validation';

const expenseInclude = {
  user: { select: { id: true, name: true, username: true } },
} satisfies Prisma.ExpenseInclude;

/** Makes `to` inclusive of the whole day when only a date (no time) is given. */
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Lists expenses (newest first) with an optional date range / category filter,
 * plus the summed total of the matching rows.
 */
export async function listExpenses(query: ListExpensesQuery) {
  const where: Prisma.ExpenseWhereInput = {};

  if (query.category) where.category = query.category;

  if (query.from || query.to) {
    where.occurredAt = {};
    if (query.from) where.occurredAt.gte = query.from;
    if (query.to) where.occurredAt.lte = endOfDay(query.to);
  }

  const [expenses, agg] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      include: expenseInclude,
    }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);

  return { expenses, total: (agg._sum.amount ?? 0).toString() };
}

export async function createExpense(input: CreateExpenseInput, userId: string) {
  return prisma.expense.create({
    data: {
      category: input.category,
      amount: input.amount,
      note: input.note ?? null,
      occurredAt: input.occurredAt ?? new Date(),
      userId,
    },
    include: expenseInclude,
  });
}

export async function deleteExpense(id: string) {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Pengeluaran tidak ditemukan');
  await prisma.expense.delete({ where: { id } });
  return { id };
}
