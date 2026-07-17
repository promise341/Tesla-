import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSecurity } from "@/app/api/admin/middleware/security";

export async function POST(request: NextRequest) {
  try {
    const securityCheck = await verifyAdminSecurity(request);
    if (securityCheck) return securityCheck;

    const body = await request.json();
    const { purchaseId, action, reason } = body;

    if (!purchaseId || !action) {
      return NextResponse.json(
        { error: "Purchase ID and action are required" },
        { status: 400 }
      );
    }

    const purchase = await prisma.vipMembership.findUnique({
      where: { id: purchaseId },
      include: { user: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Calculate expiration date based on duration
      let expiresAt = new Date();
      if (purchase.duration.includes("Month")) {
        const months = parseInt(purchase.duration);
        expiresAt.setMonth(expiresAt.getMonth() + months);
      } else if (purchase.duration === "Lifetime") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);
      }

      // Update purchase status
      await prisma.vipMembership.update({
        where: { id: purchaseId },
        data: { 
          status: "APPROVED",
          payStatus: "PAID",
          expiresAt,
        },
      });

      // Create notification with invoice
      await prisma.notification.create({
        data: {
          userId: purchase.userId,
          type: "vip_purchase_approved",
          title: "VIP Card Activated! 🎉",
          message: `Your ${purchase.cardName} has been activated! Invoice: Purchase #${purchaseId.slice(0, 8)} - ${purchase.cardName} - $${purchase.price.toLocaleString()}. Payment received via ${purchase.paymentMethod}. Enjoy your exclusive benefits!`,
        },
      });

      console.log(`[ADMIN] Approved VIP purchase ${purchaseId} for user ${purchase.user.email}`);

      return NextResponse.json({
        success: true,
        message: "Purchase approved and user notified",
      });
    } else if (action === "REJECT") {
      // Update purchase status
      await prisma.vipMembership.update({
        where: { id: purchaseId },
        data: { status: "REJECTED" },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: purchase.userId,
          type: "vip_purchase_rejected",
          title: "VIP Purchase Update",
          message: `Your purchase request for ${purchase.cardName} has been reviewed. ${reason || "Please contact support for more details."}`,
        },
      });

      console.log(`[ADMIN] Rejected VIP purchase ${purchaseId} for user ${purchase.user.email}. Reason: ${reason || "Not specified"}`);

      return NextResponse.json({
        success: true,
        message: "Purchase rejected and user notified",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing VIP purchase:", error);
    return NextResponse.json(
      { error: "Failed to process VIP purchase" },
      { status: 500 }
    );
  }
}
