import { prisma } from '../../config/prisma';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const recentTransactionInclude = {
  customer: { select: { id: true, name: true } },
  shipment: { select: { paymentStatus: true, shipmentStatus: true } },
  cashier: { select: { id: true, name: true } },
  _count: { select: { items: true, returns: true } },
};

/**
 * Aggregates owner dashboard figures directly from existing data
 * (no denormalized/duplicated statistics tables).
 *
 * Revenue is recognized on payment: figures are summed by `paidAt`, so an
 * unpaid delivery order does NOT count as sales until it is marked paid (at
 * which point it counts toward that day's revenue). Unpaid orders are surfaced
 * separately as `outstanding` (piutang).
 */
export async function getSummary() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const last7Start = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    revenueTodayAgg,
    todayCountAgg,
    itemsSoldTodayAgg,
    revenueLast7Agg,
    revenueMonthAgg,
    outstandingAgg,
    products,
    recentTransactions,
    recentReturns,
    pendingDeliveries,
    deliveryStatusGroups,
    transactionsTotalCount,
    expensesTodayAgg,
  ] = await Promise.all([
    // Revenue = total of transactions PAID within the period (by paidAt).
    prisma.transaction.aggregate({
      where: { paidAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    // Volume: number of transactions created today (regardless of payment).
    prisma.transaction.aggregate({
      where: { createdAt: { gte: todayStart } },
      _count: true,
    }),
    prisma.transactionItem.aggregate({
      where: { transaction: { createdAt: { gte: todayStart } } },
      _sum: { quantity: true },
    }),
    prisma.transaction.aggregate({
      where: { paidAt: { gte: last7Start } },
      _sum: { total: true },
    }),
    prisma.transaction.aggregate({
      where: { paidAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    // Piutang: everything not yet paid (unpaid delivery orders).
    prisma.transaction.aggregate({
      where: { paidAt: null },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, unit: true, stock: true, minStock: true },
      orderBy: { name: 'asc' },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: recentTransactionInclude,
    }),
    prisma.return.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        owner: { select: { id: true, name: true } },
        transaction: { select: { id: true, trxNumber: true } },
        items: {
          include: { transactionItem: { select: { productNameSnapshot: true, unitSnapshot: true } } },
        },
      },
    }),
    prisma.transaction.findMany({
      where: { shipment: { shipmentStatus: { in: ['MENUNGGU_DIKIRIM', 'SEDANG_DIKIRIM'] } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: recentTransactionInclude,
    }),
    prisma.shipment.groupBy({ by: ['shipmentStatus'], _count: true }),
    prisma.transaction.count(),
    prisma.expense.aggregate({
      where: { occurredAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
  ]);

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  const deliveryStatusCounts: Record<string, number> = {};
  for (const g of deliveryStatusGroups) {
    deliveryStatusCounts[g.shipmentStatus] = g._count;
  }

  return {
    sales: {
      today: {
        amount: (revenueTodayAgg._sum.total ?? 0).toString(),
        count: todayCountAgg._count,
        itemsSold: itemsSoldTodayAgg._sum.quantity ?? 0,
      },
      last7: (revenueLast7Agg._sum.total ?? 0).toString(),
      month: (revenueMonthAgg._sum.total ?? 0).toString(),
      outstanding: (outstandingAgg._sum.total ?? 0).toString(),
      expensesToday: (expensesTodayAgg._sum.amount ?? 0).toString(),
    },
    products: {
      total: products.length,
      totalStock,
      lowStockCount: lowStock.length,
      lowStock: lowStock.slice(0, 10),
    },
    recentTransactions,
    recentReturns,
    deliveries: {
      pending: pendingDeliveries,
      statusCounts: deliveryStatusCounts,
    },
    transactions: { total: transactionsTotalCount },
  };
}
