const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("📦 Exporting local database data...");

  try {
    const users = await prisma.user.findMany({
      include: {
        activePlans: true,
        depositAddresses: true,
        giveawayEntries: true,
        notifications: true,
        orders: true,
        trades: true,
        transactions: true,
        vipMemberships: true,
      },
    });

    const cars = await prisma.car.findMany();
    const giveaways = await prisma.giveaway.findMany();

    const data = {
      exportedAt: new Date().toISOString(),
      userCount: users.length,
      users,
      cars,
      giveaways,
    };

    const outputPath = path.join(__dirname, "../database-backup.json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`✅ Successfully exported ${users.length} users and all associated data to:`);
    console.log(`   ${outputPath}`);
  } catch (error) {
    console.error("❌ Error exporting database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
