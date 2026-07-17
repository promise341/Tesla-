import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { verifyAdminSecurity } from "../middleware/security";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Check admin security first
  const securityCheck = await verifyAdminSecurity(request);
  if (securityCheck) return securityCheck;

  try {
    // Fetch all pending investment payments
    const investments = await prisma.activePlan.findMany({
      where: {
        paymentStatus: "PENDING",
        status: "PENDING_PAYMENT",
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      investments,
    });
  } catch (error) {
    console.error("Error fetching pending investments:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending investments" },
      { status: 500 }
    );
  }
}
