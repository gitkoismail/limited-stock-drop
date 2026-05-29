import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkoutController } from "./checkout.controller";
import { checkoutBodySchema } from "./checkout.schema";

export const checkoutRoutes = Router();

checkoutRoutes.post(
  "/",
  validateRequest({
    body: checkoutBodySchema,
  }),
  checkoutController
);