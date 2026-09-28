import { useEffect, useState } from 'react';
import { Modal, Spinner, Badge, Alert } from '@/components/ui';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_VARIANT } from '@/lib/status';
import type { CustomerDetail } from '@/types/customer';
import { getCustomer } from './customers.api';

interface Props {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
}

/** Shows a customer's details and their purchase history. */
export function CustomerDetailModal({ open, customerId, onClose }: Props) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !customerId) return;
    setLoading(true);
    setError(null);
    setDetail(null);
    getCustomer(customerId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat data.'))
      .finally(() => setLoading(false));
  }, [open, customerId]);

  return (
    <Modal open={open} onClose={onClose} title="Detail Pelanggan">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6 text-slate-400" />
        </div>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : detail ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
            <p className="text-base font-semibold text-slate-900">{detail.name}</p>
            <p className="mt-1 text-sm text-slate-600">{detail.address}</p>
            {detail.whatsapp && <p className="text-sm text-slate-500">WA: {detail.whatsapp}</p>}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Riwayat Pembelian ({detail.transactions.length})
            </p>
            {detail.transactions.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Belum ada transaksi.</p>
            ) : (
              <ul className="space-y-2">
                {detail.transactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3 text-sm ring-1 ring-slate-200"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{t.trxNumber}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(t.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{formatRupiah(t.total)}</p>
                      {t.shipment && (
                        <Badge variant={PAYMENT_STATUS_VARIANT[t.shipment.paymentStatus]}>
                          {PAYMENT_STATUS_LABEL[t.shipment.paymentStatus]}
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
