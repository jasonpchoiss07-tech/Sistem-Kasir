import { useCallback, useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { Alert, Spinner, Badge, EmptyState, PageHeader } from '@/components/ui';
import { formatRupiah, formatDateTime } from '@/lib/format';
import {
  SHIPMENT_STATUS_LABEL,
  SHIPMENT_STATUS_VARIANT,
  SHIPMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
} from '@/lib/status';
import type { PaymentStatus, ShipmentStatus, TransactionListItem } from '@/types/transaction';
import { listTransactions, updateShipment } from '@/features/transactions/transactions.api';

export function DeliveryPage() {
  const [rows, setRows] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listTransactions({ type: 'PENGIRIMAN' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pengiriman.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useSocketEvent('shipment:updated', load);
  useSocketEvent('transaction:created', load);

  async function changeShipment(id: string, shipmentStatus: ShipmentStatus) {
    setSavingId(id);
    setError(null);
    try {
      await updateShipment(id, { shipmentStatus });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status.');
    } finally {
      setSavingId(null);
    }
  }

  async function togglePayment(id: string, current: PaymentStatus) {
    setSavingId(id);
    setError(null);
    try {
      await updateShipment(id, { paymentStatus: current === 'PAID' ? 'UNPAID' : 'PAID' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Pengiriman" description="Kelola status pesanan yang perlu dikirim." />

      {error && <Alert className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-slate-400" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Truck} title="Belum ada pengiriman" description="Pesanan 'Pesan + Kirim' akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{r.trxNumber}</p>
                    {r.shipment && (
                      <Badge variant={SHIPMENT_STATUS_VARIANT[r.shipment.shipmentStatus]}>
                        {SHIPMENT_STATUS_LABEL[r.shipment.shipmentStatus]}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {r.customer?.name ?? '-'} · {formatRupiah(r.total)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {r.shipment && (
                    <button
                      type="button"
                      disabled={savingId === r.id}
                      onClick={() => togglePayment(r.id, r.shipment!.paymentStatus)}
                      title="Klik untuk ubah status bayar"
                    >
                      <Badge variant={PAYMENT_STATUS_VARIANT[r.shipment.paymentStatus]}>
                        {PAYMENT_STATUS_LABEL[r.shipment.paymentStatus]}
                      </Badge>
                    </button>
                  )}
                  <select
                    value={r.shipment?.shipmentStatus}
                    disabled={savingId === r.id}
                    onChange={(e) => changeShipment(r.id, e.target.value as ShipmentStatus)}
                    className="h-9 rounded-lg bg-white px-2 text-sm text-slate-700 ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {SHIPMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {SHIPMENT_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
