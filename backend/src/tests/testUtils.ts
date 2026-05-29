import { prisma } from "../db/prisma";

export const TEST_PRODUCT_NAME = "Limited Edition Mechanical Keyboard";
export const TEST_USER_EMAIL = "demo@limiteddrop.com";
export const TEST_STOCK = 10;

export async function resetTestData() {
  const user = await prisma.user.upsert({
    where: {
      email: TEST_USER_EMAIL,
    },
    update: {},
    create: {
      email: TEST_USER_EMAIL,
      name: "Demo User",
    },
  });

  const existingProduct = await prisma.product.findFirst({
    where: {
      name: TEST_PRODUCT_NAME,
    },
  });

  const product =
    existingProduct ??
    (await prisma.product.create({
      data: {
        name: TEST_PRODUCT_NAME,
        description:
          "A limited-stock premium mechanical keyboard available for a short drop window.",
        priceInCents: 24999,
        stock: TEST_STOCK,
        imageUrl:
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200",
      },
    }));

  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({
      where: {
        productId: product.id,
      },
    });

    await tx.inventoryLog.deleteMany({
      where: {
        productId: product.id,
      },
    });

    await tx.reservation.deleteMany({
      where: {
        productId: product.id,
      },
    });

    await tx.product.update({
      where: {
        id: product.id,
      },
      data: {
        stock: TEST_STOCK,
      },
    });
  });

  return {
    user,
    product,
  };
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}