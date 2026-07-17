import { NextResponse } from "next/server";

/* Mock Forex data - in production fetch from a real API like Alpha Vantage, IEX Cloud, etc. */
const forexData = [
  { pair: "EUR/USD", name: "Euro vs US Dollar", price: 1.0950, change: 0.45, volume: 350000000000 },
  { pair: "GBP/USD", name: "British Pound vs US Dollar", price: 1.2680, change: -0.32, volume: 280000000000 },
  { pair: "USD/JPY", name: "US Dollar vs Japanese Yen", price: 149.85, change: 1.20, volume: 250000000000 },
  { pair: "USD/CHF", name: "US Dollar vs Swiss Franc", price: 0.8960, change: 0.15, volume: 180000000000 },
  { pair: "AUD/USD", name: "Australian Dollar vs US Dollar", price: 0.6620, change: -0.55, volume: 150000000000 },
  { pair: "USD/CAD", name: "US Dollar vs Canadian Dollar", price: 1.3650, change: 0.28, volume: 200000000000 },
  { pair: "NZD/USD", name: "New Zealand Dollar vs US Dollar", price: 0.6180, change: -0.22, volume: 80000000000 },
  { pair: "USD/CNY", name: "US Dollar vs Chinese Yuan", price: 7.0850, change: 0.10, volume: 120000000000 },
];

/* ── GET /api/market/forex ──────────────────────────────
   Returns list of Forex pairs with live pricing.
──────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pair = searchParams.get("pair");

  if (pair) {
    const data = forexData.find((f) => f.pair.toUpperCase() === pair.toUpperCase());
    if (!data) {
      return NextResponse.json({ error: "Pair not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({
    success: true,
    count: forexData.length,
    data: forexData,
  });
}
