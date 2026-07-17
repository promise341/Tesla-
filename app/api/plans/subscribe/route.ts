import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { planName, amount, rate, duration } = body;

  if (!planName || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "Invalid plan or amount" }, { status: 400 });
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
      { error: `Insufficient balance. Your balance is $${user.balance.toFixed(2)}` },
      { status: 400 }
    );
  }

  // Deduct from balance and create the active plan in a transaction
  const [activePlan] = await prisma.$transaction([
    prisma.activePlan.create({
      data: {
        userId: user.id,
        planName,
        capital: Number(amount),
        rate: Number(rate),
        status: "ACTIVE",
        paymentMethod: "BALANCE", // Mark as balance payment
        paymentStatus: "APPROVED", // Instant approval for balance payments
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: Number(amount) } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "INVESTMENT", // Changed from DEPOSIT to INVESTMENT
        amount: Number(amount),
        method: "BALANCE",
        address: planName,
        status: "COMPLETED",
      },
    }),
  ]);

  return NextResponse.json({ success: true, activePlan }, { status: 201 });
}
