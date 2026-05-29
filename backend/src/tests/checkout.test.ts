import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../app";
import { prisma } from "../db/prisma";
import { disconnectPrisma, resetTestData } from "./testUtils";

describe("Checkout flow", () => {
  afterAll(async () => {
    await disconnectPrisma();
  });

  it("should convert active reservation into an order", async () => {
    const { user, product } = await resetTestData();

    const reserveResponse = await request(app)
      .post("/api/reservations/reserve")
      .send({
        userId: user.id,
        productId: product.id,
        quantity: 1,
      });

    const reservationId = reserveResponse.body.data.reservationId as string;

    const checkoutResponse = await request(app).post("/api/checkout").send({
      reservationId,
    });

    expect(checkoutResponse.status).toBe(201);
    expect(checkoutResponse.body.success).toBe(true);
    expect(checkoutResponse.body.data.reservationId).toBe(reservationId);

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });

    expect(reservation?.status).toBe("COMPLETED");

    const order = await prisma.order.findUnique({
      where: {
        reservationId,
      },
    });

    expect(order).not.toBeNull();
    expect(order?.totalInCents).toBe(product.priceInCents);
  });

  it("should reject checkout for expired reservation", async () => {
    const { user, product } = await resetTestData();

    const expiredReservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: 1,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() - 60 * 1000),
        activeReservationKey: `${user.id}:${product.id}`,
      },
    });

    const response = await request(app).post("/api/checkout").send({
      reservationId: expiredReservation.id,
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Reservation has expired");
  });
});