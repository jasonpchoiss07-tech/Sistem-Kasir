import { formatRupiah, formatDateTime } from '@/lib/format';
import type { ReceiptPayload } from '@/types/transaction';

/**
 * Pure presentation of a receipt — no modal, no print trigger.
 * This is the single source of truth for receipt CONTENT, kept separate from
 * the printing MECHANISM (browser print now; ESC/POS or a print service later).
 *
 * Sized for thermal paper (~58–80mm). The `.receipt-print` class is targeted
 * by print CSS so only this block is sent to the printer.
 */
export function ReceiptDocument({ payload }: { payload: ReceiptPayload }) {
  const t = payload.transaction;

  return (
    <div className="receipt-print mx-auto w-full max-w-[80mm] font-mono text-[12px] leading-tight text-slate-900">
      <div className="text-center">
        <p className="text-sm font-bold uppercase">{payload.storeName}</p>
        <p className="text-[11px]">
          {t.type === 'PENGIRIMAN' ? 'Pesan + Kirim' : 'Beli Langsung'}
        </p>
      </div>

      <Divider />

      <Row label="No" value={t.trxNumber} />
      <Row label="Tgl" value={formatDateTime(t.createdAt)} />
      <Row label="Kasir" value={t.cashier.name} />
      {t.customer && <Row label="Plgn" value={t.customer.name} />}
      {t.customer && <Row label="Alamat" value={t.customer.address} />}

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
      <Row label="Tunai" value={formatRupiah(t.cashReceived ?? 0)} />
      <Row label="Kembali" value={formatRupiah(t.change ?? 0)} />

      <Divider />
      <p className="text-center text-[11px]">Terima kasih</p>
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
