import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app";

describe("Health endpoint", () => {
  it("should return API health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe("ok");
    expect(response.body.uptime).toBeTypeOf("number");
  });
});