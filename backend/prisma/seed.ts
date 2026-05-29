import { prisma } from "../src/db/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "demo@limiteddrop.com",
    },
    update: {},
    create: {
      email: "demo@limiteddrop.com",
      name: "Demo User",
    },
  });

  const existingProduct = await prisma.product.findFirst({
    where: {
      name: "Limited Edition Mechanical Keyboard",
    },
  });

  const product =
    existingProduct ??
    (await prisma.product.create({
      data: {
        name: "Limited Edition Mechanical Keyboard",
        description:
          "A limited-stock premium mechanical keyboard available for a short drop window.",
        priceInCents: 24999,
        stock: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200",
      },
    }));

  console.log("Seed completed");
  console.log({ user, product });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });