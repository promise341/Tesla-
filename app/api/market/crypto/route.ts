import { NextResponse } from "next/server";

// 62 top coins by market cap — CoinGecko keyless public API
export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets" +
        "?vs_currency=usd" +
        "&order=market_cap_desc" +
        "&per_page=62" +
        "&page=1" +
        "&sparkline=false" +
        "&price_change_percentage=24h",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 }, // cache for 30s
      }
    );

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();

    const coins = data.map((c: any) => ({
      id:       c.id,
      symbol:   c.symbol.toUpperCase(),
      name:     c.name,
      pair:     `${c.symbol.toUpperCase()}/USD`,
      price:    c.current_price,
      change24h: c.price_change_percentage_24h ?? 0,
      changePx: c.price_change_24h ?? 0,
      volume:   c.total_volume,
      marketCap: c.market_cap,
      image:    c.image,
      category: "Cryptocurrency",
    }));

    return NextResponse.json(coins);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
