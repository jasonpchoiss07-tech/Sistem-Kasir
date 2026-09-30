import { apiRequest } from '@/lib/api';
import type { Expense, ExpenseCategory } from '@/types/expense';

export interface ListExpensesParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  category?: ExpenseCategory;
}

export interface ExpenseListResult {
  expenses: Expense[];
  total: string;
}

export function listExpenses(params: ListExpensesParams = {}) {
  const q = new URLSearchParams();
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  if (params.category) q.set('category', params.category);
  const qs = q.toString();
  return apiRequest<ExpenseListResult>(`/expenses${qs ? `?${qs}` : ''}`);
}

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  note?: string | null;
  occurredAt?: string; // YYYY-MM-DD
}

export function createExpense(body: ExpenseInput) {
  return apiRequest<{ expense: Expense }>('/expenses', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((d) => d.expense);
}

export function deleteExpense(id: string) {
  return apiRequest<{ id: string }>(`/expenses/${id}`, { method: 'DELETE' });
}
