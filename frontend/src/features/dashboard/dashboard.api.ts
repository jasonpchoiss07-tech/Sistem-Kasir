import { apiRequest } from '@/lib/api';
import type { ReturnRecord } from '@/types/return';
import type { TransactionListItem } from '@/types/transaction';

export interface LowStockProduct {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
}

export interface DashboardSummary {
  sales: {
    today: { amount: string; count: number; itemsSold: number };
    last7: string;
    month: string;
    outstanding: string;
    expensesToday: string;
  };
  products: {
    total: number;
    totalStock: number;
    lowStockCount: number;
    lowStock: LowStockProduct[];
  };
  recentTransactions: TransactionListItem[];
  recentReturns: ReturnRecord[];
  deliveries: {
    pending: TransactionListItem[];
    statusCounts: Record<string, number>;
  };
  transactions: { total: number };
}

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>('/dashboard/summary');
}
