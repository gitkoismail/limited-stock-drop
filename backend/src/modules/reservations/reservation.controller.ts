import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { getReservationById, reserveProduct } from "./reservation.service";
import type { ReserveProductInput } from "./reservation.schema";

export async function reserveProductController(
  req: Request<unknown, unknown, ReserveProductInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const reservation = await reserveProduct(req.body);

    const remainingSeconds = Math.max(
      0,
      Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000)
    );

    res.status(201).json({
      success: true,
      message: "Product reserved successfully",
      data: {
        reservationId: reservation.id,
        productId: reservation.productId,
        userId: reservation.userId,
        quantity: reservation.quantity,
        status: reservation.status,
        expiresAt: reservation.expiresAt,
        remainingSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getReservationByIdController(
  req: Request<{ reservationId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { reservationId } = req.params;

    const reservation = await getReservationById(reservationId);

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000)
    );

    res.status(200).json({
      success: true,
      data: {
        ...reservation,
        remainingSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
}