import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Package, Boxes, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { formatRupiah } from '@/lib/format';
import { assetUrl } from '@/lib/asset';
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
import type { Product } from '@/types/product';
import { listProducts, deleteProduct, type ListParams } from './products.api';
import { ProductFormModal } from './ProductFormModal';
import { StockAdjustModal } from './StockAdjustModal';

type StatusFilter = 'all' | 'active' | 'inactive';

export function ProductsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>(isOwner ? 'all' : 'active');
  const [lowStock, setLowStock] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);

  // Delete confirmation state.
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ListParams = { search: search.trim() || undefined, lowStock };
      if (isOwner) params.status = status;
      const data = await listProducts(params);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }, [search, status, lowStock, isOwner]);

  // Debounced reload on filter changes.
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  // Realtime: refresh when stock/products change elsewhere.
  useSocketEvent('stock:updated', load);
  useSocketEvent('product:changed', load);
  useSocketEvent('transaction:created', load);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }
  function askDelete(p: Product) {
    setDeleteError(null);
    setDeleteTarget(p);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus produk.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Produk"
        description={isOwner ? 'Kelola produk, harga, dan stok.' : 'Daftar produk toko.'}
        actions={
          isOwner ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Cari nama atau EDX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-11 rounded-lg bg-white px-3 text-sm text-slate-700 ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <button
              type="button"
              onClick={() => setLowStock((v) => !v)}
              className={
                'h-11 rounded-lg px-3 text-sm font-medium ring-1 transition ' +
                (lowStock
                  ? 'bg-amber-500 text-white ring-amber-500'
                  : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50')
              }
            >
              Stok menipis
            </button>
          </div>
        )}
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7 text-slate-400" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum ada produk"
          description={
            isOwner
              ? 'Tambahkan produk pertama untuk mulai berjualan.'
              : 'Belum ada produk yang tersedia.'
          }
          action={isOwner ? <Button onClick={openCreate}>Tambah Produk</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isOwner={isOwner}
              onEdit={() => openEdit(p)}
              onStock={() => setStockTarget(p)}
              onDelete={() => askDelete(p)}
            />
          ))}
        </div>
      )}

      {isOwner && (
        <>
          <ProductFormModal
            open={formOpen}
            product={editing}
            onClose={() => setFormOpen(false)}
            onSaved={() => {
              setFormOpen(false);
              void load();
            }}
          />
          <StockAdjustModal
            open={Boolean(stockTarget)}
            product={stockTarget}
            onClose={() => setStockTarget(null)}
            onSaved={() => {
              setStockTarget(null);
              void load();
            }}
          />
          <ConfirmDialog
            open={Boolean(deleteTarget)}
            title="Hapus Produk"
            description={
              deleteTarget
                ? `Yakin hapus produk "${deleteTarget.name}"? Tindakan ini tidak bisa dibatalkan.`
                : undefined
            }
            confirmLabel="Ya, Hapus"
            loading={deleting}
            error={deleteError}
            onConfirm={confirmDelete}
            onClose={() => setDeleteTarget(null)}
          />
        </>
      )}
    </div>
  );
}

function ProductCard({
  product,
  isOwner,
  onEdit,
  onStock,
  onDelete,
}: {
  product: Product;
  isOwner: boolean;
  onEdit: () => void;
  onStock: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex h-36 items-center justify-center bg-slate-100">
        {product.photoUrl ? (
          <img src={assetUrl(product.photoUrl)} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package className="h-10 w-10 text-slate-300" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
          {!product.isActive && <Badge variant="neutral">Nonaktif</Badge>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <Badge variant="neutral">EDX: {product.edx}</Badge>
          <span>/ {product.unit}</span>
        </div>

        <p className="mt-3 text-lg font-bold text-slate-900">{formatRupiah(product.sellPrice)}</p>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-slate-600">Stok: {product.stock}</span>
          {product.isLowStock && <Badge variant="warning">Menipis</Badge>}
        </div>

        {isOwner && (
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" onClick={onStock}>
              <Boxes className="h-4 w-4" />
              Stok
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} title="Hapus produk">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
