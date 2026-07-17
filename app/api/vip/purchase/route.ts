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

    const body = await req.json();
    const { cardId, cardName, price, duration, paymentMethod, proofUrl } = body;

    const isBalancePayment = paymentMethod === "BALANCE";

    if (!cardId || !cardName || !price || !duration || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isBalancePayment && !proofUrl) {
      return NextResponse.json(
        { error: "Payment proof is required for crypto payments" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Balance check ────────────────────────────────────────────────────────
    if (isBalancePayment) {
      if (user.balance < price) {
        const shortfall = (price - user.balance).toFixed(2);
        return NextResponse.json(
          {
            error: "Insufficient balance",
            message: `You need $${price.toLocaleString()} but your balance is $${user.balance.toFixed(2)}. Please deposit $${shortfall} more to complete this purchase.`,
            insufficientBalance: true,
            currentBalance: user.balance,
            requiredAmount: price,
            shortfall: Number(shortfall),
          },
          { status: 400 }
        );
      }
    }

    // ── Check for existing active/pending membership ─────────────────────────
    const existingMembership = await prisma.vipMembership.findFirst({
      where: {
        userId: user.id,
        OR: [{ status: "ACTIVE" }, { status: "PENDING" }],
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingMembership) {
      return NextResponse.json(
        {
          error: "You already have an active or pending VIP membership",
          message: `You currently have a ${existingMembership.status.toLowerCase()} ${existingMembership.cardName}. Please wait for it to expire or be processed before purchasing another.`,
        },
        { status: 400 }
      );
    }

    // ── Create membership + optionally deduct balance atomically ─────────────
    let membership;

    if (isBalancePayment) {
      const [newMembership] = await prisma.$transaction([
        prisma.vipMembership.create({
          data: {
            userId: user.id,
            cardName,
            price,
            duration,
            paymentMethod,
            proofUrl: "",
            status: "ACTIVE",
            payStatus: "APPROVED",
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { decrement: price } },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "VIP_PURCHASE",
            amount: price,
            method: "BALANCE",
            address: `VIP Card: ${cardName} (${duration})`,
            status: "COMPLETED",
          },
        }),
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "VIP_ACTIVATED",
            title: "🎉 VIP Card Activated!",
            message: `Your ${cardName} has been activated instantly. You now have access to all premium features for ${duration}.`,
            read: false,
          },
        }),
      ]);
      membership = newMembership;
    } else {
      membership = await prisma.vipMembership.create({
        data: {
          userId: user.id,
          cardName,
          price,
          duration,
          paymentMethod,
          proofUrl: proofUrl ?? "",
          status: "PENDING",
          payStatus: "PAYMENT_PENDING",
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "VIP_PURCHASE_SUBMITTED",
          title: "VIP Card Purchase Submitted",
          message: `Your purchase request for ${cardName} ($${price.toLocaleString()}) has been submitted. Admin will review your proof within 24–48 hours.`,
          read: false,
        },
      });
    }

    console.log(
      `[VIP PURCHASE] ${user.name || user.email} — ${cardName} $${price} via ${paymentMethod} (${isBalancePayment ? "INSTANT" : "PENDING"})`
    );

    return NextResponse.json(
      {
        success: true,
        membership,
        instant: isBalancePayment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing VIP purchase:", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}
