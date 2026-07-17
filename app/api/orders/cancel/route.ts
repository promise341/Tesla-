import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return NextResponse.json({ error: `Cannot cancel an order with status ${order.status}` }, { status: 400 });
    }

    const isBalancePayment = order.paymentMethod === "BALANCE";

    if (isBalancePayment) {
      // Refund user balance and mark cancelled in a transaction
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: order.price } },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "PLAN_REFUND", // Reusing PLAN_REFUND mapping as it's already green and positive
            amount: order.price,
            method: "BALANCE",
            address: `Refund for Car Order: ${order.carName}`,
            status: "COMPLETED",
          },
        }),
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "CAR_ORDER_CANCELLED",
            title: "🚗 Car Order Cancelled",
            message: `Your order for ${order.carName} has been cancelled, and a refund of $${order.price.toLocaleString()} has been credited to your balance.`,
            read: false,
          },
        }),
      ]);
    } else {
      // Just mark as cancelled
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        }),
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "CAR_ORDER_CANCELLED",
            title: "🚗 Car Order Cancelled",
            message: `Your order request for ${order.carName} has been cancelled.`,
            read: false,
          },
        }),
      ]);
    }

    console.log(`[CAR ORDER] User ${user.name} cancelled order ${orderId} for ${order.carName}. Refunded balance: ${isBalancePayment}`);

    return NextResponse.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
