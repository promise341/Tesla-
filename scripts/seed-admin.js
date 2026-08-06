const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SUPER ADMIN user...");

  const adminEmail = "admin@teslacapx.com";
  const adminPassword = "Admin@12345";
  const adminUsername = "admin";

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      // Update existing admin to be SUPER ADMIN
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN",
          isSuperAdmin: true,
        },
      });
      
      console.log("✅ Existing admin user upgraded to SUPER ADMIN!");
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🛡️  SUPER ADMIN CREDENTIALS (KEEP SECRET!)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 Email:    " + adminEmail);
      console.log("🔑 Password: " + adminPassword);
      console.log("👤 Username: " + adminUsername);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n⚡ SUPER ADMIN PRIVILEGES:");
      console.log("   ✓ Cannot be deleted by other admins");
      console.log("   ✓ Cannot be suspended or modified");
      console.log("   ✓ Hidden from admin user list");
      console.log("   ✓ Supreme authority over all users");
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create SUPER ADMIN user - IMMUTABLE & HIDDEN
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        name: "System Administrator",
        phone: "+1234567890",
        country: "United States",
        passwordHash,
        balance: 10000, // Give admin some balance
        role: "ADMIN",
        isSuperAdmin: true, // SUPER ADMIN FLAG - Cannot be modified by anyone
      },
    });

    console.log("✅ SUPER ADMIN user created successfully!");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🛡️  SUPER ADMIN CREDENTIALS (KEEP SECRET!)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    " + adminEmail);
    console.log("🔑 Password: " + adminPassword);
    console.log("👤 Username: " + adminUsername);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚡ SUPER ADMIN PRIVILEGES:");
    console.log("   ✓ Cannot be deleted by other admins");
    console.log("   ✓ Cannot be suspended or modified");
    console.log("   ✓ Hidden from admin user list");
    console.log("   ✓ Supreme authority over all users");
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
