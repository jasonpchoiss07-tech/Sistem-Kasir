/** Formats a number/decimal-string as Indonesian Rupiah (no decimals). */
export function formatRupiah(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

/** Formats an ISO date string as a readable local date-time (id-ID). */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
