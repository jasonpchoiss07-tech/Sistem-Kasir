import { z } from 'zod';

const positiveMoney = z
  .number({ invalid_type_error: 'Jumlah harus berupa angka' })
  .positive('Jumlah harus lebih dari 0')
  .finite();

export const createExpenseSchema = z.object({
  category: z.enum(['PEMBAYARAN_SALES', 'LAINNYA']).optional().default('PEMBAYARAN_SALES'),
  amount: positiveMoney,
  note: z.string().trim().max(300).optional().nullable(),
  // Business date of the expense. Accepts 'YYYY-MM-DD' or a full ISO string.
  occurredAt: z.coerce.date().optional(),
});

export const listExpensesQuerySchema = z.object({
  category: z.enum(['PEMBAYARAN_SALES', 'LAINNYA']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
