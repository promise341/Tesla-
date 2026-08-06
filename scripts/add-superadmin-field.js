const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Adding isSuperAdmin field to existing users...");

  try {
    // Set all existing users to isSuperAdmin = false
    const result = await prisma.user.updateMany({
      data: {
        isSuperAdmin: false,
      },
    });

    console.log(`✅ Updated ${result.count} users with isSuperAdmin = false`);
    console.log("✅ Migration complete! You can now run 'npm run seed:admin' to create the super admin.");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
