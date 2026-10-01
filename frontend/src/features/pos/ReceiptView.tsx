import { Printer, CheckCircle2 } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { ReceiptPayload } from '@/types/transaction';
import { ReceiptDocument, type ReceiptVariant } from './ReceiptDocument';

interface Props {
  open: boolean;
  payload: ReceiptPayload | null;
  onClose: () => void;
  onNewTransaction?: () => void;
  /** When true, shows the post-checkout success header + "Transaksi Baru". */
  showSuccess?: boolean;
}

/**
 * Receipt viewer + print mechanism. The content comes from ReceiptDocument
 * (separated so a native/ESC-POS printer path can reuse the same data later).
 * Printing uses the browser dialog as the fallback mechanism.
 */
export function ReceiptView({ open, payload, onClose, onNewTransaction, showSuccess }: Props) {
  if (!payload) return null;

  const t = payload.transaction;
  const isDelivery = t.type === 'PENGIRIMAN';
  const isUnpaid = t.shipment?.paymentStatus === 'UNPAID';

  // Which documents get printed (and previewed):
  //  - Delivery + unpaid → BON for the customer + normal receipt (store/delivery copy)
  //  - Delivery + paid   → 2 normal receipts (customer + store/delivery copy)
  //  - Direct sale       → 1 normal receipt
  const docs: { variant: ReceiptVariant; label?: string }[] = isDelivery
    ? isUnpaid
      ? [
          { variant: 'BON', label: 'Lembar Pelanggan (Bon)' },
          { variant: 'RECEIPT', label: 'Arsip Toko — Kirim Barang' },
        ]
      : [
          { variant: 'RECEIPT', label: 'Lembar Pelanggan' },
          { variant: 'RECEIPT', label: 'Arsip Toko — Kirim Barang' },
        ]
    : [{ variant: 'RECEIPT' }];

  const paidLabel = isUnpaid ? 'Tersimpan — Belum Bayar' : 'Pembayaran diterima';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={showSuccess ? 'Transaksi Berhasil' : 'Struk'}
      footer={
        <>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Cetak
          </Button>
          {onNewTransaction && (
            <Button onClick={onNewTransaction}>Transaksi Baru</Button>
          )}
        </>
      }
    >
      {showSuccess && (
        <div
          className={
            'mb-3 flex items-center gap-2 no-print ' +
            (isUnpaid ? 'text-amber-600' : 'text-green-600')
          }
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">{paidLabel}</span>
        </div>
      )}

      <div className="print-area">
        {docs.map((d, i) => (
          <div key={i} className={i > 0 ? 'receipt-copy-break' : undefined}>
            {i > 0 && <div className="my-4 border-t-2 border-dashed border-slate-300 no-print" />}
            <ReceiptDocument payload={payload} variant={d.variant} copyLabel={d.label} />
          </div>
        ))}
      </div>
    </Modal>
  );
}
