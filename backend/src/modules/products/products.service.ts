import type { Prisma, Product } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import type {
  CreateProductInput,
  StockAdjustmentInput,
  UpdateProductInput,
} from './products.validation';

/** Adds a computed `isLowStock` flag to a product. */
function withLowStock<T extends Product>(product: T) {
  return { ...product, isLowStock: product.stock <= product.minStock };
}

interface ListOptions {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  lowStock?: boolean;
  /** When true (cashier), only active products are returned regardless of status. */
  activeOnly?: boolean;
}

export async function listProducts(opts: ListOptions) {
  const where: Prisma.ProductWhereInput = {};

  if (opts.activeOnly) {
    where.isActive = true;
  } else if (opts.status === 'active') {
    where.isActive = true;
  } else if (opts.status === 'inactive') {
    where.isActive = false;
  }

  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { edx: { contains: opts.search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({ where, orderBy: { name: 'asc' } });
  const mapped = products.map(withLowStock);
  return opts.lowStock ? mapped.filter((p) => p.isLowStock) : mapped;
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound('Produk tidak ditemukan');
  return withLowStock(product);
}

export async function createProduct(input: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      name: input.name,
      edx: input.edx,
      unit: input.unit,
      sellPrice: input.sellPrice,
      stock: input.stock,
      minStock: input.minStock,
      photoUrl: input.photoUrl ?? null,
      isActive: input.isActive ?? true,
    },
  });
  return withLowStock(product);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Produk tidak ditemukan');

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.edx !== undefined ? { edx: input.edx } : {}),
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.sellPrice !== undefined ? { sellPrice: input.sellPrice } : {}),
      ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
      ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
  return withLowStock(product);
}

/**
 * Applies a manual stock change atomically and records it for traceability.
 *
 * Stock can never go negative: for a decrease we use a conditional updateMany
 * that only succeeds when enough stock exists, closing the race window between
 * concurrent adjustments. The database CHECK constraint is the final backstop.
 */
export async function adjustStock(
  productId: string,
  input: StockAdjustmentInput,
  userId: string,
) {
  const change = input.quantityChange;

  return prisma.$transaction(async (tx) => {
    if (change < 0) {
      const res = await tx.product.updateMany({
        where: { id: productId, stock: { gte: -change } },
        data: { stock: { increment: change } },
      });
      if (res.count === 0) {
        const p = await tx.product.findUnique({ where: { id: productId } });
        if (!p) throw ApiError.notFound('Produk tidak ditemukan');
        throw ApiError.badRequest(`Stok tidak mencukupi. Tersedia: ${p.stock}`);
      }
    } else {
      const res = await tx.product.updateMany({
        where: { id: productId },
        data: { stock: { increment: change } },
      });
      if (res.count === 0) throw ApiError.notFound('Produk tidak ditemukan');
    }

    const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
    const adjustment = await tx.stockAdjustment.create({
      data: {
        productId,
        userId,
        type: input.type,
        quantityChange: change,
        resultingStock: product.stock,
        note: input.note ?? null,
      },
    });

    return { product: withLowStock(product), adjustment };
  }, {
    // Serverless → Supabase pooler latency headroom (default is 5s).
    maxWait: 15000,
    timeout: 20000,
  });
}

export async function listAdjustments(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Produk tidak ditemukan');

  return prisma.stockAdjustment.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, username: true } } },
  });
}

/**
 * Hard-deletes a product. Refused if it is referenced by any transaction
 * (transaction history must be preserved). Stock adjustment logs for the
 * product are removed alongside it.
 */
export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { transactionItems: true } } },
  });
  if (!product) throw ApiError.notFound('Produk tidak ditemukan');
  if (product._count.transactionItems > 0) {
    throw ApiError.conflict(
      'Produk sudah dipakai pada transaksi sehingga tidak bisa dihapus (riwayat harus tetap utuh).',
    );
  }
  await prisma.$transaction([
    prisma.stockAdjustment.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);
  return { id };
}
