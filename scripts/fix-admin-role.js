const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: "admin@teslacapx.com" },
    data: { role: "ADMIN" },
  });
  console.log("✅ Admin role set for:", updated.email, "| Role:", updated.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
