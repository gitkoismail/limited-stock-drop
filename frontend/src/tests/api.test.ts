import { afterEach, describe, expect, it, vi } from "vitest";
import { request } from "../services/api";

describe("API request helper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return data when API response is successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: "product-1",
            name: "Test Product",
          },
        }),
      })
    );

    const result = await request<{ id: string; name: string }>("/products/1");

    expect(result.id).toBe("product-1");
    expect(result.name).toBe("Test Product");
  });

  it("should throw error when API response is not successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          message: "Not enough stock",
        }),
      })
    );

    await expect(request("/reservations/reserve")).rejects.toThrow(
      "Not enough stock"
    );
  });

  it("should throw fallback error when API does not return a message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
        }),
      })
    );

    await expect(request("/unknown")).rejects.toThrow("Something went wrong");
  });
});