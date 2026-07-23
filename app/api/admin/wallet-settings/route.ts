import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { PAYMENT_WALLETS } from "@/lib/payment-config";

// GET /api/admin/wallet-settings — Get live wallet addresses
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

    // Try fetching custom saved wallets from system setting or environment defaults
    const wallets = {
      BTC: process.env.NEXT_PUBLIC_BTC_WALLET || PAYMENT_WALLETS.BTC,
      ETH: process.env.NEXT_PUBLIC_ETH_WALLET || PAYMENT_WALLETS.ETH,
      USDT_TRX: process.env.NEXT_PUBLIC_USDT_TRX_WALLET || PAYMENT_WALLETS.USDT_TRC20,
      BNB: process.env.NEXT_PUBLIC_BNB_WALLET || PAYMENT_WALLETS.BNB_BSC,
      XRP: process.env.NEXT_PUBLIC_XRP_WALLET || PAYMENT_WALLETS.XRP,
      DOGE: process.env.NEXT_PUBLIC_DOGE_WALLET || PAYMENT_WALLETS.DOGE,
      SOLANA: process.env.NEXT_PUBLIC_SOLANA_WALLET || PAYMENT_WALLETS.SOLANA,
    };

    return NextResponse.json({ success: true, wallets });
  } catch (error) {
    console.error("[ADMIN GET WALLETS ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch wallet settings" }, { status: 500 });
  }
}
