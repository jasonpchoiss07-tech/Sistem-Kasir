export interface Product {
  id: string;
  name: string;
  edx: string;
  photoUrl: string | null;
  unit: string;
  /** Decimal serialized as string by Prisma. */
  sellPrice: string;
  stock: number;
  minStock: number;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockAdjustmentType = 'STOCK_IN' | 'ADJUSTMENT';

export interface StockAdjustment {
  id: string;
  type: StockAdjustmentType;
  quantityChange: number;
  resultingStock: number;
  note: string | null;
  createdAt: string;
  user?: { id: string; name: string; username: string } | null;
}

/** Common building-material units (free text also allowed). */
export const COMMON_UNITS = ['Sak', 'Batang', 'Kg', 'Meter', 'Dus', 'Pcs', 'Liter', 'Set', 'Roll', 'Lembar'];
