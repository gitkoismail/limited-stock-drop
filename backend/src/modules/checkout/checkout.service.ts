import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { AppError } from "../../utils/AppError";
import type { CheckoutInput } from "./checkout.schema";

export async function checkoutReservation(input: CheckoutInput) {
  const { reservationId } = input;
  const now = new Date();

  const order = await prisma.$transaction(
    async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: {
          id: reservationId,
        },
        include: {
          product: true,
        },
      });

      if (!reservation) {
        throw new AppError("Reservation not found", 404);
      }

      if (reservation.status !== "ACTIVE") {
        throw new AppError("Reservation is not active", 409);
      }

      if (reservation.expiresAt <= now) {
        throw new AppError("Reservation has expired", 409);
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: reservation.userId,
          productId: reservation.productId,
          reservationId: reservation.id,
          quantity: reservation.quantity,
          totalInCents: reservation.product.priceInCents * reservation.quantity,
        },
      });

      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "COMPLETED",
          completedAt: now,
          activeReservationKey: null,
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId: reservation.productId,
          reservationId: reservation.id,
          change: 0,
          reason: "CHECKOUT_COMPLETED",
        },
      });

      return createdOrder;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  return order;
}