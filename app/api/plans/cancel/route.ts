import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId } = await req.json();
  if (!planId)
    return NextResponse.json({ error: "planId required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const plan = await prisma.activePlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== user.id)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  if (plan.status === "COMPLETED")
    return NextResponse.json({ error: "Plan already completed" }, { status: 400 });

  // Cancel plan: mark COMPLETED, refund capital, and log the refund transaction
  const [updatedPlan] = await prisma.$transaction([
    prisma.activePlan.update({
      where: { id: planId },
      data: { status: "COMPLETED" },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: plan.capital } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "PLAN_REFUND",
        amount: plan.capital,
        method: "BALANCE",
        address: `Refund: ${plan.planName}`,
        status: "COMPLETED",
      },
    }),
  ]);

  return NextResponse.json({ success: true, plan: updatedPlan });
}

