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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCash('');
      setName('');
      setAddress('');
      setWhatsapp('');
      setError(null);
    }
  }, [open]);

  const cashNum = Number(cash);
  const change = useMemo(
    () => (Number.isFinite(cashNum) ? cashNum - total : 0),
    [cashNum, total],
  );
  const insufficientCash = !Number.isFinite(cashNum) || cashNum < total;
  const missingCustomer = type === 'PENGIRIMAN' && (!name.trim() || !address.trim());

  // Quick cash denominations for faster input.
  const quick = [total, 50000, 100000, 200000, 500000].filter(
    (v, i, arr) => v >= total && arr.indexOf(v) === i,
  );

  async function handleConfirm() {
    setError(null);
    if (insufficientCash) {
      setError('Uang tunai kurang dari total belanja.');
      return;
    }
    if (missingCustomer) {
      setError('Nama dan alamat pelanggan wajib untuk pengiriman.');
      return;
    }

    setSubmitting(true);
    try {
      const receipt = await checkout({
        type,
        cashReceived: cashNum,
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
            Konfirmasi
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

        <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white">
          <span className="text-sm">Total</span>
          <span className="text-xl font-bold">{formatRupiah(total)}</span>
        </div>

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
      </div>
    </Modal>
  );
}
