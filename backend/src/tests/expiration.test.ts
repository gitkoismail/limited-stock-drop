import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../db/prisma";
import { expireReservations } from "../jobs/expireReservationsJob";
import { disconnectPrisma, resetTestData } from "./testUtils";

describe("Expired reservation job", () => {
  afterAll(async () => {
    await disconnectPrisma();
  });

  it("should expire old active reservations and restore stock", async () => {
    const { user, product } = await resetTestData();

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        stock: 8,
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 2,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() - 60 * 1000),
        activeReservationKey: `${user.id}:${product.id}`,
      },
    });

    await expireReservations();

    const updatedReservation = await prisma.reservation.findUnique({
      where: {
        id: reservation.id,
      },
    });

    const updatedProduct = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    });

    expect(updatedReservation).not.toBeNull();
    expect(updatedReservation?.status).toBe("EXPIRED");
    expect(updatedReservation?.activeReservationKey).toBeNull();
    expect(updatedProduct?.stock).toBe(10);

    const log = await prisma.inventoryLog.findFirst({
      where: {
        reservationId: reservation.id,
        reason: "RESERVATION_EXPIRED",
      },
    });

    expect(log).not.toBeNull();
    expect(log?.change).toBe(2);
  });
});