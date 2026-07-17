const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.order.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.activePlan.deleteMany({});
  await prisma.car.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating default accounts...");
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const userPasswordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "Tesla-CapX Admin",
      email: "admin@teslacapx.com",
      phone: "+1 (800) 555-0199",
      country: "United Kingdom",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      balance: 1000000.0,
      totalProfit: 0.0,
      totalWithdraw: 0.0
    }
  });

  const testUser = await prisma.user.create({
    data: {
      username: "testuser",
      name: "Test Trader",
      email: "test@test.com",
      phone: "+1 (555) 019-9123",
      country: "United States",
      passwordHash: userPasswordHash,
      role: "USER",
      balance: 1500.0, // starting balance
      totalProfit: 120.0,
      totalWithdraw: 50.0
    }
  });

  console.log("Seeding vehicle catalog...");
  const cars = [
    {
      name: "Tesla Model 3 Long Range",
      rangeMiles: "363 miles",
      topSpeed: "225 km/h (140 mph)",
      zeroToSixty: "4.2 seconds",
      price: 42490.00,
      imageUrl: "https://teslacapx.com/dash/cars/4/69c29f1b7979e.jpg",
      isFeatured: true
    },
    {
      name: "Cyber Truck",
      rangeMiles: "320 miles",
      topSpeed: "130 mph",
      zeroToSixty: "2.6 seconds",
      price: 91500.00,
      imageUrl: "https://teslacapx.com/dash/cars/5/69c2a1cf16d3c.jpeg",
      isFeatured: true
    },
    {
      name: "Tesla Model Y",
      rangeMiles: "337 miles",
      topSpeed: "250 km/h",
      zeroToSixty: "3.5 seconds",
      price: 43489.96,
      imageUrl: "https://teslacapx.com/dash/cars/6/69c2cf1617bff.png",
      isFeatured: true
    },
    {
      name: "Tesla Roadster",
      rangeMiles: "620 miles",
      topSpeed: "250 mph",
      zeroToSixty: "1.9 seconds",
      price: 199499.96,
      imageUrl: "https://teslacapx.com/dash/cars/7/69c3ee94623a4.webp",
      isFeatured: true
    },
    {
      name: "Tesla Model X",
      rangeMiles: "329 miles",
      topSpeed: "149 mph",
      zeroToSixty: "2.5 seconds",
      price: 87700.00,
      imageUrl: "https://teslacapx.com/dash/cars/8/69c3f2cabb77d.jpg",
      isFeatured: false
    },
    {
      name: "Tesla Powerwall",
      rangeMiles: "13.5 kWh capacity",
      topSpeed: "N/A",
      zeroToSixty: "N/A",
      price: 11000.00,
      imageUrl: "https://teslacapx.com/dash/cars/10/69c404f5e8dc2.png",
      isFeatured: false
    },
    {
      name: "Tesla Wall Connector",
      rangeMiles: "N/A",
      topSpeed: "44 mi/hr charge",
      zeroToSixty: "N/A",
      price: 498.97,
      imageUrl: "https://teslacapx.com/dash/cars/11/69c40685e0fac.jpg",
      isFeatured: false
    },
    {
      name: "Tesla Optimus",
      rangeMiles: "24h Battery",
      topSpeed: "5 mph",
      zeroToSixty: "N/A",
      price: 28998.98,
      imageUrl: "https://teslacapx.com/dash/cars/12/69c407f660122.webp",
      isFeatured: false
    },
    {
      name: "Tesla Semi",
      rangeMiles: "500 miles",
      topSpeed: "105 mph",
      zeroToSixty: "15 seconds",
      price: 28500.02,
      imageUrl: "https://teslacapx.com/dash/cars/13/69c40a3f6c962.jpg",
      isFeatured: false
    }
  ];

  for (const car of cars) {
    await prisma.car.create({ data: car });
  }

  console.log("Database seeded successfully!");
  console.log(`Admin User: admin (password: admin123)`);
  console.log(`Test User: test@test.com (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
