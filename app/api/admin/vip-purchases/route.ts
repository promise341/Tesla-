import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSecurity } from "@/app/api/admin/middleware/security";

export async function GET(request: NextRequest) {
  try {
    const securityCheck = await verifyAdminSecurity(request);
    if (securityCheck) return securityCheck;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const purchases = await prisma.vipMembership.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching VIP purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch VIP purchases" },
      { status: 500 }
    );
  }
}
