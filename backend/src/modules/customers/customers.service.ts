import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import type { CreateCustomerInput, UpdateCustomerInput } from './customers.validation';

export async function listCustomers(search?: string) {
  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { whatsapp: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    include: { _count: { select: { transactions: true } } },
  });
}

/** Customer detail including their purchase history. */
export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          trxNumber: true,
          type: true,
          total: true,
          createdAt: true,
          shipment: { select: { paymentStatus: true, shipmentStatus: true } },
        },
      },
    },
  });
  if (!customer) throw ApiError.notFound('Pelanggan tidak ditemukan');
  return customer;
}

export async function createCustomer(input: CreateCustomerInput) {
  return prisma.customer.create({
    data: {
      name: input.name,
      address: input.address,
      whatsapp: input.whatsapp ?? null,
    },
  });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Pelanggan tidak ditemukan');

  return prisma.customer.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
    },
  });
}
