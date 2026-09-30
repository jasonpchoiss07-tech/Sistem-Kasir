import { useEffect, useState } from 'react';
import { Modal, Button, Input, Alert } from '@/components/ui';
import type { ExpenseCategory } from '@/types/expense';
import { EXPENSE_CATEGORY_LABEL } from '@/types/expense';
import { createExpense } from './expenses.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

/** Returns today's date as YYYY-MM-DD in local time (for <input type="date">). */
function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

const CATEGORIES: ExpenseCategory[] = ['PEMBAYARAN_SALES', 'LAINNYA'];

/** Records a new expense / money paid out. */
export function ExpenseFormModal({ open, onClose, onSaved }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>('PEMBAYARAN_SALES');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory('PEMBAYARAN_SALES');
      setAmount('');
      setNote('');
      setDate(todayISO());
      setError(null);
    }
  }, [open]);

  async function handleSubmit() {
    setError(null);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Masukkan jumlah lebih dari 0.');
      return;
    }
    setSaving(true);
    try {
      await createExpense({
        category,
        amount: amt,
        note: note.trim() || null,
        occurredAt: date || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengeluaran.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Pengeluaran"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Jenis</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={
                  'rounded-lg px-2 py-2 text-sm font-medium ring-1 transition ' +
                  (category === c
                    ? 'bg-slate-900 text-white ring-slate-900'
                    : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50')
                }
              >
                {EXPENSE_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Jumlah (Rp)"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />

        <Input
          label="Tanggal"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          label="Keterangan (opsional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="mis. nama sales / supplier"
        />
      </div>
    </Modal>
  );
}
