import type { Request, Response, NextFunction } from "express";
import { checkoutReservation } from "./checkout.service";
import type { CheckoutInput } from "./checkout.schema";

export async function checkoutController(
  req: Request<unknown, unknown, CheckoutInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const order = await checkoutReservation(req.body);

    res.status(201).json({
      success: true,
      message: "Checkout completed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}