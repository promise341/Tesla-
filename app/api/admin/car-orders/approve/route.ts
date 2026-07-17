import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminSecurity } from "@/app/api/admin/middleware/security";

export async function POST(request: NextRequest) {
  try {
    const securityCheck = await verifyAdminSecurity(request);
    if (securityCheck) return securityCheck;

    const body = await request.json();
    const { orderId, action, reason } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: "Order ID and action are required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "APPROVED" },
      });

      // Create notification with invoice
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "car_order_approved",
          title: "Car Order Approved! 🎉",
          message: `Your order for ${order.carName} has been approved! Invoice: Order #${orderId.slice(0, 8)} - ${order.carName} - $${order.price.toLocaleString()}. Payment received via ${order.paymentMethod}. Your vehicle will be processed for delivery.`,
        },
      });

      console.log(`[ADMIN] Approved car order ${orderId} for user ${order.user.email}`);

      return NextResponse.json({
        success: true,
        message: "Order approved and user notified",
      });
    } else if (action === "REJECT") {
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "REJECTED" },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "car_order_rejected",
          title: "Car Order Update",
          message: `Your order for ${order.carName} has been reviewed. ${reason || "Please contact support for more details."}`,
        },
      });

      console.log(`[ADMIN] Rejected car order ${orderId} for user ${order.user.email}. Reason: ${reason || "Not specified"}`);

      return NextResponse.json({
        success: true,
        message: "Order rejected and user notified",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing car order:", error);
    return NextResponse.json(
      { error: "Failed to process car order" },
      { status: 500 }
    );
  }
}
