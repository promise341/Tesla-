import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

// Expected daily ROI mapping (dailyPctMid)
const BOT_RATES: Record<string, number> = {
  "ForexMaster Pro":       1.65,
  "ScalpMaster Quick":     2.5,
  "FX Trend Rider":        1.9,
  "NewsTrader FX":         1.55,
  "Grid Profit FX":        1.3,
  "CarryTrade Bot":        1.05,
  "DualMA Forex":          1.4,
  "CryptoGain Elite":      2.85,
  "AlgoTrader Supreme":    4.45,
  "DeFi Yield Hunter":     3.5,
  "BTCUSDT":               1.75,
  "AltCoin Surfer":        3.25,
  "ETH Gas Optimizer":     2.25,
  "Memecoin Sniper":       5.25,
  "Crypto Rebalancer":     1.5,
  "StockTrader AI":        1.25,
  "Tesla TSLA Bot":        1.2,
  "Tech Sector Titan":     1.4,
  "Dividend Growth Bot":   0.8,
  "Small Cap Hunter":      2.6,
  "Momentum Breakout":     1.85,
  "GoldRush Bot":          1.75,
  "Energy Trader Pro":     1.65,
  "Agri Bot":              1.2,
  "Metals & Mining AI":    1.75,
  "IndexMaster Pro":       1.4,
  "Index Arbitrage Bot":   1.65,
  "VIX Volatility Bot":    2.5,
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { botName, amount, autoReinvest } = body;

  if (!botName || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "Invalid bot or amount" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, balance: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (Number(amount) > user.balance) {
    return NextResponse.json(
      { error: `Insufficient balance. Your balance is $${user.balance.toFixed(2)}` },
      { status: 400 }
    );
  }

  const rate = BOT_RATES[botName] ?? 1.7;

  // Deduct balance + create active plan + log transaction atomically
  const [activePlan] = await prisma.$transaction([
    prisma.activePlan.create({
      data: {
        userId: user.id,
        planName: `BOT: ${botName}`,
        capital: Number(amount),
        rate,
        status: "ACTIVE",
        category: "bot",
        paymentMethod: autoReinvest ? "BALANCE_REINVEST" : "BALANCE",
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: Number(amount) } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "BOT_INVESTMENT",
        amount: Number(amount),
        method: "BALANCE",
        address: botName,
        status: "COMPLETED",
      },
    }),
  ]);

  return NextResponse.json({ success: true, activePlan }, { status: 201 });
}
