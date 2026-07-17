import { NextResponse } from "next/server";

// Yahoo Finance v8 chart endpoint — no key, public CORS-free via server proxy
// 30 major global stocks across US, EU, Asia
const TICKERS = [
  // US Tech & Growth
  "TSLA","AAPL","MSFT","AMZN","GOOGL","META","NVDA","AVGO","AMD","INTC",
  "ADBE","CRM","ORCL","CSCO","QCOM","TXN","MU","AMAT","LRCX","KLAC",
  // US Finance & Healthcare
  "BRK-B","JPM","BAC","WFC","GS","MS","V","MA","AXP","JNJ",
  "UNH","PFE","MRK","ABBV","LLY","TMO","ABT","DHR","BMY","AMGN",
  // US Consumer & Industrial
  "WMT","COST","TGT","HD","MCD","SBUX","NKE","PG","PEP","KO",
  "XOM","CVX","COP","SLB","NEE","DUK","SO","D","BLK","SPGI",
  // Global
  "TSM","ASML","SAP","TM","SONY","BABA","JD","NVO","SHEL","BP",
];

async function fetchQuote(ticker: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) return null;

  const price     = meta.regularMarketPrice ?? 0;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change    = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
  const changePx  = price - prevClose;

  return {
    id:       ticker,
    symbol:   ticker,
    name:     meta.longName || meta.shortName || ticker,
    pair:     `${ticker}/USD`,
    price,
    change24h: change,
    changePx,
    volume:   meta.regularMarketVolume ?? 0,
    marketCap: meta.marketCap ?? 0,
    image:    null,
    category: "Stocks",
  };
}

export async function GET() {
  try {
    const results = await Promise.allSettled(TICKERS.map(fetchQuote));
    const stocks = results
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    return NextResponse.json(stocks);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
