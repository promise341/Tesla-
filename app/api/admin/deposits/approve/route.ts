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

/* ── PATCH /api/admin/deposits/approve ──────────────────
   Admin endpoint to approve a pending deposit and credit
   the user's balance.
   
   Body: { transactionId: string, approved: boolean, notes?: string }
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

  if (transaction.type !== "DEPOSIT") {
    return NextResponse.json({ error: "This endpoint is for DEPOSIT transactions only" }, { status: 400 });
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
    // Credit balance and mark transaction as COMPLETED
    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Deposit of $${transaction.amount} approved and credited to user`,
      transaction: updatedTx,
    });
  } else {
    // Reject transaction
    const updatedTx = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({
      success: true,
      message: `Deposit of $${transaction.amount} rejected`,
      transaction: updatedTx,
    });
  }
}

/* ── GET /api/admin/deposits/approve ──────────────────
   Admin endpoint to get all pending deposits.
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

  const deposits = await prisma.transaction.findMany({
    where: {
      type: "DEPOSIT",
      status: "PENDING",
      proofImageUrl: { not: null }, // ONLY show deposits WITH proof uploads
      proofStatus: "PENDING", // ONLY show unverified proofs
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
    count: deposits.length,
    deposits,
  });
}
