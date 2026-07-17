import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/* ── PATCH /api/trade/[id]/close ─────────────────────────
   Closes an open trade.  Calculates realized P&L from
   the live close price provided by the client (which
   fetches it from our /api/market/* proxy routes).

   Body: { closePrice: number }

   P&L formula:
     BUY  → pnl = (closePrice - entryPrice) × units × leverage
     SELL → pnl = (entryPrice - closePrice) × units × leverage

   Credits: amount + pnl back to balance (loss floors at -amount).
──────────────────────────────────────────────────────── */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { closePrice } = await req.json();
  if (!closePrice || closePrice <= 0)
    return NextResponse.json({ error: "Valid close price required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const trade = await prisma.trade.findUnique({ where: { id: params.id } });

  if (!trade)
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });

  if (trade.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (trade.status === "CLOSED")
    return NextResponse.json({ error: "Trade is already closed" }, { status: 400 });

  // Calculate P&L
  let rawPnl: number;
  if (trade.side === "BUY") {
    rawPnl = (closePrice - trade.entryPrice) * trade.units;
  } else {
    rawPnl = (trade.entryPrice - closePrice) * trade.units;
  }

  // Floor loss at the invested amount (can't lose more than you put in)
  const pnl    = Math.max(rawPnl, -trade.amount);
  const pnlPct = (pnl / trade.amount) * 100;

  // Credit back: original amount + profit (or minus loss)
  const credit = trade.amount + pnl;

  const [updatedTrade] = await prisma.$transaction([
    prisma.trade.update({
      where: { id: trade.id },
      data: {
        status:    "CLOSED",
        closePrice: Number(closePrice),
        pnl,
        pnlPct,
        closedAt:  new Date(),
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        balance:     { increment: credit },
        totalProfit: pnl > 0 ? { increment: pnl } : undefined,
      },
    }),
  ]);

  return NextResponse.json({ success: true, trade: updatedTrade, pnl, pnlPct });
}
