import { buyerPermissions } from "../config/permissions";
import { db } from "./db";
import bcrypt from "bcryptjs";

const currentYear = new Date().getFullYear();

async function seedBuyer() {
  try {
    console.log("Starting buyer seed...");

    console.log("Creating buyer role...");
    const buyerRole = await db.role.create({
      data: {
        displayName: "Buyer",
        roleName: "buyer",
        description: "Ecommerce customer access",
        permissions: buyerPermissions,
      },
    });

    console.log("Creating buyer user...");
    const buyerPassword = `Buyer@${currentYear}`;
    const buyerUser = await db.user.create({
      data: {
        email: "buyer@buyer.com",
        name: "Sample Buyer",
        firstName: "Sample",
        lastName: "Buyer",
        phone: "1122334455",
        password: await bcrypt.hash(buyerPassword, 10),
        roles: { connect: { id: buyerRole.id } },
      },
    });

    console.log("\nBuyer seed completed successfully!");
    console.log("Buyer credentials: ", { email: "buyer@buyer.com", password: buyerPassword });

  } catch (error) {
    console.error("Error during buyer seeding:", error);
    throw error;
  }
}

seedBuyer()
  .catch((e) => {
    console.error("Failed to seed buyer:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });