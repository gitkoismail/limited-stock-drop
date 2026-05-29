import { prisma } from "../db/prisma";

const API_URL = "http://localhost:5000/api/reservations/reserve";
const PRODUCT_NAME = "Limited Edition Mechanical Keyboard";
const TEST_USER_COUNT = 100;
const TEST_STOCK = 10;

type ReserveResponse = {
  success: boolean;
  message?: string;
  data?: {
    reservationId: string;
  };
};

async function resetTestData(productId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({
      where: {
        productId,
      },
    });

    await tx.inventoryLog.deleteMany({
      where: {
        productId,
      },
    });

    await tx.reservation.deleteMany({
      where: {
        productId,
      },
    });

    await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: TEST_STOCK,
      },
    });
  });
}

async function createTestUsers() {
  const users = [];

  for (let i = 1; i <= TEST_USER_COUNT; i++) {
    const user = await prisma.user.upsert({
      where: {
        email: `loadtest-user-${i}@limiteddrop.com`,
      },
      update: {},
      create: {
        email: `loadtest-user-${i}@limiteddrop.com`,
        name: `Load Test User ${i}`,
      },
    });

    users.push(user);
  }

  return users;
}

async function sendReserveRequest(userId: string, productId: string) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      productId,
      quantity: 1,
    }),
  });

  const body = (await response.json()) as ReserveResponse;

  return {
    status: response.status,
    body,
  };
}

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      name: PRODUCT_NAME,
    },
  });

  if (!product) {
    throw new Error("Test product not found");
  }

  console.log("Resetting test data...");
  await resetTestData(product.id);

  console.log("Creating test users...");
  const users = await createTestUsers();

  console.log("Sending 100 concurrent reservation requests...");

  const results = await Promise.all(
    users.map((user) => sendReserveRequest(user.id, product.id))
  );

  const successfulReservations = results.filter(
    (result) => result.body.success === true
  );

  const failedReservations = results.filter(
    (result) => result.body.success === false
  );

  const finalProduct = await prisma.product.findUnique({
    where: {
      id: product.id,
    },
  });

  const activeReservations = await prisma.reservation.count({
    where: {
      productId: product.id,
      status: "ACTIVE",
    },
  });

  console.log("\n--- Concurrency Test Result ---");
  console.log(`Total requests: ${results.length}`);
  console.log(`Successful reservations: ${successfulReservations.length}`);
  console.log(`Failed reservations: ${failedReservations.length}`);
  console.log(`Active reservations in DB: ${activeReservations}`);
  console.log(`Final stock: ${finalProduct?.stock}`);

  console.log("\nExpected:");
  console.log(`Successful reservations should be: ${TEST_STOCK}`);
  console.log("Final stock should be: 0");
  console.log("Stock should never be negative");

  if (
    successfulReservations.length === TEST_STOCK &&
    activeReservations === TEST_STOCK &&
    finalProduct?.stock === 0
  ) {
    console.log("\n✅ PASS: Overselling prevented successfully.");
  } else {
    console.log("\n❌ FAIL: Something is wrong with concurrency handling.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });