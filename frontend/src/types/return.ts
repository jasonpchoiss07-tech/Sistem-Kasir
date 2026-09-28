export interface ReturnRecord {
  id: string;
  createdAt: string;
  reason: string | null;
  owner: { id: string; name: string };
  transaction: { id: string; trxNumber: string };
  items: {
    id: string;
    quantity: number;
    transactionItem: { productNameSnapshot: string; unitSnapshot: string };
  }[];
}
