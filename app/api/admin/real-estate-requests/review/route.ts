import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, name: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId, action } = await req.json();

    if (!requestId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get the request
    const request = await prisma.activePlan.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Update request to approved
      await prisma.activePlan.update({
        where: { id: requestId },
        data: {
          paymentStatus: "APPROVED",
          status: "ACTIVE",
        },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: "REAL_ESTATE_APPROVED",
          title: "Real Estate Access Approved! 🎉",
          message: `Your request for ${request.planName} has been approved. You can now access premium real estate investments.`,
          read: false,
        },
      });

      // Log the action
      console.log(`[ADMIN] ${admin.name} approved real estate request ${requestId} for user ${request.user.name}`);

      return NextResponse.json({
        success: true,
        message: "Request approved successfully",
      });
    } else {
      // Reject request - delete the pending request
      await prisma.activePlan.delete({
        where: { id: requestId },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: "REAL_ESTATE_REJECTED",
          title: "Real Estate Request Rejected",
          message: `Your request for ${request.planName} was rejected. Please contact support for more information or resubmit with correct payment proof.`,
          read: false,
        },
      });

      // Log the action
      console.log(`[ADMIN] ${admin.name} rejected real estate request ${requestId} for user ${request.user.name}`);

      return NextResponse.json({
        success: true,
        message: "Request rejected successfully",
      });
    }
  } catch (error) {
    console.error("Error reviewing real estate request:", error);
    return NextResponse.json(
      { error: "Failed to review request" },
      { status: 500 }
    );
  }
}
