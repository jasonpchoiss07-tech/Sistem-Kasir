import { apiRequest } from '@/lib/api';
import type {
  PaymentStatus,
  ReceiptPayload,
  ShipmentStatus,
  TransactionListItem,
  TransactionType,
} from '@/types/transaction';

export interface HistoryParams {
  type?: TransactionType;
  trxNumber?: string;
  from?: string;
  to?: string;
}

export function listTransactions(params: HistoryParams = {}) {
  const q = new URLSearchParams();
  if (params.type) q.set('type', params.type);
  if (params.trxNumber) q.set('trxNumber', params.trxNumber);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  return apiRequest<{ transactions: TransactionListItem[] }>(
    `/transactions${qs ? `?${qs}` : ''}`,
  ).then((d) => d.transactions);
}

export function getTransaction(id: string) {
  return apiRequest<ReceiptPayload>(`/transactions/${id}`);
}

export function updateShipment(
  id: string,
  body: { shipmentStatus?: ShipmentStatus; paymentStatus?: PaymentStatus },
) {
  return apiRequest<{ shipment: { paymentStatus: PaymentStatus; shipmentStatus: ShipmentStatus } }>(
    `/transactions/${id}/shipment`,
    { method: 'PATCH', body: JSON.stringify(body) },
  ).then((d) => d.shipment);
}
