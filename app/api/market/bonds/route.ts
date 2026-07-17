import { NextResponse } from "next/server";

/* Mock Bonds data - in production fetch from actual bond markets */
const bondsData = [
  { symbol: "US10Y", name: "US 10-Year Treasury Bond", yield: 4.25, price: 98.50, change: 0.15, rating: "AAA" },
  { symbol: "US30Y", name: "US 30-Year Treasury Bond", yield: 4.45, price: 97.80, change: 0.25, rating: "AAA" },
  { symbol: "US2Y", name: "US 2-Year Treasury Bond", yield: 5.10, price: 99.95, change: -0.05, rating: "AAA" },
  { symbol: "CORPBB", name: "Corporate BBB Bond ETF", yield: 5.85, price: 96.20, change: 0.45, rating: "BBB" },
  { symbol: "HIGHYIELD", name: "High Yield Bond ETF", yield: 7.50, price: 92.10, change: 1.05, rating: "B" },
  { symbol: "MUNICIPAL", name: "Municipal Bond ETF", yield: 3.80, price: 99.30, change: 0.20, rating: "AA" },
  { symbol: "INTLBOND", name: "International Bond ETF", yield: 3.95, price: 98.50, change: -0.10, rating: "AA" },
  { symbol: "EMERGING", name: "Emerging Market Bond ETF", yield: 6.20, price: 94.75, change: 0.85, rating: "BB" },
];

/* ── GET /api/market/bonds ──────────────────────────────
   Returns list of bonds with pricing and yield information.
──────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (symbol) {
    const data = bondsData.find((b) => b.symbol.toUpperCase() === symbol.toUpperCase());
    if (!data) {
      return NextResponse.json({ error: "Bond not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({
    success: true,
    count: bondsData.length,
    data: bondsData,
  });
}
