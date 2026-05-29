import { z } from "zod";

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sort: z.enum(["createdAt", "priceInCents", "stock", "name"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().trim().min(1).optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === "true";
    }),
});

export const getProductParamsSchema = z.object({
  productId: z.string().uuid(),
});