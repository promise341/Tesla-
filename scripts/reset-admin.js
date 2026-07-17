const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Resetting admin user...");

  const adminEmail = "admin@teslacapx.com";
  const adminPassword = "Admin@12345";
  const adminUsername = "admin";

  try {
    // Delete existing admin if present
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log("🗑️  Deleting existing admin...");
      await prisma.user.delete({
        where: { email: adminEmail },
      });
      console.log("✅ Deleted");
    }

    // Hash password fresh
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    console.log("📝 Creating new admin user with fresh password hash...");

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        name: "Admin User",
        phone: "+1234567890",
        country: "United States",
        passwordHash,
        balance: 10000,
        role: "ADMIN",
      },
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    " + adminEmail);
    console.log("🔑 Password: " + adminPassword);
    console.log("👤 Username: " + adminUsername);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔓 Use these credentials to log in to:");
    console.log("   http://localhost:3000/login");
    console.log("\n📊 Then access admin panel at:");
    console.log("   http://localhost:3000/admin");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
