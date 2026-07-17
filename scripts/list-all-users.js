const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("\n📋 ALL USERS IN DATABASE:\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
    },
    orderBy: { createdAt: "asc" },
  });

  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.name}`);
    console.log(`   Email: ${u.email}`);
    console.log(`   Username: ${u.username}`);
    console.log(`   Role: ${u.role}`);
    console.log("");
  });

  // Check for duplicates
  const emailCounts = {};
  users.forEach((u) => {
    emailCounts[u.email] = (emailCounts[u.email] || 0) + 1;
  });

  const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);

  if (duplicates.length > 0) {
    console.log("⚠️  DUPLICATES FOUND:");
    duplicates.forEach(([email, count]) => {
      console.log(`   ${email} - ${count} accounts`);
    });
  } else {
    console.log("✅ No duplicates found");
  }

  await prisma.$disconnect();
}

main();
