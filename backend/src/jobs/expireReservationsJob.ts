import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

const JOB_INTERVAL_MS = 30 * 1000;

async function expireSingleReservation(reservationId: string) {
  const now = new Date();

  return prisma.$transaction(
    async (tx) => {
      const reservation = await tx.reservation.findFirst({
        where: {
          id: reservationId,
          status: "ACTIVE",
          expiresAt: {
            lte: now,
          },
        },
      });

      if (!reservation) {
        return null;
      }

      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "EXPIRED",
          activeReservationKey: null,
        },
      });

      await tx.product.update({
        where: {
          id: reservation.productId,
        },
        data: {
          stock: {
            increment: reservation.quantity,
          },
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId: reservation.productId,
          reservationId: reservation.id,
          change: reservation.quantity,
          reason: "RESERVATION_EXPIRED",
        },
      });

      return reservation.id;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function expireReservations() {
  const now = new Date();

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        lte: now,
      },
    },
    select: {
      id: true,
    },
  });

  if (expiredReservations.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    expiredReservations.map((reservation) =>
      expireSingleReservation(reservation.id)
    )
  );

  const expiredCount = results.filter(
    (result) => result.status === "fulfilled" && result.value !== null
  ).length;

  if (expiredCount > 0) {
    console.log(`Expired reservations restored: ${expiredCount}`);
  }
}

export function startExpireReservationsJob() {
  void expireReservations();

  setInterval(() => {
    void expireReservations();
  }, JOB_INTERVAL_MS);

  console.log("Expire reservations job started");
}