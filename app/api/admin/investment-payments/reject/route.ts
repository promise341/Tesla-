import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { verifyAdminSecurity } from "../../middleware/security";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Check admin security first
  const securityCheck = await verifyAdminSecurity(request);
  if (securityCheck) return securityCheck;

  try {
    const body = await request.json();
    const { investmentId, reason } = body;

    if (!investmentId || !reason) {
      return NextResponse.json(
        { error: "Investment ID and reason required" },
        { status: 400 }
      );
    }

    // Get the investment plan
    const investment = await prisma.activePlan.findUnique({
      where: { id: investmentId },
      include: { user: true },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 }
      );
    }

    if (investment.paymentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Investment already processed" },
        { status: 400 }
      );
    }

    // Reject the investment payment
    await prisma.$transaction([
      // Update plan status
      prisma.activePlan.update({
        where: { id: investmentId },
        data: {
          paymentStatus: "REJECTED",
          status: "REJECTED", // Mark as rejected
        },
      }),
      // Update transaction status
      prisma.transaction.updateMany({
        where: {
          userId: investment.userId,
          type: "INVESTMENT",
          amount: investment.capital,
          status: "PENDING",
        },
        data: {
          status: "REJECTED",
        },
      }),
    ]);

    // Log the admin action
    const session = await getServerSession(authOptions);
    await prisma.transaction.create({
      data: {
        userId: investment.userId,
        type: "ADMIN_ACTION",
        amount: 0,
        method: "SYSTEM",
        address: `Investment ${investment.planName} rejected by ${session?.user?.email}. Reason: ${reason}`,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Investment rejected",
    });
  } catch (error) {
    console.error("Error rejecting investment:", error);
    return NextResponse.json(
      { error: "Failed to reject investment" },
      { status: 500 }
    );
  }
}
