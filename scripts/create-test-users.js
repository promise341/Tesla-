const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const testUsers = [
  {
    email: "user1@example.com",
    username: "user1",
    name: "Test User 1",
    password: "Password@123",
  },
  {
    email: "user2@example.com",
    username: "user2",
    name: "Test User 2",
    password: "Password@123",
  },
  {
    email: "referrer@example.com",
    username: "referrer",
    name: "Referrer User",
    password: "Password@123",
  },
];

async function main() {
  console.log("🌱 Creating test users...\n");

  for (const userData of testUsers) {
    try {
      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⏭️  ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          name: userData.name,
          phone: "+1234567890",
          country: "United States",
          passwordHash,
          balance: 5000, // Give test users starting balance
          role: "USER",
        },
      });

      console.log(`✅ Created: ${userData.name}`);
      console.log(`   📧 ${userData.email}`);
      console.log(`   🔑 ${userData.password}\n`);
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Test users ready!\n");
  console.log("Login at: http://localhost:3000/login\n");

  await prisma.$disconnect();
}

main();
