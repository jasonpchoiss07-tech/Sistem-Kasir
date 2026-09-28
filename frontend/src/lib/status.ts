import type { PaymentStatus, ShipmentStatus } from '@/types/transaction';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger';

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  MENUNGGU_DIKIRIM: 'Menunggu Dikirim',
  SEDANG_DIKIRIM: 'Sedang Dikirim',
  SUDAH_DIKIRIM: 'Sudah Dikirim',
  DIBATALKAN: 'Dibatalkan',
};

export const SHIPMENT_STATUS_VARIANT: Record<ShipmentStatus, BadgeVariant> = {
  MENUNGGU_DIKIRIM: 'warning',
  SEDANG_DIKIRIM: 'neutral',
  SUDAH_DIKIRIM: 'success',
  DIBATALKAN: 'danger',
};

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'MENUNGGU_DIKIRIM',
  'SEDANG_DIKIRIM',
  'SUDAH_DIKIRIM',
  'DIBATALKAN',
];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PAID: 'Sudah Bayar',
  UNPAID: 'Belum Bayar',
};

export const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, BadgeVariant> = {
  PAID: 'success',
  UNPAID: 'danger',
};
