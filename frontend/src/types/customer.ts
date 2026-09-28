import type { PaymentStatus, ShipmentStatus, TransactionType } from './transaction';

export interface Customer {
  id: string;
  name: string;
  address: string;
  whatsapp: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { transactions: number };
}

export interface CustomerTransaction {
  id: string;
  trxNumber: string;
  type: TransactionType;
  total: string;
  createdAt: string;
  shipment?: { paymentStatus: PaymentStatus; shipmentStatus: ShipmentStatus } | null;
}

export interface CustomerDetail extends Customer {
  transactions: CustomerTransaction[];
}
