import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import type {
  CheckoutInput,
  ListTransactionsQuery,
  ShipmentUpdateInput,
} from './transactions.validation';

/** Digits used for the daily transaction-number prefix, in local time. */
function dayDigits(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

const receiptInclude = {
  items: true,
  customer: true,
  shipment: true,
  cashier: { select: { id: true, name: true, username: true } },
} satisfies Prisma.TransactionInclude;

/**
 * Completes a sale as a single atomic database transaction:
 * re-validates stock, deducts it (never below zero), generates a unique
 * transaction number, and persists the transaction + items (+ customer &
 * shipment for delivery). All-or-nothing.
 */
export async function checkout(input: CheckoutInput, cashierId: string) {
  // Load referenced products up-front to compute authoritative totals.
  const ids = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Merge duplicate lines (same product added twice) into one quantity.
  const merged = new Map<string, number>();
  for (const item of input.items) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }

  const lines = [...merged.entries()].map(([productId, quantity]) => {
    const product = byId.get(productId);
    if (!product || !product.isActive) {
      throw ApiError.badRequest('Ada produk yang tidak tersedia. Muat ulang daftar produk.');
    }
    const subtotal = product.sellPrice.times(quantity);
    return { product, quantity, subtotal };
  });

  const total = lines.reduce((sum, l) => sum.plus(l.subtotal), new Prisma.Decimal(0));
  const cash = new Prisma.Decimal(input.cashReceived);

  if (cash.lessThan(total)) {
    throw ApiError.badRequest(`Uang tunai kurang. Total belanja Rp${total.toFixed(0)}.`);
  }
  const change = cash.minus(total);

  return prisma.$transaction(async (tx) => {
    // Serialize per-day number generation to keep trxNumber unique under load.
    const now = new Date();
    const digits = dayDigits(now);
    await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${Number(digits)})`);

    // Re-validate & deduct stock atomically (guard prevents going negative).
    for (const line of lines) {
      const res = await tx.product.updateMany({
        where: { id: line.product.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (res.count === 0) {
        const fresh = await tx.product.findUnique({ where: { id: line.product.id } });
        throw ApiError.badRequest(
          `Stok ${line.product.name} tidak mencukupi. Tersedia: ${fresh?.stock ?? 0}.`,
        );
      }
    }

    // Generate unique transaction number: TRX-YYYYMMDD-####
    const prefix = `TRX-${digits}-`;
    const last = await tx.transaction.findFirst({
      where: { trxNumber: { startsWith: prefix } },
      orderBy: { trxNumber: 'desc' },
      select: { trxNumber: true },
    });
    const nextSeq = last ? parseInt(last.trxNumber.slice(prefix.length), 10) + 1 : 1;
    const trxNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;

    // Create customer for delivery orders.
    let customerId: string | undefined;
    if (input.type === 'PENGIRIMAN' && input.customer) {
      const customer = await tx.customer.create({
        data: {
          name: input.customer.name,
          address: input.customer.address,
          whatsapp: input.customer.whatsapp ?? null,
        },
      });
      customerId = customer.id;
    }

    const transaction = await tx.transaction.create({
      data: {
        trxNumber,
        type: input.type,
        total,
        cashReceived: cash,
        change,
        cashierId,
        customerId,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            productNameSnapshot: l.product.name,
            unitSnapshot: l.product.unit,
            sellPriceSnapshot: l.product.sellPrice,
            quantity: l.quantity,
            subtotal: l.subtotal,
          })),
        },
        ...(input.type === 'PENGIRIMAN'
          ? {
              shipment: {
                create: { paymentStatus: 'PAID', shipmentStatus: 'MENUNGGU_DIKIRIM' },
              },
            }
          : {}),
      },
      include: receiptInclude,
    });

    return transaction;
  }, {
    // Serverless → Supabase pooler has network latency; the default 5s window
    // can expire mid-checkout. Allow more time to start and run the transaction.
    maxWait: 15000,
    timeout: 20000,
  });
}

/** Fetches a single transaction for receipt display / reprint. */
export async function getTransaction(id: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: receiptInclude,
  });
  if (!transaction) throw ApiError.notFound('Transaksi tidak ditemukan');
  return transaction;
}

/** Parses YYYY-MM-DD to a local Date; `endOfDay` pushes to 23:59:59.999. */
function parseDate(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

/** Transaction history with optional filters (type, trxNumber, date range). */
export async function listTransactions(query: ListTransactionsQuery) {
  const from = parseDate(query.from);
  const to = parseDate(query.to, true);

  const where: Prisma.TransactionWhereInput = {};
  if (query.type) where.type = query.type;
  if (query.trxNumber) where.trxNumber = { contains: query.trxNumber, mode: 'insensitive' };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      customer: { select: { id: true, name: true } },
      shipment: { select: { paymentStatus: true, shipmentStatus: true } },
      cashier: { select: { id: true, name: true } },
      _count: { select: { items: true, returns: true } },
    },
  });
}

/** Updates shipment and/or payment status for a delivery transaction. */
export async function updateShipment(transactionId: string, input: ShipmentUpdateInput) {
  const shipment = await prisma.shipment.findUnique({ where: { transactionId } });
  if (!shipment) {
    throw ApiError.notFound('Transaksi ini tidak memiliki data pengiriman');
  }

  return prisma.shipment.update({
    where: { transactionId },
    data: {
      ...(input.shipmentStatus !== undefined ? { shipmentStatus: input.shipmentStatus } : {}),
      ...(input.paymentStatus !== undefined ? { paymentStatus: input.paymentStatus } : {}),
    },
  });
}
