import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// The withdrawal verification code (in a real system this would be
// generated per-user and stored in DB; here it is a fixed platform code
// that support provides to the user via live chat / email)
const WITHDRAWAL_CODE = "WD-2025-CAPX";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { amount, method, walletAddress, verificationCode } = body;

  // Validate verification code
  if (!verificationCode || verificationCode.trim() !== WITHDRAWAL_CODE) {
    return NextResponse.json(
      { error: "Invalid verification code. Contact support to get your code." },
      { status: 403 }
    );
  }

  // Validate amount
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Validate method
  if (!["USDT", "ETH", "BTC", "BNB", "SOLANA"].includes(method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  // Validate wallet address
  if (!walletAddress || walletAddress.trim().length < 10) {
    return NextResponse.json({ error: "Please provide a valid wallet address" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, balance: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (Number(amount) > user.balance) {
    return NextResponse.json(
      { error: `Insufficient balance. Your available balance is $${user.balance.toFixed(2)}` },
      { status: 400 }
    );
  }

  // Create PENDING withdrawal transaction and debit sender immediately to lock funds
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "WITHDRAWAL",
        amount: Number(amount),
        method,
        address: walletAddress.trim(),
        status: "PENDING",
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: Number(amount) } },
    }),
  ]);

  return NextResponse.json({ success: true, transaction }, { status: 201 });
}
