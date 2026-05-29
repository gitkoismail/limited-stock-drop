import { z } from "zod";

export const checkoutBodySchema = z.object({
  reservationId: z.string().uuid(),
});

export type CheckoutInput = z.infer<typeof checkoutBodySchema>;