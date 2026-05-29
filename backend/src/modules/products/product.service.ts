import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";

type ProductSortField = "createdAt" | "priceInCents" | "stock" | "name";
type SortOrder = "asc" | "desc";

type GetProductsQuery = {
  page: number;
  limit: number;
  sort: ProductSortField;
  order: SortOrder;
  search?: string;
  inStock?: boolean;
};

export async function getProducts(query: GetProductsQuery) {
  const skip = (query.page - 1) * query.limit;

  const where: Prisma.ProductWhereInput = {};

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.inStock === true) {
    where.stock = {
      gt: 0,
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        [query.sort]: query.order,
      },
    }),
    prisma.product.count({
      where,
    }),
  ]);

  return {
    data: products,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getProductById(productId: string) {
  return prisma.product.findUnique({
    where: {
      id: productId,
    },
  });
}