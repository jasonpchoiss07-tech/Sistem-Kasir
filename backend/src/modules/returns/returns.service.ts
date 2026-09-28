import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import type { CreateReturnInput } from './returns.validation';

/**
 * Performs a return as one atomic database transaction:
 *  - validates each returned line against the *remaining* returnable quantity
 *    (original quantity minus what was already returned),
 *  - restores product stock,
 *  - records the Return + ReturnItems (who/when/what) for traceability.
 *
 * The original transaction's sold quantities and totals are never modified;
 * only the per-line `returnedQty` tracker is increased.
 */
export async function createReturn(input: CreateReturnInput, ownerId: string) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: input.transactionId },
      include: { items: true },
    });
    if (!transaction) throw ApiError.notFound('Transaksi tidak ditemukan');

    const itemsById = new Map(transaction.items.map((i) => [i.id, i]));

    // Merge duplicate lines and validate remaining returnable quantity.
    const merged = new Map<string, number>();
    for (const line of input.items) {
      merged.set(
        line.transactionItemId,
        (merged.get(line.transactionItemId) ?? 0) + line.quantity,
      );
    }

    for (const [transactionItemId, quantity] of merged) {
      const item = itemsById.get(transactionItemId);
      if (!item) {
        throw ApiError.badRequest('Ada barang yang bukan bagian dari transaksi ini');
      }
      const remaining = item.quantity - item.returnedQty;
      if (quantity > remaining) {
        throw ApiError.badRequest(
          `Jumlah retur "${item.productNameSnapshot}" melebihi sisa yang bisa diretur (${remaining}).`,
        );
      }
    }

    const created = await tx.return.create({
      data: {
        transactionId: transaction.id,
        ownerId,
        reason: input.reason ?? null,
        items: {
          create: [...merged].map(([transactionItemId, quantity]) => ({
            transactionItemId,
            quantity,
          })),
        },
      },
    });

    // Apply effects: bump returnedQty tracker + restore stock.
    for (const [transactionItemId, quantity] of merged) {
      const item = itemsById.get(transactionItemId)!;
      await tx.transactionItem.update({
        where: { id: transactionItemId },
        data: { returnedQty: { increment: quantity } },
      });
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: quantity } },
      });
    }

    return getReturnById(tx, created.id);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getReturnById(tx: any, id: string) {
  return tx.return.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      transaction: { select: { id: true, trxNumber: true } },
      items: { include: { transactionItem: true } },
    },
  });
}

/** Return history (most recent first). */
export async function listReturns() {
  return prisma.return.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      owner: { select: { id: true, name: true } },
      transaction: { select: { id: true, trxNumber: true } },
      items: {
        include: {
          transactionItem: {
            select: { productNameSnapshot: true, unitSnapshot: true },
          },
        },
      },
    },
  });
}
