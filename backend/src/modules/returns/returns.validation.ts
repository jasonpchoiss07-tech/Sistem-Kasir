import { z } from 'zod';

export const createReturnSchema = z.object({
  transactionId: z.string().min(1, 'Transaksi wajib dipilih'),
  reason: z.string().trim().max(300).optional().nullable(),
  items: z
    .array(
      z.object({
        transactionItemId: z.string().min(1),
        quantity: z
          .number({ invalid_type_error: 'Jumlah harus berupa angka' })
          .int('Jumlah harus bilangan bulat')
          .positive('Jumlah retur harus lebih dari 0'),
      }),
    )
    .min(1, 'Pilih minimal satu barang untuk diretur'),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>;
