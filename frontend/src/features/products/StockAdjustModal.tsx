import { useEffect, useState } from 'react';
import { Modal, Button, Input, Alert, Badge } from '@/components/ui';
import type { Product, StockAdjustmentType } from '@/types/product';
import { adjustStock } from './products.api';

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

type Mode = 'STOCK_IN' | 'INCREASE' | 'DECREASE';

/** Stock-in and manual correction. Every change is recorded for traceability. */
export function StockAdjustModal({ open, product, onClose, onSaved }: Props) {
  const [mode, setMode] = useState<Mode>('STOCK_IN');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('STOCK_IN');
      setQty('');
      setNote('');
      setError(null);
    }
  }, [open]);

  if (!product) return null;

  const amount = Number(qty);
  const signedChange = mode === 'DECREASE' ? -Math.abs(amount) : Math.abs(amount);
  const resulting = product.stock + (Number.isFinite(amount) ? signedChange : 0);
  const resultingInvalid = resulting < 0;

  async function handleSubmit() {
    setError(null);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Masukkan jumlah lebih dari 0.');
      return;
    }
    if (resultingInvalid) {
      setError(`Stok tidak boleh negatif. Tersedia: ${product!.stock}.`);
      return;
    }

    const type: StockAdjustmentType = mode === 'STOCK_IN' ? 'STOCK_IN' : 'ADJUSTMENT';
    setSaving(true);
    try {
      await adjustStock(product!.id, { type, quantityChange: signedChange, note: note.trim() || null });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyesuaikan stok.');
    } finally {
      setSaving(false);
    }
  }

  const modes: { key: Mode; label: string }[] = [
    { key: 'STOCK_IN', label: 'Barang Masuk' },
    { key: 'INCREASE', label: 'Koreksi +' },
    { key: 'DECREASE', label: 'Koreksi −' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sesuaikan Stok"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={resultingInvalid}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-800">{product.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Stok saat ini: <span className="font-semibold text-slate-700">{product.stock}</span> {product.unit}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Jenis</label>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={
                  'rounded-lg px-2 py-2 text-sm font-medium ring-1 transition ' +
                  (mode === m.key
                    ? 'bg-slate-900 text-white ring-slate-900'
                    : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50')
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Jumlah"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
        />

        <Input
          label="Catatan (opsional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="mis. restock supplier / barang rusak"
        />

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <span className="text-sm text-slate-600">Stok setelah perubahan</span>
          <Badge variant={resultingInvalid ? 'danger' : 'success'}>
            {Number.isFinite(amount) && qty !== '' ? resulting : product.stock} {product.unit}
          </Badge>
        </div>
      </div>
    </Modal>
  );
}
