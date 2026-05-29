import { prisma } from "../db/prisma";

const DEMO_USER_EMAIL = "demo@limiteddrop.com";
const PRODUCT_NAME = "Limited Edition Mechanical Keyboard";
const DEMO_STOCK = 10;

async function main() {
  console.log("Resetting demo data...");

  const user = await prisma.user.upsert({
    where: {
      email: DEMO_USER_EMAIL,
    },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    },
  });

  const existingProduct = await prisma.product.findFirst({
    where: {
      name: PRODUCT_NAME,
    },
  });

  const product =
    existingProduct ??
    (await prisma.product.create({
      data: {
        name: PRODUCT_NAME,
        description:
          "A limited-stock premium mechanical keyboard available for a short drop window.",
        priceInCents: 24999,
        stock: DEMO_STOCK,
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
        stock: DEMO_STOCK,
      },
    });
  });

  console.log("Demo reset completed.");
  console.log({
    userId: user.id,
    productId: product.id,
    stock: DEMO_STOCK,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });