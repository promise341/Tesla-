import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/* ── GET /api/trade?pair=BTC/USD ─────────────────────────
   Returns all trades for the logged-in user, optionally
   filtered by pair.  Newest first.
──────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pair = searchParams.get("pair") ?? undefined;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const trades = await prisma.trade.findMany({
    where: { userId: user.id, ...(pair ? { pair } : {}) },
    orderBy: { openedAt: "desc" },
  });

  return NextResponse.json(trades);
}

/* ── POST /api/trade ─────────────────────────────────────
   Opens a new trade position and deducts the investment
   amount from the user's balance atomically.

   Body: {
     instrumentId, pair, name, category,
     side, orderType, leverage, expiration,
     entryPrice, amount,
     stopLoss?, takeProfit?
   }
──────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    instrumentId, pair, name, category,
    side, orderType = "MARKET", leverage = 1, expiration = "GTC",
    entryPrice, amount,
    stopLoss, takeProfit,
  } = body;

  // Basic validation
  if (!instrumentId || !pair || !side || !entryPrice || !amount)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  if (amount <= 0)
    return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });

  if (!["BUY", "SELL"].includes(side))
    return NextResponse.json({ error: "Side must be BUY or SELL" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, balance: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.balance < amount)
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  // Units = leveraged exposure ÷ entry price
  const units = (amount * leverage) / entryPrice;

  // Atomic: deduct balance + create trade
  const [, trade] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: amount } },
    }),
    prisma.trade.create({
      data: {
        userId:       user.id,
        instrumentId: String(instrumentId),
        pair:         String(pair),
        name:         String(name || pair),
        category:     String(category || ""),
        side:         String(side),
        orderType:    String(orderType),
        leverage:     Number(leverage),
        expiration:   String(expiration),
        entryPrice:   Number(entryPrice),
        amount:       Number(amount),
        units:        Number(units),
        stopLoss:     stopLoss  ? Number(stopLoss)  : null,
        takeProfit:   takeProfit ? Number(takeProfit) : null,
        status:       "OPEN",
      },
    }),
  ]);

  return NextResponse.json({ success: true, trade }, { status: 201 });
}
