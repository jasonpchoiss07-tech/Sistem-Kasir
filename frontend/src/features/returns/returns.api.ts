import { apiRequest } from '@/lib/api';
import type { ReturnRecord } from '@/types/return';

export interface CreateReturnBody {
  transactionId: string;
  reason?: string | null;
  items: { transactionItemId: string; quantity: number }[];
}

export function createReturn(body: CreateReturnBody) {
  return apiRequest<{ return: ReturnRecord }>('/returns', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((d) => d.return);
}

export function listReturns() {
  return apiRequest<{ returns: ReturnRecord[] }>('/returns').then((d) => d.returns);
}
