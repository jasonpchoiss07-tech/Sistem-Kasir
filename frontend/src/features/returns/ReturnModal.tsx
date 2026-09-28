import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, Alert } from '@/components/ui';
import { formatRupiah } from '@/lib/format';
import type { ReceiptTransaction } from '@/types/transaction';
import { createReturn } from './returns.api';

interface Props {
  open: boolean;
  transaction: ReceiptTransaction | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Owner-only. Return one or more products (up to the remaining quantity). */
export function ReturnModal({ open, transaction, onClose, onSaved }: Props) {
  const [qty, setQty] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQty({});
      setReason('');
      setError(null);
    }
  }, [open]);

  const returnable = useMemo(
    () => (transaction?.items ?? []).map((i) => ({ ...i, remaining: i.quantity - i.returnedQty })),
    [transaction],
  );
  const anyReturnable = returnable.some((i) => i.remaining > 0);

  if (!transaction) return null;

  async function handleSubmit() {
    setError(null);
    const items = Object.entries(qty)
      .map(([transactionItemId, v]) => ({ transactionItemId, quantity: Number(v) }))
      .filter((i) => Number.isFinite(i.quantity) && i.quantity > 0);

    if (items.length === 0) {
      setError('Masukkan jumlah retur minimal untuk satu barang.');
      return;
    }
    for (const it of items) {
      const line = returnable.find((r) => r.id === it.transactionItemId)!;
      if (it.quantity > line.remaining) {
        setError(`Jumlah retur "${line.productNameSnapshot}" melebihi sisa (${line.remaining}).`);
        return;
      }
    }

    setSaving(true);
    try {
      await createReturn({ transactionId: transaction!.id, reason: reason.trim() || null, items });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses retur.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Retur — ${transaction.trxNumber}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleSubmit} loading={saving} disabled={!anyReturnable}>
            Proses Retur
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        {!anyReturnable && (
          <Alert variant="info">Semua barang pada transaksi ini sudah diretur seluruhnya.</Alert>
        )}

        <ul className="space-y-2">
          {returnable.map((it) => (
            <li key={it.id} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {it.productNameSnapshot}
                  </p>
                  <p className="text-xs text-slate-500">
                    Beli {it.quantity} {it.unitSnapshot} · sudah retur {it.returnedQty} · sisa{' '}
                    <span className="font-semibold">{it.remaining}</span>
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={it.remaining}
                  disabled={it.remaining <= 0}
                  value={qty[it.id] ?? ''}
                  placeholder="0"
                  onChange={(e) => setQty((prev) => ({ ...prev, [it.id]: e.target.value }))}
                  className="h-9 w-20 rounded-lg text-center text-sm ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100"
                />
              </div>
            </li>
          ))}
        </ul>

        <Input
          label="Alasan (opsional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="mis. barang rusak / salah pesan"
        />
        <p className="text-xs text-slate-400">
          Stok akan dikembalikan otomatis. Transaksi asli tidak dihapus/diubah. Total belanja:{' '}
          {formatRupiah(transaction.total)}.
        </p>
      </div>
    </Modal>
  );
}
