import { adminPermissions, buyerPermissions } from "@/config/permissions";
import { db } from "./db";
import bcrypt from "bcryptjs";

const currentYear = new Date().getFullYear();

const userPermissions = [
  "dashboard.read",
  "profile.read",
  "profile.update",
  "products.read",
  "orders.read",
  "orders.create",
];

async function cleanDatabase() {
  console.log("Cleaning up existing data...");
  try {
    await db.$transaction(async (tx) => {
      const users = await tx.user.findMany({ include: { roles: true } });

      for (const user of users) {
        if (user.roles.length > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: { roles: { disconnect: user.roles.map((role) => ({ id: role.id })) } },
          });
        }
      }

      await tx.organisation.deleteMany({});
      await tx.session.deleteMany({});
      await tx.account.deleteMany({});
      await tx.blog.deleteMany({});
      await tx.blogCategory.deleteMany({});
      await tx.saving.deleteMany({});
      await tx.category.deleteMany({});

      const deleteUsers = await tx.user.deleteMany({});
      console.log("Deleted users:", deleteUsers.count);

      const deleteRoles = await tx.role.deleteMany({});
      console.log("Deleted roles:", deleteRoles.count);
    });

    console.log("Database cleanup completed.");
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log("Starting to seed new data...");

    console.log("Creating organisation...");
    const org = await db.organisation.create({
      data: {
        name: "Default Organisation",
        slug: "default-organisation",
      },
    });

    // --- Roles ---
    console.log("Creating admin role...");
    const adminRole = await db.role.create({
      data: {
        displayName: "Administrator",
        roleName: "admin",
        description: "Full system access",
        permissions: adminPermissions,
        orgId: org.id
      },
    });

    console.log("Creating user role...");
    const userRole = await db.role.create({
      data: {
        displayName: "User",
        roleName: "user",
        description: "Basic inventory/staff access",
        permissions: userPermissions,
      },
    });

    console.log("Creating buyer role...");
    const buyerRole = await db.role.create({
      data: {
        displayName: "Buyer",
        roleName: "buyer",
        description: "Ecommerce customer access",
        permissions: buyerPermissions,
      },
    });

    // --- Users ---
    console.log("Creating admin user...");
    const adminPassword = `Admin@${currentYear}`;
    const adminUser = await db.user.create({
      data: {
        email: "admin@admin.com",
        name: "System Admin",
        firstName: "System",
        lastName: "Admin",
        orgId: org.id,
        orgName: org.name,
        phone: "1234567890",
        password: await bcrypt.hash(adminPassword, 10),
        roles: { connect: { id: adminRole.id } },
      },
    });

    console.log("Creating staff user...");
    const userPassword = `User@${currentYear}`;
    const regularUser = await db.user.create({
      data: {
        email: "user@user.com",
        name: "Regular User",
        firstName: "Regular",
        lastName: "User",
        orgId: org.id,
        orgName: org.name,
        phone: "0987654321",
        password: await bcrypt.hash(userPassword, 10),
        roles: { connect: { id: userRole.id } },
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
        orgId: org.id,
        orgName: org.name,
        phone: "1122334455",
        password: await bcrypt.hash(buyerPassword, 10),
        roles: { connect: { id: buyerRole.id } },
      },
    });

    console.log("\nSeed completed successfully!");
    console.log("Admin credentials: ", { email: "admin@admin.com", password: adminPassword });
    console.log("Staff credentials: ", { email: "user@user.com",  password: userPassword });
    console.log("Buyer credentials: ", { email: "buyer@buyer.com", password: buyerPassword });

  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

async function main() {
  console.log("Starting database seed process...");
  try {
    await cleanDatabase();
    await seedDatabase();
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error in main seed process:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Failed to seed database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });