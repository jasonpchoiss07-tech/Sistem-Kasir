import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z
    .number({ invalid_type_error: 'Jumlah harus berupa angka' })
    .int('Jumlah harus bilangan bulat')
    .positive('Jumlah harus lebih dari 0'),
});

const customerSchema = z.object({
  name: z.string().trim().min(1, 'Nama pelanggan wajib diisi'),
  address: z.string().trim().min(1, 'Alamat wajib diisi'),
  whatsapp: z.string().trim().max(30).optional().nullable(),
});

export const checkoutSchema = z
  .object({
    type: z.enum(['BELI_LANGSUNG', 'PENGIRIMAN']),
    items: z.array(itemSchema).min(1, 'Keranjang tidak boleh kosong'),
    // Nullable/optional to support UNPAID delivery orders (no cash received yet).
    cashReceived: z
      .number({ invalid_type_error: 'Uang tunai harus berupa angka' })
      .nonnegative('Uang tunai tidak boleh negatif')
      .optional()
      .nullable(),
    // Only meaningful for PENGIRIMAN. Defaults to PAID when omitted.
    paymentStatus: z.enum(['PAID', 'UNPAID']).optional(),
    customer: customerSchema.optional().nullable(),
  })
  .refine(
    (d) => d.type !== 'PENGIRIMAN' || (d.customer?.name && d.customer?.address),
    { message: 'Nama & alamat pelanggan wajib untuk pengiriman', path: ['customer'] },
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const listTransactionsQuerySchema = z.object({
  type: z.enum(['BELI_LANGSUNG', 'PENGIRIMAN']).optional(),
  trxNumber: z.string().trim().optional(),
  /** Inclusive date range on createdAt (YYYY-MM-DD, local). */
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
});

export const shipmentUpdateSchema = z
  .object({
    shipmentStatus: z
      .enum(['MENUNGGU_DIKIRIM', 'SEDANG_DIKIRIM', 'SUDAH_DIKIRIM', 'DIBATALKAN'])
      .optional(),
    paymentStatus: z.enum(['PAID', 'UNPAID']).optional(),
  })
  .refine((d) => d.shipmentStatus !== undefined || d.paymentStatus !== undefined, {
    message: 'Tidak ada perubahan status',
  });

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
export type ShipmentUpdateInput = z.infer<typeof shipmentUpdateSchema>;
