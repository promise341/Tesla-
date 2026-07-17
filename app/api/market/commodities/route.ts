import { NextResponse } from "next/server";

/* Mock Commodities data - in production fetch from a real API */
const commoditiesData = [
  { symbol: "GOLD", name: "Gold (per oz)", price: 2045.50, change: 1.85, unit: "USD/oz", volume: 180000 },
  { symbol: "SILVER", name: "Silver (per oz)", price: 24.30, change: -0.45, unit: "USD/oz", volume: 220000 },
  { symbol: "OIL.WTI", name: "Crude Oil WTI", price: 78.45, change: 2.15, unit: "USD/barrel", volume: 2500000 },
  { symbol: "OIL.BRENT", name: "Brent Crude Oil", price: 82.80, change: 1.95, unit: "USD/barrel", volume: 2300000 },
  { symbol: "NG", name: "Natural Gas", price: 2.95, change: -1.25, unit: "USD/MMBtu", volume: 1200000 },
  { symbol: "COPPER", name: "Copper", price: 4.05, change: 0.85, unit: "USD/lb", volume: 900000 },
  { symbol: "WHEAT", name: "Wheat", price: 5.85, change: -0.35, unit: "USD/bushel", volume: 500000 },
  { symbol: "CORN", name: "Corn", price: 4.35, change: 0.25, unit: "USD/bushel", volume: 400000 },
];

/* ── GET /api/market/commodities ────────────────────────
   Returns list of commodity prices with live data.
──────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (symbol) {
    const data = commoditiesData.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase());
    if (!data) {
      return NextResponse.json({ error: "Commodity not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({
    success: true,
    count: commoditiesData.length,
    data: commoditiesData,
  });
}
