import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/* ── Admin middleware - check if user is admin ── */
async function isAdmin(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

/* ── PATCH /api/admin/withdrawals/approve ──────────────────
   Admin endpoint to approve a pending withdrawal (marking it complete)
   or reject it (refunding the locked balance).
──────────────────────────────────────────────────────── */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is admin
  const admin = await isAdmin(session.user.email);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { transactionId, approved, notes } = body;

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
  }

  if (typeof approved !== "boolean") {
    return NextResponse.json({ error: "Approved status required (true/false)" }, { status: 400 });
  }

  // Find transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  if (transaction.type !== "WITHDRAWAL") {
    return NextResponse.json(
      { error: "This endpoint is for WITHDRAWAL transactions only" },
      { status: 400 }
    );
  }

  if (transaction.status !== "PENDING") {
    return NextResponse.json(
      { error: `Transaction is already ${transaction.status}` },
      { status: 400 }
    );
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!adminUser) {
    return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
  }

  if (approved) {
    // Approved: Mark transaction COMPLETED, increment totalWithdraw.
    // Sender balance was already deducted/locked when requesting, so no balance debit is done here.
    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: {
          totalWithdraw: { increment: transaction.amount },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Withdrawal of $${transaction.amount} approved (status completed)`,
      transaction: updatedTx,
    });
  } else {
    // Rejected: Mark transaction REJECTED and refund the deducted amount to sender's balance.
    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "REJECTED" },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: {
          balance: { increment: transaction.amount },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Withdrawal of $${transaction.amount} rejected and refunded to user balance`,
      transaction: updatedTx,
    });
  }
}

/* ── GET /api/admin/withdrawals/approve ──────────────────
   Admin endpoint to get all pending withdrawals.
──────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is admin
  const admin = await isAdmin(session.user.email);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const withdrawals = await prisma.transaction.findMany({
    where: {
      type: "WITHDRAWAL",
      status: "PENDING",
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    count: withdrawals.length,
    withdrawals,
  });
}
