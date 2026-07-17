const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating admin password...");

  const adminEmail = "admin@teslacapx.com";
  const adminPassword = "Admin@12345";

  try {
    // Hash password fresh
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    console.log("📝 Updating password hash for admin...");

    // Update admin password
    const admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash },
    });

    console.log("\n✅ Admin password updated!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    " + adminEmail);
    console.log("🔑 Password: " + adminPassword);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n Try logging in now!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
