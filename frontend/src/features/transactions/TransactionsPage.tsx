import { useCallback, useEffect, useState } from 'react';
import { Receipt, Search, Printer, Undo2, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { Input, Alert, Spinner, Badge, EmptyState, PageHeader, Modal, Button } from '@/components/ui';
import { formatRupiah, formatDateTime } from '@/lib/format';
import {
  SHIPMENT_STATUS_LABEL,
  SHIPMENT_STATUS_VARIANT,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
} from '@/lib/status';
import type { ReceiptPayload, TransactionListItem, TransactionType } from '@/types/transaction';
import { ReceiptView } from '@/features/pos/ReceiptView';
import { ReturnModal } from '@/features/returns/ReturnModal';
import { listTransactions, getTransaction, updateShipment, type HistoryParams } from './transactions.api';

type View = 'none' | 'detail' | 'receipt' | 'return';

export function TransactionsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const [rows, setRows] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<'' | TransactionType>('');
  const [trxNumber, setTrxNumber] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [payload, setPayload] = useState<ReceiptPayload | null>(null);
  const [view, setView] = useState<View>('none');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: HistoryParams = {};
      if (type) params.type = type;
      if (trxNumber.trim()) params.trxNumber = trxNumber.trim();
      if (from) params.from = from;
      if (to) params.to = to;
      setRows(await listTransactions(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat.');
    } finally {
      setLoading(false);
    }
  }, [type, trxNumber, from, to]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useSocketEvent('transaction:created', load);
  useSocketEvent('return:created', load);
  useSocketEvent('shipment:updated', load);

  async function openDetail(id: string) {
    try {
      setStatusError(null);
      setPayload(await getTransaction(id));
      setView('detail');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat detail.');
    }
  }

  async function refreshDetail() {
    if (!payload) return;
    setPayload(await getTransaction(payload.transaction.id));
  }

  // Independent toggles for delivery orders: shipped (sudah dikirim) and
  // paid (sudah dibayar). Each flips its own status without touching the other.
  async function toggleShipped() {
    const sh = payload?.transaction.shipment;
    const id = payload?.transaction.id;
    if (!sh || !id) return;
    const isShipped = sh.shipmentStatus === 'SUDAH_DIKIRIM';
    setSavingStatus(true);
    setStatusError(null);
    try {
      await updateShipment(id, {
        shipmentStatus: isShipped ? 'MENUNGGU_DIKIRIM' : 'SUDAH_DIKIRIM',
      });
      await refreshDetail();
      await load();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Gagal mengubah status kirim.');
    } finally {
      setSavingStatus(false);
    }
  }

  async function togglePaid() {
    const sh = payload?.transaction.shipment;
    const id = payload?.transaction.id;
    if (!sh || !id) return;
    const isPaid = sh.paymentStatus === 'PAID';
    setSavingStatus(true);
    setStatusError(null);
    try {
      await updateShipment(id, { paymentStatus: isPaid ? 'UNPAID' : 'PAID' });
      await refreshDetail();
      await load();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Gagal mengubah status bayar.');
    } finally {
      setSavingStatus(false);
    }
  }

  const t = payload?.transaction;
  const hasReturnable = t?.items.some((i) => i.quantity - i.returnedQty > 0) ?? false;

  function ymd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function applyPreset(preset: 'today' | 'yesterday' | 'week' | 'month' | 'all') {
    const now = new Date();
    if (preset === 'all') {
      setFrom('');
      setTo('');
      return;
    }
    if (preset === 'today') {
      setFrom(ymd(now));
      setTo(ymd(now));
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      setFrom(ymd(y));
      setTo(ymd(y));
    } else if (preset === 'week') {
      const s = new Date(now);
      s.setDate(now.getDate() - 6);
      setFrom(ymd(s));
      setTo(ymd(now));
    } else if (preset === 'month') {
      const s = new Date(now);
      s.setDate(now.getDate() - 29);
      setFrom(ymd(s));
      setTo(ymd(now));
    }
  }
  const presets: { key: 'today' | 'yesterday' | 'week' | 'month' | 'all'; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'yesterday', label: 'Kemarin' },
    { key: 'week', label: '7 Hari' },
    { key: 'month', label: '30 Hari' },
    { key: 'all', label: 'Semua' },
  ];

  return (
    <div>
      <PageHeader title="Riwayat Transaksi" description="Semua transaksi tersimpan permanen." />

      {/* Quick date presets */}
      <div className="mb-3 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => applyPreset(p.key)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="No transaksi..." value={trxNumber} onChange={(e) => setTrxNumber(e.target.value)} />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as '' | TransactionType)}
          className="h-11 rounded-lg bg-white px-3 text-sm text-slate-700 ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <option value="">Semua jenis</option>
          <option value="BELI_LANGSUNG">Beli Langsung</option>
          <option value="PENGIRIMAN">Pesan + Kirim</option>
        </select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Dari tanggal" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Sampai tanggal" />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-slate-400" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Receipt} title="Tidak ada transaksi" description="Belum ada transaksi yang cocok dengan filter." />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => openDetail(r.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{r.trxNumber}</span>
                      <Badge variant="neutral">
                        {r.type === 'PENGIRIMAN' ? 'Kirim' : 'Langsung'}
                      </Badge>
                      {r.shipment && (
                        <Badge variant={SHIPMENT_STATUS_VARIANT[r.shipment.shipmentStatus]}>
                          {SHIPMENT_STATUS_LABEL[r.shipment.shipmentStatus]}
                        </Badge>
                      )}
                      {r._count.returns > 0 && <Badge variant="warning">Ada retur</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDateTime(r.createdAt)} · {r.cashier.name}
                      {r.customer ? ` · ${r.customer.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{formatRupiah(r.total)}</p>
                    <p className="text-xs text-slate-400">{r._count.items} item</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detail */}
      <Modal
        open={view === 'detail' && Boolean(t)}
        onClose={() => setView('none')}
        title={t ? `Detail — ${t.trxNumber}` : 'Detail'}
        footer={
          t ? (
            <>
              <Button variant="secondary" onClick={() => setView('receipt')}>
                <Printer className="h-4 w-4" />
                Cetak Ulang
              </Button>
              {isOwner && (
                <Button variant="danger" onClick={() => setView('return')} disabled={!hasReturnable}>
                  <Undo2 className="h-4 w-4" />
                  Retur
                </Button>
              )}
            </>
          ) : undefined
        }
      >
        {t && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{formatDateTime(t.createdAt)}</span>
              <span>· Kasir: {t.cashier.name}</span>
              <span>· {t.type === 'PENGIRIMAN' ? 'Pesan + Kirim' : 'Beli Langsung'}</span>
            </div>

            {t.customer && (
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="font-medium text-slate-800">{t.customer.name}</p>
                <p className="text-xs text-slate-500">{t.customer.address}</p>
                {t.shipment && (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={PAYMENT_STATUS_VARIANT[t.shipment.paymentStatus]}>
                        {PAYMENT_STATUS_LABEL[t.shipment.paymentStatus]}
                      </Badge>
                      <Badge variant={SHIPMENT_STATUS_VARIANT[t.shipment.shipmentStatus]}>
                        {SHIPMENT_STATUS_LABEL[t.shipment.shipmentStatus]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusToggle
                        checked={t.shipment.shipmentStatus === 'SUDAH_DIKIRIM'}
                        label="Sudah Dikirim"
                        onClick={toggleShipped}
                        disabled={savingStatus}
                      />
                      <StatusToggle
                        checked={t.shipment.paymentStatus === 'PAID'}
                        label="Sudah Dibayar"
                        onClick={togglePaid}
                        disabled={savingStatus}
                      />
                    </div>
                    {statusError && <p className="text-xs text-red-500">{statusError}</p>}
                  </div>
                )}
              </div>
            )}

            <ul className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
              {t.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium text-slate-800">{it.productNameSnapshot}</p>
                    <p className="text-xs text-slate-500">
                      {it.quantity} {it.unitSnapshot} × {formatRupiah(it.sellPriceSnapshot)}
                      {it.returnedQty > 0 && (
                        <span className="text-amber-600"> · diretur {it.returnedQty}</span>
                      )}
                    </p>
                  </div>
                  <span className="font-medium text-slate-800">{formatRupiah(it.subtotal)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-0.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">Total</span>
                <span>{formatRupiah(t.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tunai</span>
                <span>{formatRupiah(t.cashReceived ?? 0)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Kembalian</span>
                <span>{formatRupiah(t.change ?? 0)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reprint */}
      <ReceiptView
        open={view === 'receipt'}
        payload={payload}
        onClose={() => setView('detail')}
      />

      {/* Return (owner) */}
      <ReturnModal
        open={view === 'return'}
        transaction={t ?? null}
        onClose={() => setView('detail')}
        onSaved={async () => {
          await refreshDetail();
          await load();
          setView('detail');
        }}
      />
    </div>
  );
}

/** Checkbox-style toggle button for a delivery status flag. */
function StatusToggle({
  checked,
  label,
  onClick,
  disabled,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={checked}
      className={
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition disabled:opacity-50 ' +
        (checked
          ? 'bg-green-600 text-white ring-green-600'
          : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50')
      }
    >
      {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
      {label}
    </button>
  );
}
