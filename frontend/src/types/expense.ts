export type ExpenseCategory = 'PEMBAYARAN_SALES' | 'LAINNYA';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: string;
  note: string | null;
  occurredAt: string;
  createdAt: string;
  user?: { id: string; name: string; username: string } | null;
}

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  PEMBAYARAN_SALES: 'Pembayaran Sales',
  LAINNYA: 'Lainnya',
};
