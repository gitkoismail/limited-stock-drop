import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  getReservationByIdController,
  reserveProductController,
} from "./reservation.controller";
import {
  getReservationParamsSchema,
  reserveProductBodySchema,
} from "./reservation.schema";

export const reservationRoutes = Router();

reservationRoutes.post(
  "/reserve",
  validateRequest({
    body: reserveProductBodySchema,
  }),
  reserveProductController
);

reservationRoutes.get(
  "/:reservationId",
  validateRequest({
    params: getReservationParamsSchema,
  }),
  getReservationByIdController
);