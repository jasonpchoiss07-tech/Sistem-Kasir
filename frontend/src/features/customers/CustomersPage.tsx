import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Users, Pencil, Eye } from 'lucide-react';
import { Button, Input, Alert, Spinner, EmptyState, PageHeader } from '@/components/ui';
import type { Customer } from '@/types/customer';
import { listCustomers } from './customers.api';
import { CustomerFormModal } from './CustomerFormModal';
import { CustomerDetailModal } from './CustomerDetailModal';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(await listCustomers(search.trim() || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pelanggan.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Pelanggan"
        description="Data pelanggan untuk pesanan pengiriman."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        }
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Cari nama atau WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-slate-400" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="Belum ada pelanggan" description="Pelanggan tersimpan otomatis dari pesanan pengiriman, atau tambahkan manual." />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <ul className="divide-y divide-slate-100">
            {customers.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{c.name}</p>
                  <p className="truncate text-sm text-slate-500">{c.address}</p>
                  {c.whatsapp && <p className="text-xs text-slate-400">WA: {c.whatsapp}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-xs text-slate-400 sm:block">
                    {c._count?.transactions ?? 0} transaksi
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => setDetailId(c.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditing(c);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CustomerFormModal
        open={formOpen}
        customer={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          void load();
        }}
      />
      <CustomerDetailModal
        open={Boolean(detailId)}
        customerId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
