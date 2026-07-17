"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, RefreshCw, TrendingUp, TrendingDown, Loader2,
  AlertCircle, Coins, BarChart2, Globe, Package, Landmark, X,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Instrument {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  price: number;
  change24h: number;
  changePx: number;
  volume: number;
  marketCap: number;
  image: string | null;
  category: string;
  unit?: string;
  country?: string;
}

type Category = "All Markets" | "Cryptocurrency" | "Stocks" | "Forex" | "Commodities" | "Bonds";

const CATEGORIES: { label: Category; icon: React.ReactNode; endpoint: string }[] = [
  { label: "All Markets",   icon: <BarChart2 size={14} />, endpoint: "" },
  { label: "Cryptocurrency",icon: <Coins size={14} />,     endpoint: "/api/market/crypto" },
  { label: "Stocks",        icon: <TrendingUp size={14} />,endpoint: "/api/market/stocks" },
  { label: "Forex",         icon: <Globe size={14} />,     endpoint: "/api/market/forex" },
  { label: "Commodities",   icon: <Package size={14} />,   endpoint: "/api/market/commodities" },
  { label: "Bonds",         icon: <Landmark size={14} />,  endpoint: "/api/market/bonds" },
];

const ALL_ENDPOINTS = [
  "/api/market/crypto",
  "/api/market/stocks",
  "/api/market/forex",
  "/api/market/commodities",
  "/api/market/bonds",
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmtPrice(price: number, category: string): string {
  if (price === 0 || price == null) return "—";
  if (category === "Forex") return price.toFixed(4);
  if (price < 0.01)  return "$" + price.toFixed(6);
  if (price < 1)     return "$" + price.toFixed(4);
  if (price < 1000)  return "$" + price.toFixed(2);
  return "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtVolume(v: number): string {
  if (!v || v === 0) return "—";
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(1) + "T";
  if (v >= 1e9)  return "$" + (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6)  return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3)  return "$" + (v / 1e3).toFixed(1) + "K";
  return "$" + v.toFixed(0);
}

