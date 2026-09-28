  import { z } from 'zod';

const money = z
  .number({ invalid_type_error: 'Harga harus berupa angka' })
  .nonnegative('Harga tidak boleh negatif')
  .finite();

const nonNegInt = z
  .number({ invalid_type_error: 'Harus berupa angka' })
  .int('Harus bilangan bulat')
  .nonnegative('Tidak boleh negatif');

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Nama produk wajib diisi'),
  edx: z.string().trim().min(1, 'EDX / kode modal wajib diisi'),
  unit: z.string().trim().min(1, 'Satuan wajib diisi'),
  sellPrice: money,
  stock: nonNegInt.default(0),
  minStock: nonNegInt.default(0),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

// Stock is not editable here; it changes only via stock adjustments.
export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1),
    edx: z.string().trim().min(1),
    unit: z.string().trim().min(1),
    sellPrice: money,
    minStock: nonNegInt,
    photoUrl: z.string().trim().max(500).nullable(),
    isActive: z.boolean(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Tidak ada perubahan' });

export const listProductsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional().default('active'),
  lowStock: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v === 'true'),
});

export const stockAdjustmentSchema = z
  .object({
    type: z.enum(['STOCK_IN', 'ADJUSTMENT']),
    quantityChange: z
      .number({ invalid_type_error: 'Jumlah harus berupa angka' })
      .int('Jumlah harus bilangan bulat')
      .refine((v) => v !== 0, 'Jumlah tidak boleh 0'),
    note: z.string().trim().max(300).optional().nullable(),
  })
  .refine((d) => d.type !== 'STOCK_IN' || d.quantityChange > 0, {
    message: 'Barang masuk harus bernilai positif',
    path: ['quantityChange'],
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
