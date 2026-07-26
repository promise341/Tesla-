const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const backupPath = path.join(__dirname, "../database-backup.json");

if (!fs.existsSync(backupPath)) {
  console.error("❌ Backup file not found at database-backup.json. Run node scripts/export-data.js first.");
  process.exit(1);
}

const dbUrl = process.env.REMOTE_POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.argv[2];

if (!dbUrl) {
  console.error("❌ Please provide a remote database URL.");
  console.log("Usage: node scripts/import-to-remote.js <POSTGRES_PRISMA_URL>");
  console.log("Or set process.env.POSTGRES_PRISMA_URL before running.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  console.log("🚀 Starting import to remote database...");
  const rawData = fs.readFileSync(backupPath, "utf8");
  const data = JSON.parse(rawData);

  console.log(`Found ${data.users.length} users to restore.`);

  for (const user of data.users) {
    const { activePlans, depositAddresses, giveawayEntries, notifications, orders, trades, transactions, vipMemberships, ...userData } = user;

    console.log(`Restoring user: ${user.email} (${user.role})...`);

    await prisma.user.upsert({
      where: { email: user.email },
      update: userData,
      create: userData,
    });
  }

  console.log("✅ All user credentials and data successfully imported to remote database!");
}

main()
  .catch((err) => {
    console.error("❌ Import failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
