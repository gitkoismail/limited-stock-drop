import { z } from "zod";

export const reserveProductBodySchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(10),
});

export const getReservationParamsSchema = z.object({
  reservationId: z.string().uuid(),
});

export type ReserveProductInput = z.infer<typeof reserveProductBodySchema>;