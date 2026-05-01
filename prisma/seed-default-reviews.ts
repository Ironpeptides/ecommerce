import { db } from "./db";

async function seedDefaultReviews() {
  try {
    console.log("Starting default reviews seed...");

    // Fetch all products
    console.log("Fetching all products...");
    const products = await db.product.findMany({
      select: { id: true, name: true },
    });

    if (products.length === 0) {
      console.log("No products found. Skipping review seeding.");
      return;
    }

    console.log(`Found ${products.length} products. Fetching a system user...`);

    // Pick the first available user to attach reviews to
    const systemUser = await db.user.findFirst({
      select: { id: true, email: true },
    });

    if (!systemUser) {
      throw new Error("No users found in the database. Please seed users first.");
    }

    console.log(`Using user "${systemUser.email}" as the review author...`);

    // Create a rating-5 review for each product
    const result = await db.review.createMany({
      data: products.map((product) => ({
        userId: systemUser.id,
        productId: product.id,
        rating: 5,
        comment: "Excellent product.",
      })),
      skipDuplicates: true,
    });

    console.log(`\nDefault reviews seed completed successfully!`);
    console.log(`✅ Created ${result.count} reviews with rating 5`);

  } catch (error) {
    console.error("Error during review seeding:", error);
    throw error;
  }
}

seedDefaultReviews()
  .catch((e) => {
    console.error("Failed to seed reviews:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
