import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

async function isAdmin(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/* ── PATCH /api/admin/proofs/approve ──────────────────
   Admin verifies payment proof and credits/activates accordingly.
   
   Body: { 
     id: string, 
     type: "DEPOSIT" | "PLAN" | "VIP" | "CAR",
     approved: boolean, 
     message?: string 
   }
──────────────────────────────────────────────────────── */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await isAdmin(session.user.email);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { id, type, approved, message } = body;

  if (!id || !type || typeof approved !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (type === "DEPOSIT") {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!transaction) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      if (approved) {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id },
            data: { status: "COMPLETED", proofStatus: "VERIFIED" },
          }),
          prisma.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } },
          }),
          prisma.notification.create({
            data: {
              userId: transaction.userId,
              type: "DEPOSIT_APPROVED",
              title: "Deposit Approved ✅",
              message: message || `Your ${transaction.method} deposit of $${transaction.amount.toFixed(2)} has been approved and credited to your account.`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "Deposit approved and balance credited" });
      } else {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id },
            data: { status: "REJECTED", proofStatus: "REJECTED" },
          }),
          prisma.notification.create({
            data: {
              userId: transaction.userId,
              type: "DEPOSIT_REJECTED",
              title: "Deposit Rejected ❌",
              message: message || `Your deposit was rejected. Please contact support.`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "Deposit rejected" });
      }
    }

    if (type === "PLAN") {
      const plan = await prisma.activePlan.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      if (approved) {
        await prisma.$transaction([
          prisma.activePlan.update({
            where: { id },
            data: { paymentStatus: "APPROVED", status: "ACTIVE" },
          }),
          prisma.notification.create({
            data: {
              userId: plan.userId,
              type: "PLAN_APPROVED",
              title: "Investment Plan Approved ✅",
              message: message || `Your ${plan.planName} investment plan ($${plan.capital}) has been approved and activated!`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "Plan approved and activated" });
      } else {
        await prisma.$transaction([
          prisma.activePlan.update({
            where: { id },
            data: { paymentStatus: "REJECTED", status: "REJECTED" },
          }),
          prisma.notification.create({
            data: {
              userId: plan.userId,
              type: "PLAN_REJECTED",
              title: "Investment Plan Rejected ❌",
              message: message || `Your investment plan was rejected. Please contact support.`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "Plan rejected" });
      }
    }

    if (type === "VIP") {
      const vip = await prisma.vipMembership.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!vip) {
        return NextResponse.json({ error: "VIP membership not found" }, { status: 404 });
      }

      if (approved) {
        const expiresAt = new Date();
        const durationDays = vip.duration === "1 Month" ? 30 : vip.duration === "3 Months" ? 90 : vip.duration === "6 Months" ? 180 : 365;
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await prisma.$transaction([
          prisma.vipMembership.update({
            where: { id },
            data: { 
              status: "ACTIVE", 
              payStatus: "PAYMENT_VERIFIED",
              expiresAt 
            },
          }),
          prisma.notification.create({
            data: {
              userId: vip.userId,
              type: "VIP_APPROVED",
              title: "VIP Membership Activated ✅",
              message: message || `Your ${vip.cardName} VIP membership has been activated! Expires: ${expiresAt.toLocaleDateString()}`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "VIP membership activated" });
      } else {
        await prisma.$transaction([
          prisma.vipMembership.update({
            where: { id },
            data: { status: "REJECTED", payStatus: "PAYMENT_REJECTED" },
          }),
          prisma.notification.create({
            data: {
              userId: vip.userId,
              type: "VIP_REJECTED",
              title: "VIP Purchase Rejected ❌",
              message: message || `Your VIP purchase was rejected. Please contact support.`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "VIP purchase rejected" });
      }
    }

    if (type === "CAR") {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (approved) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id },
            data: { status: "CONFIRMED" },
          }),
          prisma.notification.create({
            data: {
              userId: order.userId,
              type: "CAR_ORDER_APPROVED",
              title: "Car Order Confirmed ✅",
              message: message || `Your order for ${order.carName} ($${order.price.toLocaleString()}) has been confirmed! We'll contact you shortly.`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "Car order confirmed" });
      } else {
        await prisma.$transaction([
          prisma.order.update({
            where: { id },
            data: { status: "REJECTED" },
          }),
          prisma.notification.create({
            data: {
              userId: order.userId,
              type: "CAR_ORDER_REJECTED",
              title: "Car Order Rejected ❌",
              message: message || `Your car order was rejected. Please contact support.`,
              read: false,
            },
          }),
        ]);

        return NextResponse.json({ success: true, message: "Car order rejected" });
      }
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Proof approval error:", error);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}

/* ── GET /api/admin/proofs/approve ──────────────────
   Get all pending payment proofs for review (all payment types).
──────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await isAdmin(session.user.email);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // Get deposit proofs
  const depositProofs = await prisma.transaction.findMany({
    where: {
      type: "DEPOSIT",
      proofImageUrl: { not: null },
      proofStatus: "PENDING",
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
  });

  // Get investment plan proofs
  const planProofs = await prisma.activePlan.findMany({
    where: {
      paymentStatus: "PENDING",
      paymentProofUrl: { not: null },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
  });

  // Get VIP purchase proofs
  const vipProofs = await prisma.vipMembership.findMany({
    where: {
      status: "PENDING",
      proofUrl: { not: "" },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
  });

  // Get car order proofs
  const carProofs = await prisma.order.findMany({
    where: {
      status: "PENDING",
      proofUrl: { not: "" },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
  });

  // Format all proofs to unified structure
  const allProofs = [
    ...depositProofs.map(p => ({
      id: p.id,
      type: "DEPOSIT" as const,
      userId: p.userId,
      amount: p.amount,
      method: p.method,
      proofImageUrl: p.proofImageUrl!,
      userWalletAddress: p.userWalletAddress || "N/A",
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      details: `Deposit via ${p.method}`,
    })),
    ...planProofs.map(p => ({
      id: p.id,
      type: "PLAN" as const,
      userId: p.userId,
      amount: p.capital,
      method: p.paymentMethod || "CRYPTO",
      proofImageUrl: p.paymentProofUrl!,
      userWalletAddress: p.userWalletAddress || "N/A",
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      details: `Investment Plan: ${p.planName} (${p.category})`,
    })),
    ...vipProofs.map(p => ({
      id: p.id,
      type: "VIP" as const,
      userId: p.userId,
      amount: p.price,
      method: p.paymentMethod || "CRYPTO",
      proofImageUrl: p.proofUrl,
      userWalletAddress: "N/A",
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      details: `VIP Card: ${p.cardName} (${p.duration})`,
    })),
    ...carProofs.map(p => ({
      id: p.id,
      type: "CAR" as const,
      userId: p.userId,
      amount: p.price,
      method: p.paymentMethod,
      proofImageUrl: p.proofUrl,
      userWalletAddress: p.walletAddress,
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      details: `Car Order: ${p.carName}`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    success: true,
    count: allProofs.length,
    proofs: allProofs,
  });
}
