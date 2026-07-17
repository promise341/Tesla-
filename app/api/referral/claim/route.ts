import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

const REFERRAL_BONUS = 50; // $50 bonus per successful referral

/* ── POST /api/referral/claim ────────────────────────────
   Referrer claims their bonus when referee deposits money.
   Called automatically when a deposit is approved, or 
   manually by the referrer.
   
   Body: { refereeEmail: string }
──────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { refereeEmail } = body;

  if (!refereeEmail) {
    return NextResponse.json({ error: "Referee email required" }, { status: 400 });
  }

  const referrer = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!referrer) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const referee = await prisma.user.findUnique({
    where: { email: refereeEmail },
    select: { id: true },
  });

  if (!referee) {
    return NextResponse.json({ error: "Referee not found" }, { status: 404 });
  }

  // Find the referral
  const referral = await prisma.referral.findUnique({
    where: {
      referrerId_refereeId: {
        referrerId: referrer.id,
        refereeId: referee.id,
      },
    },
  });

  if (!referral) {
    return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  }

  if (referral.status === "CREDITED") {
    return NextResponse.json(
      { error: "Bonus already claimed" },
      { status: 400 }
    );
  }

  if (referral.status === "EXPIRED") {
    return NextResponse.json(
      { error: "Referral bonus has expired" },
      { status: 400 }
    );
  }

  // Check if referee has made a deposit
  const deposit = await prisma.transaction.findFirst({
    where: {
      userId: referee.id,
      type: "DEPOSIT",
      status: "COMPLETED",
    },
  });

  if (!deposit) {
    return NextResponse.json(
      { error: "Referee must complete a deposit to claim bonus" },
      { status: 400 }
    );
  }

  // Credit bonus and mark referral as CREDITED
  const [updatedReferral] = await prisma.$transaction([
    prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "CREDITED",
        bonusAmount: REFERRAL_BONUS,
        creditedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: referrer.id },
      data: { balance: { increment: REFERRAL_BONUS } },
    }),
    prisma.transaction.create({
      data: {
        userId: referrer.id,
        type: "PROFIT",
        amount: REFERRAL_BONUS,
        method: "REFERRAL",
        address: referee.id,
        status: "COMPLETED",
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: `Referral bonus of $${REFERRAL_BONUS} credited to your account`,
    referral: updatedReferral,
  });
}

/* ── GET /api/referral/claim ────────────────────────────
   Get referrer's referral stats and pending bonuses.
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

  const referrals = await prisma.referral.findMany({
    where: { referrerId: user.id },
    include: {
      referee: {
        select: { email: true, name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    totalReferrals: referrals.length,
    creditedBonuses: referrals.filter((r) => r.status === "CREDITED").length,
    pendingBonuses: referrals.filter((r) => r.status === "PENDING").length,
    totalBonusEarned: referrals
      .filter((r) => r.status === "CREDITED")
      .reduce((sum, r) => sum + r.bonusAmount, 0),
  };

  return NextResponse.json({
    success: true,
    stats,
    referrals,
  });
}
