const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

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
      console.log("📧 Email:", adminEmail);
      console.log("🔑 Password:", adminPassword);
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
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    " + adminEmail);
    console.log("🔑 Password: " + adminPassword);
    console.log("👤 Username: " + adminUsername);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔓 Use these credentials to log in to:");
    console.log("   http://localhost:3000/login");
    console.log("\n📊 Then access admin panel at:");
    console.log("   http://localhost:3000/admin");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
