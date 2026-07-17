const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  
  console.log('\n=== ALL USERS IN DATABASE ===');
  users.forEach(u => {
    console.log(`Email: ${u.email} | Role: ${u.role} | Name: ${u.name}`);
  });
  console.log(`\nTotal: ${users.length} users`);
  await prisma.$disconnect();
}

checkUsers().catch(console.error);
