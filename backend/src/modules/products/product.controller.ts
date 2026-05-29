import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { getProductById, getProducts } from "./product.service";

const allowedSortFields = ["createdAt", "priceInCents", "stock", "name"] as const;

type ProductSortField = (typeof allowedSortFields)[number];

function isProductSortField(value: unknown): value is ProductSortField {
  return (
    typeof value === "string" &&
    allowedSortFields.includes(value as ProductSortField)
  );
}

export async function getProductsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const sort = isProductSortField(req.query.sort)
      ? req.query.sort
      : "createdAt";

    const order = req.query.order === "asc" ? "asc" : "desc";

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const inStock =
      req.query.inStock === "true"
        ? true
        : req.query.inStock === "false"
          ? false
          : undefined;

    const result = await getProducts({
      page,
      limit,
      sort,
      order,
      search,
      inStock,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdController(
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;

    if (!productId) {
      throw new AppError("Product id is required", 400);
    }

    const product = await getProductById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}