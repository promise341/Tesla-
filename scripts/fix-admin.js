const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing admin account...\n");

  const adminEmail = "admin@teslacapx.com";
  const adminPassword = "Admin@12345";

  try {
    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      console.log("❌ Admin user not found!");
      process.exit(1);
    }

    console.log("Current admin account:");
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Role: ${admin.role}`);
    console.log("");

    // Generate fresh password hash
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Update admin
    const updated = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: "Admin User",
        username: "admin",
        passwordHash,
        role: "ADMIN",
        balance: 10000,
      },
    });

    console.log("✅ Admin account fixed!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin@teslacapx.com");
    console.log("👤 Username: admin");
    console.log("🔑 Password: Admin@12345");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\nYou can now:");
    console.log("  • Log in with: admin@teslacapx.com / Admin@12345");
    console.log("  • OR use username: admin / Admin@12345");
    console.log("  • Access admin panel: /admin");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
