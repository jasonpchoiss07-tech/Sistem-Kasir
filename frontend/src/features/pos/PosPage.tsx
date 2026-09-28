import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Package, Plus, ShoppingCart } from 'lucide-react';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { assetUrl } from '@/lib/asset';
import { Input, Alert, Spinner, Badge, Modal } from '@/components/ui';
import { formatRupiah } from '@/lib/format';
import { listProducts } from '@/features/products/products.api';
import type { Product } from '@/types/product';
import type { CartItem, ReceiptPayload, TransactionType } from '@/types/transaction';
import { CartPanel } from './CartPanel';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptView } from './ReceiptView';

export function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [type, setType] = useState<TransactionType>('BELI_LANGSUNG');

  const [cartOpen, setCartOpen] = useState(false); // mobile sheet
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts({ search: search.trim() || undefined, status: 'active' });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  // Realtime: keep product list/stock fresh.
  useSocketEvent('stock:updated', load);
  useSocketEvent('product:changed', load);

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart],
  );
  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);

  const addToCart = useCallback((p: Product) => {
    if (p.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) return prev;
        return prev.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        { productId: p.id, name: p.name, unit: p.unit, price: Number(p.sellPrice), quantity: 1, stock: p.stock },
      ];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.productId !== productId) return [i];
        if (qty <= 0) return [];
        return [{ ...i, quantity: Math.min(qty, i.stock) }];
      }),
    );
  }, []);

  const removeItem = useCallback(
    (productId: string) => setCart((prev) => prev.filter((i) => i.productId !== productId)),
    [],
  );

  function openCheckout() {
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  function onCheckoutSuccess(r: ReceiptPayload) {
    setCheckoutOpen(false);
    setReceipt(r);
    setCart([]);
    void load(); // refresh stock
  }

  function newTransaction() {
    setReceipt(null);
    setType('BELI_LANGSUNG');
  }

  const cartPanel = (
    <CartPanel
      items={cart}
      type={type}
      total={total}
      onChangeType={setType}
      onSetQty={setQty}
      onRemove={removeItem}
      onCheckout={openCheckout}
    />
  );

  return (
    <div className="lg:flex lg:gap-6">
      {/* Products */}
      <div className="min-w-0 flex-1">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Cari produk (nama / EDX)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-7 w-7 text-slate-400" />
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Tidak ada produk.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-24 sm:grid-cols-3 lg:pb-0 xl:grid-cols-4">
            {products.map((p) => {
              const inCart = cart.find((i) => i.productId === p.id)?.quantity ?? 0;
              const soldOut = p.stock <= 0;
              const maxed = inCart >= p.stock;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={soldOut || maxed}
                  onClick={() => addToCart(p)}
                  className="flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-400 disabled:opacity-50"
                >
                  <div className="flex h-24 items-center justify-center bg-slate-100">
                    {p.photoUrl ? (
                      <img src={assetUrl(p.photoUrl)} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-2.5">
                    <p className="line-clamp-2 text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{formatRupiah(p.sellPrice)}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Stok: {p.stock}</span>
                      {soldOut ? (
                        <Badge variant="danger">Habis</Badge>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                          <Plus className="h-3 w-3" /> {inCart > 0 ? inCart : 'Tambah'}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart: desktop sidebar */}
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-20 flex h-[calc(100vh-6rem)] flex-col rounded-xl bg-slate-50 ring-1 ring-slate-200">
          {cartPanel}
        </div>
      </aside>

      {/* Cart: mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <button
          onClick={() => setCartOpen(true)}
          disabled={cart.length === 0}
          className="flex w-full items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang ({itemCount})
          </span>
          <span className="font-bold">{formatRupiah(total)}</span>
        </button>
      </div>

      {/* Cart: mobile sheet */}
      <Modal open={cartOpen} onClose={() => setCartOpen(false)} title="Keranjang">
        <div className="h-[60vh]">{cartPanel}</div>
      </Modal>

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        type={type}
        total={total}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={onCheckoutSuccess}
      />

      <ReceiptView
        open={Boolean(receipt)}
        payload={receipt}
        showSuccess
        onClose={() => setReceipt(null)}
        onNewTransaction={newTransaction}
      />
    </div>
  );
}
