import { Printer, CheckCircle2 } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { ReceiptPayload } from '@/types/transaction';
import { ReceiptDocument } from './ReceiptDocument';

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
        <div className="mb-3 flex items-center gap-2 text-green-600 no-print">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Pembayaran diterima</span>
        </div>
      )}

      <ReceiptDocument payload={payload} />
    </Modal>
  );
}
