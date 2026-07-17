const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("\n📊 CHECKING DATABASE...\n");

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      balance: true,
      role: true,
    },
  });

  console.log("👥 USERS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  users.forEach((u) => {
    console.log(`${u.name}`);
    console.log(`  📧 ${u.email}`);
    console.log(`  💰 Balance: $${u.balance.toFixed(2)}`);
    console.log(`  👤 Role: ${u.role}`);
    console.log("");
  });

  // Get all transactions
  const transactions = await prisma.transaction.findMany({
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("💳 TRANSACTIONS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (transactions.length === 0) {
    console.log("No transactions yet");
  } else {
    transactions.forEach((t) => {
      console.log(`${t.user.name} - ${t.type}`);
      console.log(`  Amount: $${t.amount.toFixed(2)}`);
      console.log(`  Method: ${t.method}`);
      console.log(`  Status: ${t.status}`);
      console.log(`  Date: ${new Date(t.createdAt).toLocaleString()}`);
      console.log("");
    });
  }

  await prisma.$disconnect();
}

main();
