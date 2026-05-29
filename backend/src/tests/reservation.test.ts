import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../app";
import { prisma } from "../db/prisma";
import { disconnectPrisma, resetTestData } from "./testUtils";

let testUserId: string;
let testProductId: string;

describe("Reservation flow", () => {
  beforeEach(async () => {
    const { user, product } = await resetTestData();

    testUserId = user.id;
    testProductId = product.id;
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it("should reserve a product and decrement stock", async () => {
    const response = await request(app)
      .post("/api/reservations/reserve")
      .send({
        userId: testUserId,
        productId: testProductId,
        quantity: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.reservationId).toBeDefined();

    const updatedProduct = await prisma.product.findUnique({
      where: {
        id: testProductId,
      },
    });

    expect(updatedProduct?.stock).toBe(9);
  });

  it("should prevent duplicate active reservations for same user and product", async () => {
    await request(app).post("/api/reservations/reserve").send({
      userId: testUserId,
      productId: testProductId,
      quantity: 1,
    });

    const secondResponse = await request(app)
      .post("/api/reservations/reserve")
      .send({
        userId: testUserId,
        productId: testProductId,
        quantity: 1,
      });

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.success).toBe(false);
  });

  it("should reject reservation when requested quantity exceeds validation limit", async () => {
    const response = await request(app)
      .post("/api/reservations/reserve")
      .send({
        userId: testUserId,
        productId: testProductId,
        quantity: 999,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });
});