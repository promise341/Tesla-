import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/* ── POST /api/referral/track ────────────────────────────
   Track a referral when a new user signs up using a
   referral link. This endpoint should be called from signup.
   
   Body: { referralCode: string, newUserEmail: string }
   
   Note: In production, you'd validate the new user account
   is actually created before crediting the referrer.
──────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const body = await req.json();
  const { referralCode, newUserEmail } = body;

  if (!referralCode || !newUserEmail) {
    return NextResponse.json(
      { error: "Referral code and new user email required" },
      { status: 400 }
    );
  }

  // referralCode is typically the referrer's username
  const referrer = await prisma.user.findUnique({
    where: { username: referralCode },
    select: { id: true },
  });

  if (!referrer) {
    return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
  }

  const referee = await prisma.user.findUnique({
    where: { email: newUserEmail },
    select: { id: true },
  });

  if (!referee) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if referral already exists
  const existing = await prisma.referral.findUnique({
    where: {
      referrerId_refereeId: {
        referrerId: referrer.id,
        refereeId: referee.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Referral already tracked" }, { status: 409 });
  }

  // Create referral record
  const referral = await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      refereeId: referee.id,
      bonusAmount: 0, // Will be credited when referee makes first deposit
      status: "PENDING",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Referral tracked",
    referral,
  });
}
