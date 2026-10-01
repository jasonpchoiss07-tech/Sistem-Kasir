import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  Package,
  Boxes,
  AlertTriangle,
  Undo2,
  Truck,
  Coins,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { Alert, Spinner, Badge, PageHeader, Card } from '@/components/ui';
import { formatRupiah, formatDateTime } from '@/lib/format';
import { SHIPMENT_STATUS_LABEL, SHIPMENT_STATUS_VARIANT } from '@/lib/status';
import type { ShipmentStatus } from '@/types/transaction';
import { getDashboardSummary, type DashboardSummary } from './dashboard.api';

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    return getDashboardSummary()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime: refresh figures as sales/returns/stock/shipments change.
  useSocketEvent('transaction:created', load);
  useSocketEvent('return:created', load);
  useSocketEvent('stock:updated', load);
  useSocketEvent('shipment:updated', load);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-slate-400" />
      </div>
    );
  }
  if (error) return <Alert>{error}</Alert>;
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Dashboard" description="Ringkasan operasional toko." />

      {/* Sales */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon={TrendingUp} label="Penjualan Hari Ini" value={formatRupiah(data.sales.today.amount)} accent />
        <Stat icon={Package} label="Barang Terjual Hari Ini" value={String(data.sales.today.itemsSold)} />
        <Stat icon={TrendingUp} label="Penjualan 7 Hari" value={formatRupiah(data.sales.last7)} />
        <Stat icon={TrendingUp} label="Penjualan Bulan Ini" value={formatRupiah(data.sales.month)} />
        <Stat icon={Coins} label="Piutang (Belum Dibayar)" value={formatRupiah(data.sales.outstanding)} warn={Number(data.sales.outstanding) > 0} />
        <Stat icon={Wallet} label="Pengeluaran Pembayaran Hari Ini" value={formatRupiah(data.sales.expensesToday)} />
      </div>

      {/* Products */}
      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Stat icon={Package} label="Total Produk" value={String(data.products.total)} />
        <Stat icon={Boxes} label="Total Stok" value={String(data.products.totalStock)} />
        <Stat icon={AlertTriangle} label="Produk Stok Menipis" value={String(data.products.lowStockCount)} warn={data.products.lowStockCount > 0} />
      </div>

      {data.products.lowStock.length > 0 && (
        <Card className="mb-6">
          <SectionTitle icon={AlertTriangle} title="Stok Menipis" to="/products" />
          <ul className="divide-y divide-slate-100">
            {data.products.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{p.name}</span>
                <Badge variant="warning">
                  {p.stock} / min {p.minStock} {p.unit}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent transactions */}
        <Card>
          <SectionTitle icon={Receipt} title="Transaksi Terbaru" to="/transactions" />
          {data.recentTransactions.length === 0 ? (
            <Empty />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentTransactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{t.trxNumber}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <span className="font-semibold text-slate-800">{formatRupiah(t.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent returns */}
        <Card>
          <SectionTitle icon={Undo2} title="Retur Terbaru" to="/returns" />
          {data.recentReturns.length === 0 ? (
            <Empty />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentReturns.map((r) => (
                <li key={r.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">{r.transaction.trxNumber}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {r.items.map((i) => `${i.transactionItem.productNameSnapshot} ×${i.quantity}`).join(', ')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Deliveries */}
        <Card>
          <SectionTitle icon={Truck} title="Pengiriman Tertunda" to="/delivery" />
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.entries(data.deliveries.statusCounts).map(([status, count]) => (
              <Badge key={status} variant={SHIPMENT_STATUS_VARIANT[status as ShipmentStatus]}>
                {SHIPMENT_STATUS_LABEL[status as ShipmentStatus]}: {count}
              </Badge>
            ))}
          </div>
          {data.deliveries.pending.length === 0 ? (
            <Empty text="Tidak ada pengiriman tertunda." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.deliveries.pending.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{t.trxNumber}</p>
                    <p className="text-xs text-slate-400">{t.customer?.name ?? '-'}</p>
                  </div>
                  {t.shipment && (
                    <Badge variant={SHIPMENT_STATUS_VARIANT[t.shipment.shipmentStatus]}>
                      {SHIPMENT_STATUS_LABEL[t.shipment.shipmentStatus]}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Total transactions */}
        <Card>
          <SectionTitle icon={Receipt} title="Total Transaksi" to="/transactions" />
          <div className="flex items-center gap-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Receipt className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.transactions.total}</p>
              <p className="text-sm text-slate-500">total transaksi keseluruhan</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
  warn,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={
        'rounded-xl p-4 shadow-sm ring-1 ' +
        (accent
          ? 'bg-slate-900 text-white ring-slate-900'
          : warn
            ? 'bg-amber-50 ring-amber-200'
            : 'bg-white ring-slate-200')
      }
    >
      <div className="flex items-center gap-2">
        <Icon className={'h-4 w-4 ' + (accent ? 'text-slate-300' : 'text-slate-400')} />
        <span className={'text-xs ' + (accent ? 'text-slate-300' : 'text-slate-500')}>{label}</span>
      </div>
      <p className={'mt-2 text-xl font-bold ' + (accent ? 'text-white' : 'text-slate-900')}>{value}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, to }: { icon: LucideIcon; title: string; to: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <Link to={to} className="text-xs font-medium text-slate-500 hover:text-slate-800">
        Lihat semua
      </Link>
    </div>
  );
}

function Empty({ text = 'Belum ada data.' }: { text?: string }) {
  return <p className="py-4 text-center text-sm text-slate-400">{text}</p>;
}
