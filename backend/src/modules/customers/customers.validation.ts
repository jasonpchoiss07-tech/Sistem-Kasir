import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Nama pelanggan wajib diisi'),
  address: z.string().trim().min(1, 'Alamat wajib diisi'),
  whatsapp: z.string().trim().max(30).optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Tidak ada perubahan' });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
