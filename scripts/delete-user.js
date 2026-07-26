const { PrismaClient } = require("@prisma/client");

const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.log("❌ Please provide the email of the user to delete.");
  console.log("Usage:");
  console.log("  node scripts/delete-user.js user@example.com");
  process.exit(1);
}

const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL;

const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

async function main() {
  console.log(`🔍 Looking for user with email: ${emailToDelete}...`);

  const user = await prisma.user.findUnique({
    where: { email: emailToDelete.toLowerCase().trim() },
  });

  if (!user) {
    console.log(`❌ No user found with email: ${emailToDelete}`);
    process.exit(1);
  }

  console.log(`⚠️ Deleting user: ${user.name} (${user.email}) - ID: ${user.id}`);

  // Delete child records in proper order to maintain referential integrity
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: user.id } }),
    prisma.activePlan.deleteMany({ where: { userId: user.id } }),
    prisma.order.deleteMany({ where: { userId: user.id } }),
    prisma.trade.deleteMany({ where: { userId: user.id } }),
    prisma.notification.deleteMany({ where: { userId: user.id } }),
    prisma.depositAddress.deleteMany({ where: { userId: user.id } }),
    prisma.vipMembership.deleteMany({ where: { userId: user.id } }),
    prisma.giveawayEntry.deleteMany({ where: { userId: user.id } }),
    prisma.referral.deleteMany({
      where: {
        OR: [{ referrerId: user.id }, { refereeId: user.id }],
      },
    }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  console.log(`✅ Successfully deleted user ${emailToDelete} and all associated records!`);
}

main()
  .catch((err) => {
    console.error("❌ Delete failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
