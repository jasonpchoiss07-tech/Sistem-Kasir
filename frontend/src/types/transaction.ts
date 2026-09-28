export type TransactionType = 'BELI_LANGSUNG' | 'PENGIRIMAN';

export interface ReceiptItem {
  id: string;
  productNameSnapshot: string;
  unitSnapshot: string;
  sellPriceSnapshot: string;
  quantity: number;
  returnedQty: number;
  subtotal: string;
}

export type ShipmentStatus =
  | 'MENUNGGU_DIKIRIM'
  | 'SEDANG_DIKIRIM'
  | 'SUDAH_DIKIRIM'
  | 'DIBATALKAN';
export type PaymentStatus = 'PAID' | 'UNPAID';

/** Summary row for the transaction history list. */
export interface TransactionListItem {
  id: string;
  trxNumber: string;
  type: TransactionType;
  total: string;
  createdAt: string;
  customer?: { id: string; name: string } | null;
  shipment?: { paymentStatus: PaymentStatus; shipmentStatus: ShipmentStatus } | null;
  cashier: { id: string; name: string };
  _count: { items: number; returns: number };
}

export interface ReceiptTransaction {
  id: string;
  trxNumber: string;
  type: TransactionType;
  total: string;
  cashReceived: string | null;
  change: string | null;
  createdAt: string;
  items: ReceiptItem[];
  customer?: { id: string; name: string; address: string; whatsapp: string | null } | null;
  cashier: { id: string; name: string; username: string };
  shipment?: { paymentStatus: PaymentStatus; shipmentStatus: ShipmentStatus } | null;
}

export interface ReceiptPayload {
  storeName: string;
  transaction: ReceiptTransaction;
}

/** A line in the cashier's cart (client-side only). */
export interface CartItem {
  productId: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  stock: number;
}
