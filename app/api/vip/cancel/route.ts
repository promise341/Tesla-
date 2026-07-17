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

    const { membershipId } = await req.json();
    if (!membershipId) {
      return NextResponse.json({ error: "Membership ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = await prisma.vipMembership.findFirst({
      where: { id: membershipId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    if (membership.status !== "PENDING") {
      return NextResponse.json({ error: `Cannot cancel a membership request with status ${membership.status}` }, { status: 400 });
    }

    const isBalancePayment = membership.paymentMethod === "BALANCE";

    if (isBalancePayment) {
      // Refund balance and cancel membership atomically
      await prisma.$transaction([
        prisma.vipMembership.update({
          where: { id: membershipId },
          data: { status: "CANCELLED", payStatus: "PAYMENT_PENDING" },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: membership.price } },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "PLAN_REFUND", // Reuses existing green/incoming mapping
            amount: membership.price,
            method: "BALANCE",
            address: `Refund for VIP Membership: ${membership.cardName}`,
            status: "COMPLETED",
          },
        }),
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "VIP_CANCELLED",
            title: "🎉 VIP Order Cancelled",
            message: `Your request for ${membership.cardName} has been cancelled, and a refund of $${membership.price.toLocaleString()} has been credited to your balance.`,
            read: false,
          },
        }),
      ]);
    } else {
      // Just mark cancelled
      await prisma.$transaction([
        prisma.vipMembership.update({
          where: { id: membershipId },
          data: { status: "CANCELLED" },
        }),
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "VIP_CANCELLED",
            title: "🎉 VIP Order Cancelled",
            message: `Your request for ${membership.cardName} has been cancelled.`,
            read: false,
          },
        }),
      ]);
    }

    console.log(`[VIP CANCEL] User ${user.name} cancelled VIP order ${membershipId} for ${membership.cardName}. Refunded balance: ${isBalancePayment}`);

    return NextResponse.json({ success: true, message: "VIP membership order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling VIP membership order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
