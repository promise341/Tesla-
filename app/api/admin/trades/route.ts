import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// GET /api/admin/trades — fetch all trades with user details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const trades = await prisma.trade.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, username: true, balance: true },
        },
      },
      orderBy: { openedAt: "desc" },
    });

    return NextResponse.json({ success: true, trades });
  } catch (error) {
    console.error("[ADMIN GET TRADES ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}

// PATCH /api/admin/trades — force close or update trade outcome (Win/Loss)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { tradeId, outcome, customPnl } = await req.json();

    if (!tradeId || !outcome) {
      return NextResponse.json({ error: "Trade ID and outcome are required" }, { status: 400 });
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { user: true },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    let pnl = 0;
    if (outcome === "WIN") {
      // 50% to 150% profit
      pnl = customPnl !== undefined ? Number(customPnl) : Math.round(trade.amount * 0.85 * 100) / 100;
    } else if (outcome === "LOSS") {
      pnl = customPnl !== undefined ? -Math.abs(Number(customPnl)) : -trade.amount;
    }

    const closePrice = outcome === "WIN" 
      ? (trade.side === "BUY" ? trade.entryPrice * 1.05 : trade.entryPrice * 0.95)
      : (trade.side === "BUY" ? trade.entryPrice * 0.95 : trade.entryPrice * 1.05);

    const now = new Date();

    // Transaction to update trade and credit/deduct user balance
    const [updatedTrade] = await prisma.$transaction([
      prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "CLOSED",
          closePrice: Math.round(closePrice * 100) / 100,
          pnl,
          pnlPct: Math.round((pnl / trade.amount) * 100),
          closedAt: now,
        },
      }),
      prisma.user.update({
        where: { id: trade.userId },
        data: {
          balance: { increment: pnl },
          totalProfit: pnl > 0 ? { increment: pnl } : undefined,
        },
      }),
      prisma.notification.create({
        data: {
          userId: trade.userId,
          type: "TRADE_CLOSED",
          title: outcome === "WIN" ? "Trade Closed with Profit 🎉" : "Trade Closed",
          message: `Your ${trade.side} position on ${trade.pair} was closed. Result: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}.`,
          read: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Trade forcibly closed as ${outcome}. User balance updated by $${pnl.toFixed(2)}.`,
      trade: updatedTrade,
    });
  } catch (error) {
    console.error("[ADMIN UPDATE TRADE ERROR]:", error);
    return NextResponse.json({ error: "Failed to update trade" }, { status: 500 });
  }
}

// DELETE /api/admin/trades — delete a trade record
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tradeId = searchParams.get("tradeId");

    if (!tradeId) {
      return NextResponse.json({ error: "Trade ID required" }, { status: 400 });
    }

    await prisma.trade.delete({
      where: { id: tradeId },
    });

    return NextResponse.json({ success: true, message: "Trade record deleted successfully" });
  } catch (error) {
    console.error("[ADMIN DELETE TRADE ERROR]:", error);
    return NextResponse.json({ error: "Failed to delete trade" }, { status: 500 });
  }
}
