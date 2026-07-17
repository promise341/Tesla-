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

    const orders = await prisma.order.findMany({
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

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching car orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch car orders" },
      { status: 500 }
    );
  }
}
