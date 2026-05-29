import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  getProductByIdController,
  getProductsController,
} from "./product.controller";
import {
  getProductParamsSchema,
  getProductsQuerySchema,
} from "./product.schema";

export const productRoutes = Router();

productRoutes.get(
  "/",
  validateRequest({
    query: getProductsQuerySchema,
  }),
  getProductsController
);

productRoutes.get(
  "/:productId",
  validateRequest({
    params: getProductParamsSchema,
  }),
  getProductByIdController
);