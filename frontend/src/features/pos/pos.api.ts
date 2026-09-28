import { apiRequest } from '@/lib/api';
import type { ReceiptPayload, TransactionType } from '@/types/transaction';

export interface CheckoutBody {
  type: TransactionType;
  cashReceived: number;
  items: { productId: string; quantity: number }[];
  customer?: { name: string; address: string; whatsapp?: string | null } | null;
}

export function checkout(body: CheckoutBody) {
  return apiRequest<ReceiptPayload>('/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getReceipt(id: string) {
  return apiRequest<ReceiptPayload>(`/transactions/${id}`);
}
