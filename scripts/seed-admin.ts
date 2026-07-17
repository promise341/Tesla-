import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding admin user...");

  const adminEmail = "admin@teslacapx.com";
  const adminPassword = "Admin@12345";
  const adminUsername = "admin";

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", adminEmail);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        name: "Admin User",
        phone: "+1234567890",
        country: "United States",
        passwordHash,
        balance: 10000, // Give admin some balance
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("👤 Username:", adminUsername);
    console.log("\n🔓 Use these credentials to log in to the admin panel at /admin");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
