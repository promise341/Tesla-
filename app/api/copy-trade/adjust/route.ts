import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId, addAmount } = await req.json();
  if (!planId || !addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0)
    return NextResponse.json({ error: "planId and addAmount are required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, balance: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const plan = await prisma.activePlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== user.id)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  if (plan.status !== "ACTIVE")
    return NextResponse.json({ error: "Plan is not active" }, { status: 400 });

  const amt = Number(addAmount);
  if (amt > Number(user.balance))
    return NextResponse.json(
      { error: `Insufficient balance. You have $${Number(user.balance).toFixed(2)} available.` },
      { status: 400 }
    );

  // Add capital to plan + deduct from balance + log transaction
  await prisma.$transaction([
    prisma.activePlan.update({
      where: { id: planId },
      data:  { capital: { increment: amt } },
    }),
    prisma.user.update({
      where: { id: user.id },
      data:  { balance: { decrement: amt } },
    }),
    prisma.transaction.create({
      data: {
        userId:  user.id,
        type:    "COPY_TRADE",
        amount:  amt,
        method:  "BALANCE",
        address: `Top-up: ${plan.planName}`,
        status:  "COMPLETED",
      },
    }),
  ]);

  return NextResponse.json({ success: true, addedAmount: amt });
}
