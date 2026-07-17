import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/* ── GET /api/user/real-estate-plans ──────────────────
   Returns user's APPROVED real estate plans only.
   Used to check if user has access to real estate page.
──────────────────────────────────────────────────────── */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's APPROVED real estate plans only
    const realEstatePlans = await prisma.activePlan.findMany({
      where: {
        userId: user.id,
        category: "real-estate",
        paymentStatus: "APPROVED",
        status: "ACTIVE",
      },
      select: {
        id: true,
        planName: true,
        capital: true,
        rate: true,
        createdAt: true,
        lastPayout: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      plans: realEstatePlans,
      hasAccess: realEstatePlans.length > 0,
    });
  } catch (error) {
    console.error("[GET REAL ESTATE PLANS ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to fetch real estate plans" },
      { status: 500 }
    );
  }
}
