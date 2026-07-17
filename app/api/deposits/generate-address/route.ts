import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/* Mock crypto address generator - in production use an actual crypto API */
function generateMockAddress(currency: string): string {
  const prefixes: Record<string, string> = {
    BTC: "1A",
    ETH: "0x",
    USDT: "0x",
  };
  const prefix = prefixes[currency] || "0x";
  const randomHex = Math.random().toString(16).slice(2);
  const randomNum = Math.random().toString(16).slice(2);
  return prefix + (randomHex + randomNum + randomHex).slice(0, 40);
}

/* ── POST /api/deposits/generate-address ──────────────────
   Generates a unique crypto wallet address for the user
   to send funds to. Address is valid for 24 hours.
   
   Body: { currency: "BTC" | "ETH" | "USDT" }
──────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { currency } = body;

  if (!["BTC", "ETH", "USDT"].includes(currency)) {
    return NextResponse.json(
      { error: "Invalid currency. Must be BTC, ETH, or USDT" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if user already has an active address for this currency
  const existingAddress = await prisma.depositAddress.findFirst({
    where: {
      userId: user.id,
      currency,
      expiresAt: { gt: new Date() }, // Not expired
    },
  });

  if (existingAddress) {
    return NextResponse.json({
      success: true,
      address: existingAddress.address,
      currency,
      expiresAt: existingAddress.expiresAt,
      message: "Using existing active address",
    });
  }

  // Generate new address
  const address = generateMockAddress(currency);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const depositAddress = await prisma.depositAddress.create({
    data: {
      userId: user.id,
      currency,
      address,
      expiresAt,
    },
  });

  return NextResponse.json({
    success: true,
    address: depositAddress.address,
    currency,
    expiresAt: depositAddress.expiresAt,
    message: `Send ${currency} to this address. It will be valid for 24 hours.`,
  });
}

/* ── GET /api/deposits/generate-address ──────────────────
   Retrieve current active deposit addresses for the user.
──────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const addresses = await prisma.depositAddress.findMany({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() }, // Only active addresses
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    addresses: addresses.map((a) => ({
      currency: a.currency,
      address: a.address,
      expiresAt: a.expiresAt,
    })),
  });
}
