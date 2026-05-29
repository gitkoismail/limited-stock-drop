import { prisma } from "../../db/prisma";

export async function getMetrics() {
  const [
    totalProducts,
    activeReservations,
    expiredReservations,
    completedReservations,
    totalOrders,
    totalInventoryLogs,
    stockAggregate,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.reservation.count({
      where: {
        status: "ACTIVE",
      },
    }),
    prisma.reservation.count({
      where: {
        status: "EXPIRED",
      },
    }),
    prisma.reservation.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.order.count(),
    prisma.inventoryLog.count(),
    prisma.product.aggregate({
      _sum: {
        stock: true,
      },
    }),
  ]);

  return {
    totalProducts,
    activeReservations,
    expiredReservations,
    completedReservations,
    totalOrders,
    totalInventoryLogs,
    totalAvailableStock: stockAggregate._sum.stock ?? 0,
  };
}