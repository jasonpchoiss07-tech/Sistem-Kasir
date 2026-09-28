import { useEffect, useState } from 'react';
import { Undo2 } from 'lucide-react';
import { Alert, Spinner, EmptyState, PageHeader } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import type { ReturnRecord } from '@/types/return';
import { listReturns } from './returns.api';

export function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listReturns()
      .then(setReturns)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat retur.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Riwayat Retur" description="Catatan seluruh retur barang." />

      {error && <Alert className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-slate-400" />
        </div>
      ) : returns.length === 0 ? (
        <EmptyState icon={Undo2} title="Belum ada retur" description="Retur dilakukan dari halaman Riwayat Transaksi." />
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{r.transaction.trxNumber}</p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(r.createdAt)} · oleh {r.owner.name}
                  </p>
                </div>
              </div>
              <ul className="mt-2 space-y-1">
                {r.items.map((it) => (
                  <li key={it.id} className="text-sm text-slate-600">
                    • {it.transactionItem.productNameSnapshot} — {it.quantity}{' '}
                    {it.transactionItem.unitSnapshot}
                  </li>
                ))}
              </ul>
              {r.reason && <p className="mt-2 text-xs text-slate-500">Alasan: {r.reason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
