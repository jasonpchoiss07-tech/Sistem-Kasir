import { useCallback, useEffect, useState } from 'react';
import { Plus, Wallet, Trash2, ArrowDownCircle } from 'lucide-react';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { formatRupiah } from '@/lib/format';
import {
  Button,
  Input,
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Spinner,
  ConfirmDialog,
} from '@/components/ui';
import type { Expense } from '@/types/expense';
import { EXPENSE_CATEGORY_LABEL } from '@/types/expense';
import { listExpenses, deleteExpense } from './expenses.api';
import { ExpenseFormModal } from './ExpenseFormModal';

/** First day of the current month as YYYY-MM-DD (local time). */
function monthStartISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

export function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());

  const [formOpen, setFormOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listExpenses({ from: from || undefined, to: to || undefined });
      setExpenses(res.expenses);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan pengeluaran.');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useSocketEvent('expense:changed', load);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteExpense(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus pengeluaran.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Catatan pengeluaran pembayaran (bayar sales & lainnya) beserta riwayatnya."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Pengeluaran
          </Button>
        }
      />

      {/* Total for the selected range */}
      <div className="mb-4 rounded-xl bg-slate-900 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <ArrowDownCircle className="h-4 w-4 text-slate-300" />
          <span className="text-xs text-slate-300">Total Pengeluaran Pembayaran (rentang dipilih)</span>
        </div>
        <p className="mt-2 text-2xl font-bold">{formatRupiah(total)}</p>
      </div>

      {/* Date range filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Dari tanggal"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          label="Sampai tanggal"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-slate-400" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Belum ada pengeluaran"
          description="Catat pembayaran ke sales atau pengeluaran lain pada rentang tanggal ini."
          action={<Button onClick={() => setFormOpen(true)}>Tambah Pengeluaran</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <ul className="divide-y divide-slate-100">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{EXPENSE_CATEGORY_LABEL[e.category]}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(e.occurredAt)}</span>
                  </div>
                  {e.note && <p className="mt-1 truncate text-sm text-slate-600">{e.note}</p>}
                  {e.user && <p className="text-xs text-slate-400">oleh {e.user.name}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-slate-900">{formatRupiah(e.amount)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget(e);
                    }}
                    title="Hapus pengeluaran"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          void load();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Pengeluaran"
        description={
          deleteTarget
            ? `Yakin hapus pengeluaran ${formatRupiah(deleteTarget.amount)} (${EXPENSE_CATEGORY_LABEL[deleteTarget.category]})? Tindakan ini tidak bisa dibatalkan.`
            : undefined
        }
        confirmLabel="Ya, Hapus"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
