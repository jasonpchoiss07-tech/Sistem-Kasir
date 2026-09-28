import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatRupiah } from '@/lib/format';
import type { CartItem, TransactionType } from '@/types/transaction';

interface Props {
  items: CartItem[];
  type: TransactionType;
  total: number;
  onChangeType: (t: TransactionType) => void;
  onSetQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

/** Presentational cart used both in the desktop sidebar and the mobile sheet. */
export function CartPanel({ items, type, total, onChangeType, onSetQty, onRemove, onCheckout }: Props) {
  return (
    <div className="flex h-full flex-col">
      {/* Transaction type */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {(['BELI_LANGSUNG', 'PENGIRIMAN'] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChangeType(t)}
            className={
              'rounded-lg px-2 py-2 text-sm font-medium ring-1 transition ' +
              (type === t
                ? 'bg-slate-900 text-white ring-slate-900'
                : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50')
            }
          >
            {t === 'BELI_LANGSUNG' ? 'Beli Langsung' : 'Pesan + Kirim'}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center text-slate-400">
            <ShoppingCart className="mb-2 h-8 w-8" />
            <p className="text-sm">Keranjang kosong</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.productId} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{it.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatRupiah(it.price)} / {it.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(it.productId)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSetQty(it.productId, it.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-slate-300 hover:bg-slate-50"
                      aria-label="Kurangi"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={it.stock}
                      value={it.quantity}
                      onChange={(e) => onSetQty(it.productId, Number(e.target.value))}
                      className="h-8 w-12 rounded-lg text-center text-sm ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    <button
                      onClick={() => onSetQty(it.productId, it.quantity + 1)}
                      disabled={it.quantity >= it.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
                      aria-label="Tambah"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatRupiah(it.price * it.quantity)}
                  </span>
                </div>
                {it.quantity >= it.stock && (
                  <p className="mt-1 text-xs text-amber-600">Maks. stok {it.stock}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Total + checkout */}
      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">Total</span>
          <span className="text-lg font-bold text-slate-900">{formatRupiah(total)}</span>
        </div>
        <Button className="w-full" disabled={items.length === 0} onClick={onCheckout}>
          Checkout
        </Button>
      </div>
    </div>
  );
}
