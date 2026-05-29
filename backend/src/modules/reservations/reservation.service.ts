import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { AppError } from "../../utils/AppError";
import type { ReserveProductInput } from "./reservation.schema";

const RESERVATION_DURATION_MS = 5 * 60 * 1000;
const MAX_TRANSACTION_RETRIES = 5;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function isTransactionConflictError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2034"
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reserveProductTransaction(input: ReserveProductInput) {
  const { userId, productId, quantity } = input;

  const now = new Date();
  const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);
  const activeReservationKey = `${userId}:${productId}`;

  return prisma.$transaction(
    async (tx) => {
      const existingActiveReservation = await tx.reservation.findFirst({
        where: {
          userId,
          productId,
          status: "ACTIVE",
          expiresAt: {
            gt: now,
          },
        },
      });

      if (existingActiveReservation) {
        throw new AppError(
          "User already has an active reservation for this product",
          409
        );
      }

      const updatedProduct = await tx.product.updateMany({
        where: {
          id: productId,
          stock: {
            gte: quantity,
          },
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      if (updatedProduct.count === 0) {
        throw new AppError("Not enough stock or product not found", 409);
      }

      const createdReservation = await tx.reservation.create({
        data: {
          userId,
          productId,
          quantity,
          status: "ACTIVE",
          expiresAt,
          activeReservationKey,
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId,
          reservationId: createdReservation.id,
          change: -quantity,
          reason: "RESERVATION_CREATED",
        },
      });

      return createdReservation;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function reserveProduct(input: ReserveProductInput) {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt++) {
    try {
      return await reserveProductTransaction(input);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (isUniqueConstraintError(error)) {
        throw new AppError(
          "User already has an active reservation for this product",
          409
        );
      }

      if (isTransactionConflictError(error)) {
        if (attempt === MAX_TRANSACTION_RETRIES) {
          throw new AppError(
            "Reservation could not be completed due to high concurrency. Please try again.",
            409
          );
        }

        await sleep(50 * attempt);
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Reservation failed", 500);
}

export async function getReservationById(reservationId: string) {
  return prisma.reservation.findUnique({
    where: {
      id: reservationId,
    },
    include: {
      product: true,
      user: true,
    },
  });
}