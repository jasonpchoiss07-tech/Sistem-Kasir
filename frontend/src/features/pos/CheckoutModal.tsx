import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, Alert, Badge } from '@/components/ui';
import { formatRupiah } from '@/lib/format';
import type { CartItem, ReceiptPayload, TransactionType } from '@/types/transaction';
import { checkout } from './pos.api';

interface Props {
  open: boolean;
  items: CartItem[];
  type: TransactionType;
  total: number;
  onClose: () => void;
  onSuccess: (receipt: ReceiptPayload) => void;
}

/** Cash-only checkout. Collects customer info for delivery orders and
 * prevents confirming when cash is insufficient. */
export function CheckoutModal({ open, items, type, total, onClose, onSuccess }: Props) {
  const [cash, setCash] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCash('');
      setName('');
      setAddress('');
      setWhatsapp('');
      setPaymentStatus('PAID');
      setError(null);
    }
  }, [open]);

  // Only delivery orders can be left unpaid (goods shipped before payment).
  const unpaid = type === 'PENGIRIMAN' && paymentStatus === 'UNPAID';

  const cashNum = Number(cash);
  const change = useMemo(
    () => (Number.isFinite(cashNum) ? cashNum - total : 0),
    [cashNum, total],
  );
  const insufficientCash = !unpaid && (!Number.isFinite(cashNum) || cashNum < total);
  const missingCustomer = type === 'PENGIRIMAN' && (!name.trim() || !address.trim());

  // Quick cash denominations for faster input.
  const quick = [total, 50000, 100000, 200000, 500000].filter(
    (v, i, arr) => v >= total && arr.indexOf(v) === i,
  );

  async function handleConfirm() {
    setError(null);
    if (missingCustomer) {
      setError('Nama dan alamat pelanggan wajib untuk pengiriman.');
      return;
    }
    if (insufficientCash) {
      setError('Uang tunai kurang dari total belanja.');
      return;
    }

    setSubmitting(true);
    try {
      const receipt = await checkout({
        type,
        cashReceived: unpaid ? null : cashNum,
        paymentStatus: type === 'PENGIRIMAN' ? paymentStatus : undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer:
          type === 'PENGIRIMAN'
            ? { name: name.trim(), address: address.trim(), whatsapp: whatsapp.trim() || null }
            : null,
      });
      onSuccess(receipt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pembayaran (Tunai)"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleConfirm} loading={submitting} disabled={insufficientCash || missingCustomer}>
            {unpaid ? 'Simpan (Belum Bayar)' : 'Konfirmasi'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        {type === 'PENGIRIMAN' && (
          <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-700">Data Pengiriman</p>
            <Input label="Nama Pelanggan" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Alamat" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input
              label="No. WhatsApp (opsional)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
        )}

        {/* Payment choice — delivery orders may be left unpaid (ship first, pay later). */}
        {type === 'PENGIRIMAN' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('PAID')}
                className={
                  'rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ' +
                  (paymentStatus === 'PAID'
                    ? 'bg-slate-900 text-white ring-slate-900'
                    : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50')
                }
              >
                Lunas (Bayar Sekarang)
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('UNPAID')}
                className={
                  'rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ' +
                  (paymentStatus === 'UNPAID'
                    ? 'bg-amber-500 text-white ring-amber-500'
                    : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50')
                }
              >
                Belum Bayar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white">
          <span className="text-sm">Total</span>
          <span className="text-xl font-bold">{formatRupiah(total)}</span>
        </div>

        {unpaid ? (
          <Alert>
            Pesanan dicatat sebagai <span className="font-semibold">BELUM BAYAR</span>. Struk BON akan
            dicetak untuk pelanggan sebagai tanda terima, dan struk toko untuk pengiriman barang.
          </Alert>
        ) : (
          <>
            <Input
              label="Uang Tunai Diterima"
              type="number"
              min={0}
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0"
              autoFocus
            />

            <div className="flex flex-wrap gap-2">
              {quick.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCash(String(v))}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                >
                  {v === total ? 'Uang Pas' : formatRupiah(v)}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <span className="text-sm text-slate-600">Kembalian</span>
              <Badge variant={insufficientCash ? 'danger' : 'success'} className="text-sm">
                {insufficientCash ? 'Kurang' : formatRupiah(change)}
              </Badge>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
