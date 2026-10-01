import { formatRupiah, formatDateTime } from '@/lib/format';
import type { ReceiptPayload } from '@/types/transaction';

export type ReceiptVariant = 'RECEIPT' | 'BON';

interface Props {
  payload: ReceiptPayload;
  /** RECEIPT = struk biasa; BON = tanda terima pemesanan (belum lunas). */
  variant?: ReceiptVariant;
  /** Optional small label to distinguish copies, e.g. "Arsip Toko". */
  copyLabel?: string;
}

/**
 * Pure presentation of a receipt — no modal, no print trigger.
 * This is the single source of truth for receipt CONTENT, kept separate from
 * the printing MECHANISM (browser print now; ESC/POS or a print service later).
 *
 * Two variants:
 *  - RECEIPT: the normal sales receipt / store copy.
 *  - BON: a "tanda terima" given to the customer for an unpaid delivery order
 *    (proof of order; not yet paid).
 *
 * Sized for thermal paper (~58–80mm). The `.receipt-print` class is targeted
 * by print CSS so only these blocks are sent to the printer.
 */
export function ReceiptDocument({ payload, variant = 'RECEIPT', copyLabel }: Props) {
  const t = payload.transaction;
  const isBon = variant === 'BON';
  const isUnpaid = t.shipment?.paymentStatus === 'UNPAID';

  return (
    <div className="receipt-print mx-auto w-full max-w-[80mm] font-mono text-[12px] leading-tight text-slate-900">
      <div className="text-center">
        <p className="text-sm font-bold uppercase">{payload.storeName}</p>
        <p className="text-[11px]">
          {isBon ? 'BON / TANDA TERIMA PEMESANAN' : t.type === 'PENGIRIMAN' ? 'Pesan + Kirim' : 'Beli Langsung'}
        </p>
        {copyLabel && <p className="text-[10px] italic">{copyLabel}</p>}
      </div>

      <Divider />

      <Row label="No" value={t.trxNumber} />
      <Row label="Tgl" value={formatDateTime(t.createdAt)} />
      <Row label="Kasir" value={t.cashier.name} />
      {t.customer && <Row label="Plgn" value={t.customer.name} />}
      {t.customer && <Row label="Alamat" value={t.customer.address} />}
      {t.customer?.whatsapp && <Row label="WA" value={t.customer.whatsapp} />}

      <Divider />

      {t.items.map((it) => (
        <div key={it.id} className="mb-1">
          <p className="font-semibold">{it.productNameSnapshot}</p>
          <div className="flex justify-between">
            <span>
              {it.quantity} {it.unitSnapshot} x {formatRupiah(it.sellPriceSnapshot)}
            </span>
            <span>{formatRupiah(it.subtotal)}</span>
          </div>
        </div>
      ))}

      <Divider />

      <Row label="TOTAL" value={formatRupiah(t.total)} bold />

      {isBon ? (
        <>
          <Row label="STATUS" value="BELUM BAYAR" bold />
          <Divider />
          <p className="text-center text-[11px] font-bold">*** BELUM LUNAS ***</p>
          <p className="mt-1 text-center text-[10px]">
            Bon ini adalah tanda terima pemesanan, bukan bukti pembayaran. Mohon simpan sebagai bukti.
          </p>
          <div className="mt-4 flex justify-between text-[10px]">
            <div className="text-center">
              <div className="mb-6">Penerima</div>
              <div className="border-t border-slate-400 px-4">&nbsp;</div>
            </div>
            <div className="text-center">
              <div className="mb-6">Hormat kami</div>
              <div className="border-t border-slate-400 px-4">&nbsp;</div>
            </div>
          </div>
        </>
      ) : isUnpaid ? (
        <>
          <Row label="STATUS" value="BELUM BAYAR" bold />
          <Row label="Ditagih" value={formatRupiah(t.total)} />
          <Divider />
          <p className="text-center text-[11px]">Barang dikirim — pembayaran menyusul.</p>
        </>
      ) : (
        <>
          <Row label="Tunai" value={formatRupiah(t.cashReceived ?? 0)} />
          <Row label="Kembali" value={formatRupiah(t.change ?? 0)} />
          {t.type === 'PENGIRIMAN' && <Row label="STATUS" value="LUNAS" bold />}
          <Divider />
          <p className="text-center text-[11px]">Terima kasih</p>
        </>
      )}
    </div>
  );
}

function Divider() {
  return <div className="my-1 border-t border-dashed border-slate-400" />;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={'flex justify-between gap-2 ' + (bold ? 'font-bold' : '')}>
      <span className="shrink-0">{label}</span>
      <span className="break-words text-right">{value}</span>
    </div>
  );
}