function SymbolAvatar({ instrument }: { instrument: Instrument }) {
  const [imgErr, setImgErr] = useState(false);

  if (instrument.image && !imgErr) {
    return (
      <img
        src={instrument.image}
        alt={instrument.symbol}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        onError={() => setImgErr(true)}
      />
    );
  }
  // Fallback initials badge
  const colorMap: Record<string, string> = {
    Cryptocurrency: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
    Stocks:         "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    Forex:          "bg-green-100 dark:bg-green-900/30 text-green-700",
    Commodities:    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700",
    Bonds:          "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  };
  const cls = colorMap[instrument.category] ?? "bg-gray-100 dark:bg-gray-700 text-gray-500";
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${cls}`}>
      {instrument.symbol.slice(0, 2)}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function TradingMarketsPage() {
  const router = useRouter();
  const [data,       setData]       = useState<Record<Category, Instrument[]>>({
    "All Markets": [], Cryptocurrency: [], Stocks: [], Forex: [], Commodities: [], Bonds: [],
  });
  const [loading,    setLoading]    = useState(true);
  const [catLoading, setCatLoading] = useState<Partial<Record<Category, boolean>>>({});
  const [error,      setError]      = useState("");
  const [activeTab,  setActiveTab]  = useState<Category>("All Markets");
  const [search,     setSearch]     = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [balance,    setBalance]    = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Fetch user balance ── */
  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
      }
    } catch {}
    finally { setBalanceLoading(false); }
  }, []);

  /* ── Fetch one category ── */
  const fetchCategory = useCallback(async (cat: Category) => {
    const cfg = CATEGORIES.find((c) => c.label === cat);
    if (!cfg || !cfg.endpoint) return;
    setCatLoading((p) => ({ ...p, [cat]: true }));
    try {
      const res = await fetch(cfg.endpoint);
      if (!res.ok) return;
      const items: Instrument[] = await res.json();
      setData((p) => ({ ...p, [cat]: Array.isArray(items) ? items : [] }));
    } catch {}
    finally { setCatLoading((p) => ({ ...p, [cat]: false })); }
  }, []);

  /* ── Fetch ALL categories in parallel ── */
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled(
        ALL_ENDPOINTS.map((ep) => fetch(ep).then((r) => r.ok ? r.json() : []))
      );
      const [crypto, stocks, forex, commodities, bonds] = results.map((r) =>
        r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []
      );
      const all = [...crypto, ...stocks, ...forex, ...commodities, ...bonds];
      setData({ "All Markets": all, Cryptocurrency: crypto, Stocks: stocks, Forex: forex, Commodities: commodities, Bonds: bonds });
      setLastUpdate(new Date());
    } catch { setError("Failed to load market data. Please refresh."); }
    finally { setLoading(false); }
  }, []);

  /* Initial load + 30s auto-refresh */
  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(() => fetchAll(true), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchAll]);

  /* When switching to a tab that has no data yet, fetch it */
  useEffect(() => {
    if (activeTab !== "All Markets" && data[activeTab].length === 0) {
      fetchCategory(activeTab);
    }
  }, [activeTab, data, fetchCategory]);

  /* ── Derived display list ── */
  const displayed = data[activeTab].filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q) || i.pair.toLowerCase().includes(q);
  });

  /* ── Total instrument count ── */
  const totalCount = data["All Markets"].length;

  return (
    <>
      <div className="space-y-5">

        {/* Header — matches screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">Trading Markets</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Choose from thousands of trading instruments across multiple asset classes
            </p>
          </div>
          {/* Right stats — matches screenshot */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-center">
              <p className="text-lg font-black text-green-500">{totalCount > 0 ? totalCount : "—"}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Instruments</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-green-500">24/7</p>
              <p className="text-[10px] text-gray-400 font-semibold">Trading</p>
            </div>
            <button onClick={() => fetchAll()} title="Refresh"
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Search + Category tabs bar — matches screenshot */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

          {/* Search row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instruments..."
                className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
            {lastUpdate && (
              <p className="text-[10px] text-gray-400 ml-auto hidden sm:block">
                Updated {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Category tab bar — matches screenshot */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-700 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.label;
              const count    = cat.label === "All Markets" ? totalCount : data[cat.label]?.length ?? 0;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveTab(cat.label)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              );
            })}
          </div>

          {/* Section header with count — matches screenshot */}
          {activeTab !== "All Markets" && (
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                {activeTab}
                {displayed.length > 0 && (
                  <span className="text-[10px] font-bold text-gray-400">({displayed.length} instruments)</span>
                )}
              </h2>
            </div>
          )}

          {/* Table header row — matches screenshot */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24H Change</span>
            <span className="text-right">Volume</span>
            <span className="text-right w-20">Action</span>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-sm text-gray-400">Loading market data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center p-8">
              <AlertCircle size={28} className="text-red-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
              <button onClick={() => fetchAll()} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors">
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center p-8">
              <BarChart2 size={28} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {search ? `No results for "${search}"` : "No instruments available"}
              </p>
              {search && <button onClick={() => setSearch("")} className="text-xs font-bold text-primary-500 hover:text-primary-600 mt-2">Clear search</button>}
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {displayed.map((inst) => {
                const isUp = inst.change24h >= 0;
                return (
                  <div key={inst.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">

                    {/* Asset — icon + name + pair */}
                    <div className="flex items-center gap-3 min-w-0">
                      <SymbolAvatar instrument={inst} />
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate">{inst.name}</p>
                        <p className="text-[10px] text-gray-400">{inst.pair}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                        {fmtPrice(inst.price, inst.category)}
                      </p>
                    </div>

                    {/* 24h Change */}
                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${isUp ? "text-green-500" : "text-red-500"}`}>
                        {isUp ? "+" : ""}{inst.change24h.toFixed(2)}%
                      </p>
                      {inst.changePx !== 0 && (
                        <p className={`text-[10px] font-semibold ${isUp ? "text-green-400" : "text-red-400"}`}>
                          {isUp ? "+" : ""}{inst.category === "Forex" ? inst.changePx.toFixed(4) : fmtPrice(Math.abs(inst.changePx), inst.category).replace("$", (isUp ? "+$" : "-$"))}
                        </p>
                      )}
                    </div>

                    {/* Volume */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                        {fmtVolume(inst.volume)}
                      </p>
                    </div>

                    {/* Trade button — navigates to full trade page */}
                    <div className="w-20">
                      <Link
                        href={`/dashboard/trade/${encodeURIComponent(inst.category + "_" + inst.id)}`}
                        className="block w-full py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-extrabold rounded-lg transition-colors shadow-sm shadow-primary-500/20 text-center"
                      >
                        Trade
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {!loading && displayed.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">
                Showing <span className="font-bold text-gray-600 dark:text-gray-300">{displayed.length}</span> instruments
                {search && <> matching <span className="font-bold">"{search}"</span></>}
              </p>
              <p className="text-[10px] text-gray-400">
                Auto-refreshes every 30s
                {lastUpdate && <> · Last update: {lastUpdate.toLocaleTimeString()}</>}
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
