"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Loader2,
  AlertCircle, CheckCircle2, X, BarChart2, Zap, Shield,
  Target, Activity, ChevronDown, Download, Wallet, Crown, Beaker,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface Instrument {
  id: string; symbol: string; name: string; pair: string;
  price: number; change24h: number; changePx: number;
  volume: number; marketCap: number; image: string | null; category: string;
}
interface Trade {
  id: string; pair: string; name: string; side: "BUY" | "SELL";
  orderType: string; leverage: number; expiration: string;
  entryPrice: number; amount: number; units: number;
  stopLoss: number | null; takeProfit: number | null;
  status: "OPEN" | "CLOSED"; closePrice: number | null;
  pnl: number | null; pnlPct: number | null;
  openedAt: string; closedAt: string | null;
}

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function fmtPrice(price: number, category: string) {
  if (!price) return "—";
  if (category === "Forex") return price.toFixed(4);
  if (price < 0.01)  return "$" + price.toFixed(6);
  if (price < 1)     return "$" + price.toFixed(4);
  return "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtVolume(v: number) {
  if (!v) return "—";
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9)  return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6)  return "$" + (v / 1e6).toFixed(2) + "M";
  return "$" + v.toLocaleString();
}
function fmtPnl(pnl: number) {
  return (pnl >= 0 ? "+" : "") + "$" + Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function livePnl(trade: Trade, price: number) {
  const raw = trade.side === "BUY"
    ? (price - trade.entryPrice) * trade.units
    : (trade.entryPrice - price) * trade.units;
  const pnl = Math.max(raw, -trade.amount);
  return { pnl, pnlPct: (pnl / trade.amount) * 100 };
}
function decodeParam(raw: string): { instrumentId: string; categoryHint: string } {
  const decoded = decodeURIComponent(raw);
  const first = decoded.indexOf("_");
  if (first > 0) {
    const cat = decoded.slice(0, first);
    const id  = decoded.slice(first + 1);
    if (["Cryptocurrency","Stocks","Forex","Commodities","Bonds"].includes(cat))
      return { instrumentId: id, categoryHint: cat };
  }
  return { instrumentId: decoded, categoryHint: "" };
}
async function fetchHighLow(inst: Instrument): Promise<{ high24h: number; low24h: number }> {
  try {
    if (inst.category === "Cryptocurrency") {
      const r = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${inst.id}`);
      if (r.ok) { const d = await r.json(); if (d?.[0]) return { high24h: d[0].high_24h ?? 0, low24h: d[0].low_24h ?? 0 }; }
    } else {
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(inst.id)}?interval=1d&range=1d`, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (r.ok) { const j = await r.json(); const m = j?.chart?.result?.[0]?.meta; if (m) return { high24h: m.regularMarketDayHigh ?? 0, low24h: m.regularMarketDayLow ?? 0 }; }
    }
  } catch {}
  return { high24h: 0, low24h: 0 };
}

/* ─────────────────────────────────────────────────────────
   TradingView Chart
───────────────────────────────────────────────────────── */
function TradingViewChart({ pair, category }: { pair: string; category: string }) {
  function tvSymbol() {
    if (category === "Cryptocurrency") {
      const left = pair.split("/")[0];
      const map: Record<string,string> = { BTC:"CRYPTOCAP:BTC", ETH:"CRYPTOCAP:ETH", BNB:"BINANCE:BNBUSDT", SOL:"BINANCE:SOLUSDT", XRP:"BINANCE:XRPUSDT", DOGE:"BINANCE:DOGEUSDT", ADA:"BINANCE:ADAUSDT", AVAX:"BINANCE:AVAXUSDT", DOT:"BINANCE:DOTUSDT", LTC:"BINANCE:LTCUSDT", LINK:"BINANCE:LINKUSDT", UNI:"BINANCE:UNIUSDT" };
      return map[left] ?? `BINANCE:${left}USDT`;
    }
    if (category === "Forex") return `FX:${pair.replace("/","")}`;
    if (category === "Commodities") {
      const left = pair.split("/")[0];
      const m: Record<string,string> = { XAU:"TVC:GOLD", XAG:"TVC:SILVER", WTI:"TVC:USOIL", BRENT:"TVC:UKOIL", XPT:"TVC:PLATINUM", XPD:"TVC:PALLADIUM" };
      return m[left] ?? `OANDA:${pair.replace("/","")}`;
    }
    if (category === "Stocks") {
      const t = pair.split("/")[0];
      const nyse = ["JPM","BAC","WFC","GS","MS","V","MA","AXP","JNJ","UNH","PFE","MRK","ABBV","XOM","CVX","COP","WMT","HD","MCD","NKE","PG","PEP","KO","BRK-B","NEE","BLK","SPGI","TMO","ABT","DHR","BMY","AMGN","COST","TSM","SAP","TM","SONY","BABA","NVO","SHEL","BP"];
      return nyse.includes(t) ? `NYSE:${t}` : `NASDAQ:${t}`;
    }
    const m: Record<string,string> = { US10Y:"TVC:US10Y", US30Y:"TVC:US30Y", US5Y:"TVC:US05Y", US3M:"TVC:US03MY", FTSE:"TVC:UKX", DAX:"TVC:DEX", CAC40:"TVC:CAC40", N225:"TVC:NI225", HSI:"TVC:HSI", SENSEX:"BSE:SENSEX", STOXX50:"TVC:SX5E" };
    return m[pair.split("/")[0]] ?? `TVC:${pair.split("/")[0]}`;
  }
  const src = "https://www.tradingview.com/widgetembed/?frameElementId=tv_chart"
    + `&symbol=${encodeURIComponent(tvSymbol())}&interval=D&range=12M`
    + "&theme=dark&style=1&locale=en&toolbar_bg=%230f0f0f"
    + "&withdateranges=true&hide_side_toolbar=false&allow_symbol_change=false"
    + "&save_image=false&show_popup_button=true";
  return (
    <div style={{ height: 550, background: "#0f0f0f" }} className="rounded-b-2xl overflow-hidden">
      <iframe id="tv_chart" src={src} style={{ width:"100%", height:"100%", border:"none" }} allowFullScreen loading="lazy" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const LEVERAGE_OPTIONS  = [1, 2, 5, 10, 25, 50, 100];
const ORDER_TYPES       = ["Market Order", "Limit Order", "Stop Order"];
const EXPIRATION_OPTIONS= ["3 Minute", "5 Minutes", "15 Minutes", "30 Minutes", "1 Hour", "4 Hours", "1 Day", "2 Days", "7 Days"];

/* ─────────────────────────────────────────────────────────
   Confirm Trade Modal
───────────────────────────────────────────────────────── */
function ConfirmTradeModal({ inst, side, orderType, leverage, expiration, amount, units, exposure, sl, tp, balance, loading, onConfirm, onCancel }: {
  inst: Instrument; side: "BUY"|"SELL"; orderType: string; leverage: number;
  expiration: string; amount: number; units: number; exposure: number;
  sl: number; tp: number; balance: number; loading: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  const isBuy = side === "BUY";
  const fmt = (n: number) => "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rows = [
    { label: "Direction",     val: side,                 hl: true  },
    { label: "Order Type",    val: orderType,            hl: false },
    { label: "Market Price",  val: fmtPrice(inst.price, inst.category), hl: false },
    { label: "Investment",    val: fmt(amount),          hl: false },
    { label: "Units",         val: units.toFixed(6),     hl: false },
    { label: "Leverage",      val: `${leverage}x`,       hl: leverage > 1 },
    ...(leverage > 1 ? [{ label: "Total Exposure", val: fmt(exposure), hl: false }] : []),
    ...(sl > 0 ? [{ label: "Stop Loss",   val: fmtPrice(sl, inst.category), hl: false }] : []),
    ...(tp > 0 ? [{ label: "Take Profit", val: fmtPrice(tp, inst.category), hl: false }] : []),
    { label: "Expiry",        val: expiration,      hl: false },
    { label: "Balance After", val: fmt(balance - amount), hl: false },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onCancel : undefined} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${isBuy ? "bg-green-500" : "bg-red-500"}`}>
          <div className="flex items-center gap-3">
            {inst.image
              ? <img src={inst.image} alt={inst.symbol} className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
              : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-xs">{inst.symbol.slice(0,2)}</div>}
            <div>
              <h3 className="font-extrabold text-white text-base">Confirm {side} Order</h3>
              <p className="text-white/80 text-xs">{inst.pair} · {orderType}</p>
            </div>
          </div>
          <button onClick={onCancel} disabled={loading} className="text-white/70 hover:text-white"><X size={18}/></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Price highlight */}
          <div className={`rounded-xl p-4 text-center ${isBuy ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
            <p className="text-xs text-gray-400 mb-1">You are placing a {side} at</p>
            <p className={`text-2xl font-black ${isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{fmtPrice(inst.price, inst.category)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{inst.pair}</p>
          </div>
          {/* Rows */}
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map(r => (
              <div key={r.label} className="flex justify-between items-center py-2 text-sm">
                <span className="text-gray-400 text-xs">{r.label}</span>
                <span className={`font-extrabold text-xs ${r.hl ? (isBuy ? "text-green-500" : "text-red-500") : "text-gray-900 dark:text-white"}`}>{r.val}</span>
              </div>
            ))}
          </div>
          {/* High leverage warning */}
          {leverage >= 25 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <AlertCircle size={14} className="text-orange-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-orange-700 dark:text-orange-400 font-semibold leading-relaxed">
                {leverage}x leverage significantly amplifies both gains and losses. Only trade with funds you can afford to lose.
              </p>
            </div>
          )}
          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-extrabold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className={`flex-1 py-3 text-white font-extrabold text-sm rounded-xl transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 ${isBuy ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
              {loading ? <><Loader2 size={14} className="animate-spin"/> Processing...</> : `✓ Confirm ${side}`}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            ${amount.toLocaleString(undefined,{minimumFractionDigits:2})} will be deducted from your balance immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Place Order Panel
───────────────────────────────────────────────────────── */
function PlaceOrderPanel({ instrument, balance, onTradeOpened, vipTier }: { instrument: Instrument; balance: number; onTradeOpened: () => void; vipTier?: string }) {
  const [side,        setSide]        = useState<"BUY"|"SELL">("BUY");
  const [orderType,   setOrderType]   = useState("Market Order");
  const [leverage,    setLeverage]    = useState(1);
  const [expiration,  setExpiration]  = useState("15 Minutes");
  const [amount,      setAmount]      = useState("");
  const [stopLoss,    setStopLoss]    = useState("");
  const [takeProfit,  setTakeProfit]  = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [fieldErr,    setFieldErr]    = useState("");
  const [demoMode,    setDemoMode]    = useState(false);

  // Demo balance — virtual $10,000 sandbox
  const DEMO_BALANCE = 10000;
  const effectiveBalance = demoMode ? DEMO_BALANCE : balance;

  const numAmt  = parseFloat(amount)    || 0;
  const numSL   = parseFloat(stopLoss)  || 0;
  const numTP   = parseFloat(takeProfit)|| 0;
  const units   = instrument.price > 0 ? (numAmt * leverage) / instrument.price : 0;
  const exposure= numAmt * leverage;
  const isBuy   = side === "BUY";
  const insufficientBalance = !demoMode && numAmt > 0 && numAmt > balance;

  // VIP tier commission badge
  const vipLabel = (() => {
    const t = (vipTier || "").toLowerCase();
    if (t.includes("elite") || t.includes("black") || t.includes("diamond")) return { label: "0% Commission (Prestige)", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" };
    if (t.includes("platinum")) return { label: "0.1% Commission (Platinum)", color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-950/20" };
    if (t.includes("gold"))     return { label: "0.2% Commission (Gold)", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" };
    if (t.includes("silver"))   return { label: "0.3% Commission (Silver)", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" };
    return null;
  })();

  function applyQuick(pct: number) {
    setAmount((pct === 100 ? effectiveBalance : (effectiveBalance * pct) / 100).toFixed(2));
    setFieldErr("");
  }

  function handleOpenConfirm() {
    setFieldErr("");
    if (numAmt <= 0)         { const m = "Enter a valid investment amount.";        setFieldErr(m); toast.error(m, {id:"v"}); return; }
    if (numAmt < 1)          { const m = "Minimum trade amount is $1.";             setFieldErr(m); toast.error(m, {id:"v"}); return; }
    if (numAmt > effectiveBalance) { const m = `Insufficient balance — you have $${effectiveBalance.toFixed(2)}.`; setFieldErr(m); toast.error(m, {id:"v"}); return; }
    if (numSL > 0 && isBuy  && numSL >= instrument.price) { const m = "Stop Loss must be BELOW current price for a BUY."; setFieldErr(m); toast.error(m, {id:"v"}); return; }
    if (numSL > 0 && !isBuy && numSL <= instrument.price) { const m = "Stop Loss must be ABOVE current price for a SELL."; setFieldErr(m); toast.error(m, {id:"v"}); return; }
    if (numTP > 0 && isBuy  && numTP <= instrument.price) { const m = "Take Profit must be ABOVE current price for a BUY."; setFieldErr(m); toast.error(m, {id:"v"}); return; }
    if (numTP > 0 && !isBuy && numTP >= instrument.price) { const m = "Take Profit must be BELOW current price for a SELL."; setFieldErr(m); toast.error(m, {id:"v"}); return; }
    setShowConfirm(true);
  }

  async function handleConfirm() {
    if (demoMode) {
      // Demo mode — simulate without hitting API
      toast.success(`[DEMO] ${side} order simulated! ${units.toFixed(4)} ${instrument.symbol} @ ${fmtPrice(instrument.price, instrument.category)}`, { duration: 5000 });
      setAmount(""); setStopLoss(""); setTakeProfit(""); setLeverage(1); setShowConfirm(false);
      return;
    }
    setLoading(true);
    const tid = toast.loading(`Placing ${side} order for ${instrument.pair}…`);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrumentId: instrument.id, pair: instrument.pair, name: instrument.name,
          category: instrument.category, side,
          orderType: orderType.split(" ")[0].toUpperCase(),
          leverage, expiration: expiration,
          entryPrice: instrument.price, amount: numAmt,
          stopLoss: numSL > 0 ? numSL : null,
          takeProfit: numTP > 0 ? numTP : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Trade failed.", {id:tid}); setLoading(false); return; }
      toast.success(
        `${side} order placed! ${units.toFixed(4)} ${instrument.symbol} @ ${fmtPrice(instrument.price, instrument.category)}`,
        { id: tid, duration: 5000 }
      );
      // Broadcast balance update to header
      window.dispatchEvent(new CustomEvent("balance-updated"));
      setAmount(""); setStopLoss(""); setTakeProfit(""); setLeverage(1); setShowConfirm(false);
      onTradeOpened();
    } catch { toast.error("Network error. Please try again.", {id:tid}); }
    finally { setLoading(false); }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmTradeModal
          inst={instrument} side={side} orderType={orderType} leverage={leverage}
          expiration={expiration} amount={numAmt} units={units} exposure={exposure}
          sl={numSL} tp={numTP} balance={effectiveBalance} loading={loading}
          onConfirm={handleConfirm}
          onCancel={() => { if (!loading) setShowConfirm(false); }}
        />
      )}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-gray-900 dark:text-white">Place Order</h2>
              {demoMode && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Beaker size={8}/> DEMO
                </span>
              )}
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${isBuy ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-500"}`}>
              {instrument.pair}
            </span>
          </div>
          {/* VIP commission badge */}
          {vipLabel && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold ${vipLabel.bg} ${vipLabel.color} mb-1`}>
              <Crown size={10}/> {vipLabel.label}
            </div>
          )}
          {/* Demo mode toggle */}
          <button
            onClick={() => { setDemoMode(d => !d); setAmount(""); setFieldErr(""); }}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
              demoMode
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-400 hover:text-blue-500"
            }`}
          >
            <Beaker size={11}/> {demoMode ? "Exit Demo Mode" : "Try Demo Mode (Virtual $10,000)"}
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Buy / Sell toggle */}
          <div className="grid grid-cols-2 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <button onClick={() => { setSide("BUY"); setFieldErr(""); }}
              className={`py-3 text-sm font-extrabold transition-colors ${isBuy ? "bg-green-500 text-white" : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              ▲ Buy
            </button>
            <button onClick={() => { setSide("SELL"); setFieldErr(""); }}
              className={`py-3 text-sm font-extrabold transition-colors ${!isBuy ? "bg-red-500 text-white" : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              ▼ Sell
            </button>
          </div>
          {/* Order Type */}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Order Type</label>
            <div className="relative">
              <select value={orderType} onChange={e => setOrderType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer">
                {ORDER_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>
          {/* Leverage */}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block flex items-center gap-1">
              Leverage <Zap size={10} className="text-yellow-500"/>
            </label>
            <div className="relative">
              <select value={leverage} onChange={e => setLeverage(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer">
                {LEVERAGE_OPTIONS.map(l => <option key={l} value={l}>{l}x{l===1?" (No Leverage)":l>=50?" ⚠ High Risk":""}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
            {leverage > 10 && <p className="text-[10px] text-orange-500 font-semibold mt-1 flex items-center gap-1"><AlertCircle size={9}/> High leverage amplifies profits and losses</p>}
          </div>
          {/* Expiration */}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Expiration</label>
            <div className="relative">
              <select value={expiration} onChange={e => setExpiration(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer">
                {EXPIRATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>
          {/* Price */}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Price ($)</label>
            <div className="px-3 py-2.5 text-sm font-extrabold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl flex justify-between">
              <span>{instrument.price.toFixed(instrument.category==="Forex"?4:2)}</span>
              <span className="text-[10px] text-gray-400 font-semibold">Market</span>
            </div>
          </div>
          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Investment Amount ($)</label>
            <div className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 transition-colors ${fieldErr ? "border-red-400" : "border-gray-200 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500"}`}>
              <span className="text-gray-400 font-bold text-sm">$</span>
              <input type="number" min="1" step="any" value={amount}
                onChange={e => { setAmount(e.target.value); setFieldErr(""); }}
                placeholder="0.00"
                className="flex-1 bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none"/>
            </div>
            {numAmt > 0 && instrument.price > 0 && (
              <p className="text-[10px] text-gray-400 mt-1">
                ≈ {units.toFixed(6)} {instrument.symbol} units
                {leverage > 1 && <span className="ml-1 text-orange-500">(exposure: ${exposure.toLocaleString(undefined,{minimumFractionDigits:2})})</span>}
              </p>
            )}
          </div>
          {/* SL / TP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block flex items-center gap-1"><Shield size={9}/> Stop Loss</label>
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-red-400">
                <span className="text-gray-400 text-xs">$</span>
                <input type="number" min="0" step="any" value={stopLoss} onChange={e => { setStopLoss(e.target.value); setFieldErr(""); }} placeholder="Optional" className="flex-1 bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block flex items-center gap-1"><Target size={9}/> Take Profit</label>
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-green-400">
                <span className="text-gray-400 text-xs">$</span>
                <input type="number" min="0" step="any" value={takeProfit} onChange={e => { setTakeProfit(e.target.value); setFieldErr(""); }} placeholder="Optional" className="flex-1 bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none"/>
              </div>
            </div>
          </div>
          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 space-y-1.5">
            {[
              { label: "Investment Amount", value: numAmt > 0 ? "$"+numAmt.toLocaleString(undefined,{minimumFractionDigits:2}) : "$0.00" },
              { label: "Units",             value: numAmt > 0 ? units.toFixed(6) : "0" },
              { label: demoMode ? "Demo Balance" : "Available Balance", value: (demoMode ? "🎮 $" : "$")+effectiveBalance.toLocaleString(undefined,{minimumFractionDigits:2}) },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-gray-400">{r.label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Insufficient balance — Deposit shortcut */}
          {insufficientBalance && (
            <Link
              href="/dashboard/wallet?tab=deposit"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl transition-colors shadow-md shadow-orange-500/20"
            >
              <Wallet size={13}/> Insufficient Balance — Deposit Funds
            </Link>
          )}

          {/* Field error */}
          {fieldErr && !insufficientBalance && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 font-semibold">
              <AlertCircle size={12} className="flex-shrink-0"/> {fieldErr}
            </div>
          )}
          {/* Main button */}
          <button onClick={handleOpenConfirm} disabled={numAmt <= 0 || insufficientBalance}
            className={`w-full flex items-center justify-center gap-2 py-3.5 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${isBuy ? "bg-green-500 hover:bg-green-600 shadow-green-500/30" : "bg-red-500 hover:bg-red-600 shadow-red-500/30"}`}>
            {isBuy ? "▲" : "▼"} {side} {instrument.pair}
          </button>
          {/* Quick amounts */}
          <div>
            <p className="text-[10px] text-gray-400 mb-2 font-semibold">Quick amounts:</p>
            <div className="grid grid-cols-4 gap-2">
              {[25,50,75,100].map(pct => (
                <button key={pct} onClick={() => applyQuick(pct)}
                  className="py-1.5 text-xs font-bold border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                  {pct===100?"Max":`${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Close Trade Modal
───────────────────────────────────────────────────────── */
function CloseTradeModal({ trade, price, category, onClose, onClosed }: { trade: Trade; price: number; category: string; onClose: () => void; onClosed: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const { pnl, pnlPct } = livePnl(trade, price);
  const isProfit = pnl >= 0;
  async function close() {
    setLoading(true);
    const tid = toast.loading("Closing trade…");
    try {
      const res = await fetch(`/api/trade/${trade.id}/close`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ closePrice: price }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to close trade.", {id:tid}); return; }
      toast.success(`Trade closed! P&L: ${fmtPnl(data.pnl)} (${data.pnlPct >= 0 ? "+" : ""}${data.pnlPct.toFixed(2)}%)`, { id:tid, duration:5000 });
      onClosed(trade.id);
    } catch { toast.error("Network error.", {id:tid}); }
    finally { setLoading(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={16}/></button>
        <h3 className="font-extrabold text-gray-900 dark:text-white mb-4">Close Trade</h3>
        <div className="space-y-2 mb-5">
          {[
            { label:"Pair",       val: trade.pair },
            { label:"Side",       val: trade.side, cls: trade.side==="BUY"?"text-green-500 font-black":"text-red-500 font-black" },
            { label:"Entry",      val: fmtPrice(trade.entryPrice, category) },
            { label:"Close Price",val: fmtPrice(price, category) },
            { label:"Units",      val: trade.units.toFixed(6) },
            { label:"Realized P&L", val: fmtPnl(pnl)+" ("+(pnlPct>=0?"+":"")+pnlPct.toFixed(2)+"%)", cls: isProfit?"text-green-500 font-black":"text-red-500 font-black" },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-gray-400">{r.label}</span>
              <span className={r.cls ?? "font-bold text-gray-900 dark:text-white"}>{r.val}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={close} disabled={loading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={13} className="animate-spin"/> Closing…</> : "Close Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Trade Rows
───────────────────────────────────────────────────────── */
function OpenTradeRow({ trade, price, category, onClose }: { trade: Trade; price: number; category: string; onClose: (t: Trade) => void }) {
  const { pnl, pnlPct } = livePnl(trade, price);
  const isProfit = pnl >= 0;
  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
      <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${trade.side==="BUY"?"bg-green-100 dark:bg-green-900/30 text-green-600":"bg-red-100 dark:bg-red-900/30 text-red-500"}`}>{trade.side}</span>
      <div><p className="font-bold text-gray-900 dark:text-white">${trade.amount.toLocaleString(undefined,{minimumFractionDigits:2})}</p><p className="text-[10px] text-gray-400">{trade.units.toFixed(6)} units</p></div>
      <div><p className="text-gray-400 text-xs">Entry</p><p className="font-bold text-gray-900 dark:text-white">{fmtPrice(trade.entryPrice, category)}</p></div>
      <div><p className={`font-extrabold ${isProfit?"text-green-500":"text-red-500"}`}>{fmtPnl(pnl)}</p><p className={`text-[10px] font-semibold ${isProfit?"text-green-400":"text-red-400"}`}>{pnlPct>=0?"+":""}{pnlPct.toFixed(2)}%</p></div>
      <div><p className="text-xs font-bold text-gray-600 dark:text-gray-400">{trade.leverage}x</p><p className="text-[10px] text-gray-400">{new Date(trade.openedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p></div>
      <button onClick={() => onClose(trade)} className="px-3 py-1.5 text-xs font-extrabold bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-500 border border-red-200 dark:border-red-800 rounded-lg transition-colors">Close</button>
    </div>
  );
}
function ClosedTradeRow({ trade, category }: { trade: Trade; category: string }) {
  const isProfit = (trade.pnl ?? 0) >= 0;
  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-3 items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
      <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${trade.side==="BUY"?"bg-green-100 dark:bg-green-900/30 text-green-600":"bg-red-100 dark:bg-red-900/30 text-red-500"}`}>{trade.side}</span>
      <div><p className="font-bold text-gray-900 dark:text-white">${trade.amount.toLocaleString(undefined,{minimumFractionDigits:2})}</p><p className="text-[10px] text-gray-400">{trade.units.toFixed(6)} units</p></div>
      <div><p className="text-gray-400 text-xs">Entry</p><p className="font-bold text-gray-900 dark:text-white">{fmtPrice(trade.entryPrice, category)}</p></div>
      <div><p className="text-gray-400 text-xs">Close</p><p className="font-bold text-gray-900 dark:text-white">{trade.closePrice ? fmtPrice(trade.closePrice, category) : "—"}</p></div>
      <div><p className={`font-extrabold ${isProfit?"text-green-500":"text-red-500"}`}>{trade.pnl!==null?fmtPnl(trade.pnl):"—"}</p><p className={`text-[10px] font-semibold ${isProfit?"text-green-400":"text-red-400"}`}>{trade.pnlPct!==null?(trade.pnlPct>=0?"+":"")+trade.pnlPct.toFixed(2)+"%":""}</p></div>
      <div><p className="text-[10px] text-gray-400">{trade.closedAt?new Date(trade.closedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}</p></div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function TradePage() {
  const params = useParams();
  const router = useRouter();
  const rawId  = (params?.id as string) ?? "";
  const { instrumentId, categoryHint } = decodeParam(rawId);

  const [instrument,  setInstrument]  = useState<Instrument | null>(null);
  const [high24h,     setHigh24h]     = useState(0);
  const [low24h,      setLow24h]      = useState(0);
  const [balance,     setBalance]     = useState(0);
  const [trades,      setTrades]      = useState<Trade[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState<"open"|"closed">("open");
  const [closeTarget, setCloseTarget] = useState<Trade | null>(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [vipTier,     setVipTier]     = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInstrument = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const order = ["Cryptocurrency","Stocks","Forex","Commodities","Bonds"];
      const eps: Record<string,string> = { Cryptocurrency:"/api/market/crypto", Stocks:"/api/market/stocks", Forex:"/api/market/forex", Commodities:"/api/market/commodities", Bonds:"/api/market/bonds" };
      const endpoints = categoryHint ? [eps[categoryHint], ...Object.values(eps).filter(e => e!==eps[categoryHint])] : Object.values(eps);
      for (const ep of endpoints) {
        const res = await fetch(ep); if (!res.ok) continue;
        const data: Instrument[] = await res.json();
        const found = data.find((i:any) =>
          i.id === instrumentId ||
          i.id === instrumentId.replace("/","") ||
          i.symbol?.toLowerCase() === instrumentId.toLowerCase() ||
          i.pair?.toLowerCase() === instrumentId.toLowerCase() ||
          i.pair?.toLowerCase().replace("/","") === instrumentId.toLowerCase().replace("/","")
        );
        if (found) {
          setInstrument(found);
          fetchHighLow(found).then(r => { setHigh24h(r.high24h); setLow24h(r.low24h); });
          if (silent) {
            setTrades(prev => {
              const open = prev.filter(t => t.status === "OPEN");
              if (open.length > 0) {
                for (const t of open) {
                  let hit = false;
                  if (t.side==="BUY" && t.stopLoss && found.price <= t.stopLoss) hit = true;
                  if (t.side==="BUY" && t.takeProfit && found.price >= t.takeProfit) hit = true;
                  if (t.side==="SELL" && t.stopLoss && found.price >= t.stopLoss) hit = true;
                  if (t.side==="SELL" && t.takeProfit && found.price <= t.takeProfit) hit = true;
                  if (hit) {
                    const label = (t.takeProfit && ((t.side==="BUY"&&found.price>=t.takeProfit)||(t.side==="SELL"&&found.price<=t.takeProfit))) ? "Take Profit" : "Stop Loss";
                    fetch(`/api/trade/${t.id}/close`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({closePrice:found.price}) })
                      .then(r => r.json()).then(d => { if (d.success) toast.success(`${label} triggered on ${t.pair}! P&L: ${fmtPnl(d.pnl)}`, {duration:6000}); fetchTrades(); });
                  }
                }
              }
              return prev;
            });
          }
          break;
        }
      }
    } catch { if (!silent) setError("Failed to load instrument."); }
    finally { setLoading(false); setRefreshing(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrumentId, categoryHint]);

  const fetchBalance = useCallback(async () => {
    try {
      const r = await fetch("/api/user/me");
      if (r.ok) {
        const d = await r.json();
        if (d?.balance !== undefined) setBalance(Number(d.balance));
        if (d?.vipMembership?.cardName) setVipTier(d.vipMembership.cardName);
      }
    } catch {}
  }, []);

  const fetchTrades = useCallback(async () => {
    if (!instrument) return;
    try { const r = await fetch(`/api/trade?pair=${encodeURIComponent(instrument.pair)}`); if (r.ok) { const d = await r.json(); setTrades(Array.isArray(d)?d:[]); } } catch {}
  }, [instrument]);

  useEffect(() => { fetchInstrument(); fetchBalance(); }, [fetchInstrument, fetchBalance]);
  useEffect(() => { fetchTrades(); }, [fetchTrades]);
  useEffect(() => {
    intervalRef.current = setInterval(() => { fetchInstrument(true); fetchBalance(); }, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchInstrument, fetchBalance]);

  // Listen for balance-updated custom event (fired after trade is placed/closed)
  useEffect(() => {
    function onBalanceUpdated() { fetchBalance(); }
    window.addEventListener("balance-updated", onBalanceUpdated);
    return () => window.removeEventListener("balance-updated", onBalanceUpdated);
  }, [fetchBalance]);

  function handleTradeOpened() { fetchBalance(); fetchTrades(); window.dispatchEvent(new CustomEvent("balance-updated")); }
  function handleTradeClosed(id: string) {
    setTrades(prev => prev.map(t => t.id===id ? {...t, status:"CLOSED" as const} : t));
    fetchBalance(); fetchTrades(); setCloseTarget(null);
    window.dispatchEvent(new CustomEvent("balance-updated"));
  }

  // CSV Trade log export
  function handleExportCSV(tradeList: Trade[]) {
    const headers = ["Trade ID", "Side", "Pair", "Order Type", "Leverage", "Entry Price", "Close Price", "Amount", "Units", "P&L", "P&L %", "Status", "Stop Loss", "Take Profit", "Opened At", "Closed At"];
    const rows = tradeList.map(t => [
      t.id, t.side, t.pair, t.orderType, `${t.leverage}x`,
      t.entryPrice.toFixed(2), t.closePrice?.toFixed(2) ?? "-",
      t.amount.toFixed(2), t.units.toFixed(6),
      t.pnl !== null ? t.pnl.toFixed(2) : "-",
      t.pnlPct !== null ? `${t.pnlPct.toFixed(2)}%` : "-",
      t.status,
      t.stopLoss ? t.stopLoss.toFixed(2) : "-",
      t.takeProfit ? t.takeProfit.toFixed(2) : "-",
      new Date(t.openedAt).toLocaleString(),
      t.closedAt ? new Date(t.closedAt).toLocaleString() : "-",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${instrument?.pair?.replace("/","-")}-trades-${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }

  const openTrades   = trades.filter(t => t.status==="OPEN");
  const closedTrades = trades.filter(t => t.status==="CLOSED");

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={36} className="animate-spin text-primary-500"/>
      <p className="text-sm text-gray-400">Loading market data…</p>
    </div>
  );
  if (!instrument) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <AlertCircle size={36} className="text-red-400"/>
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Instrument Not Found</h2>
      <p className="text-sm text-gray-400 max-w-sm">Could not find <span className="font-bold">{instrumentId}</span>.</p>
      <Link href="/dashboard/trading" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
        <ArrowLeft size={14}/> Back to Markets
      </Link>
    </div>
  );

  const isUp = instrument.change24h >= 0;

  return (
    <>
      {closeTarget && (
        <CloseTradeModal trade={closeTarget} price={instrument.price} category={instrument.category}
          onClose={() => setCloseTarget(null)} onClosed={handleTradeClosed}/>
      )}
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Back */}
        <Link href="/dashboard/trading" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors">
          <ArrowLeft size={15}/> Back to Markets
        </Link>
        {/* Instrument header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {instrument.image
              ? <img src={instrument.image} alt={instrument.symbol} className="w-10 h-10 rounded-full object-cover"/>
              : <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-black text-orange-600 text-sm">{instrument.symbol.slice(0,2)}</div>}
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">{instrument.name}</h1>
              <p className="text-sm text-gray-400">{instrument.pair}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900 dark:text-white">{fmtPrice(instrument.price, instrument.category)}</p>
              <p className={`text-sm font-extrabold flex items-center gap-1 justify-end ${isUp?"text-green-500":"text-red-500"}`}>
                {isUp ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                {isUp?"+":""}{instrument.change24h.toFixed(2)}%
                <span className="font-semibold">({isUp?"+":""}{instrument.category==="Forex"?instrument.changePx.toFixed(4):fmtPrice(Math.abs(instrument.changePx),instrument.category)})</span>
              </p>
            </div>
            <button onClick={() => { setRefreshing(true); fetchInstrument(true); }}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <RefreshCw size={14} className={refreshing?"animate-spin":""}/>
            </button>
          </div>
        </div>
        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Chart */}
            <div className="bg-[#0f0f0f] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
              <TradingViewChart pair={instrument.pair} category={instrument.category}/>
            </div>
            {/* Market Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 dark:text-white mb-4">Market Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {[
                  { label:"24h High",   value: high24h ? fmtPrice(high24h, instrument.category) : fmtPrice(instrument.price*1.02, instrument.category), color:"text-green-500" },
                  { label:"24h Low",    value: low24h  ? fmtPrice(low24h,  instrument.category) : fmtPrice(instrument.price*0.98, instrument.category), color:"text-red-500" },
                  { label:"24h Volume", value: fmtVolume(instrument.volume), color:"text-blue-500" },
                  { label:"Market Cap", value: instrument.marketCap ? fmtVolume(instrument.marketCap) : "—", color:"text-purple-500" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                    <p className={`text-base font-extrabold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Trades tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 flex-1">
                  {(["open","closed"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`py-3 text-sm font-extrabold text-center transition-colors ${activeTab===tab?"text-gray-900 dark:text-white border-b-2 border-primary-500":"text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}>
                      {tab==="open" ? `Open Trades (${openTrades.length})` : `Closed Trades (${closedTrades.length})`}
                    </button>
                  ))}
                </div>
                {(activeTab === "open" ? openTrades : closedTrades).length > 0 && (
                  <button
                    onClick={() => handleExportCSV(activeTab === "open" ? openTrades : closedTrades)}
                    className="flex items-center gap-1.5 px-3 py-1.5 mr-3 text-[10px] font-bold text-gray-500 hover:text-primary-500 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                  >
                    <Download size={11}/> Export CSV
                  </button>
                )}
              </div>
              {activeTab==="open" ? (
                openTrades.length===0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4"><Activity size={24} className="text-gray-400"/></div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">No Open Trades</h3>
                    <p className="text-sm text-gray-400 mb-5">You don't have any open trades for {instrument.pair}</p>
                  </div>
                ) : (
                  <div>
                    <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                      <span className="w-10">Side</span><span>Amount</span><span>Entry</span><span>Live P&L</span><span>Leverage / Opened</span><span className="w-16">Action</span>
                    </div>
                    {openTrades.map(t => <OpenTradeRow key={t.id} trade={t} price={instrument.price} category={instrument.category} onClose={setCloseTarget}/>)}
                  </div>
                )
              ) : (
                closedTrades.length===0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4"><BarChart2 size={24} className="text-gray-400"/></div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">No Closed Trades</h3>
                    <p className="text-sm text-gray-400">Closed trades for {instrument.pair} will appear here.</p>
                  </div>
                ) : (
                  <div>
                    <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                      <span className="w-10">Side</span><span>Amount</span><span>Entry</span><span>Close</span><span>P&L</span><span>Closed At</span>
                    </div>
                    {closedTrades.map(t => <ClosedTradeRow key={t.id} trade={t} category={instrument.category}/>)}
                  </div>
                )
              )}
            </div>
          </div>
          {/* RIGHT — Place Order */}
          <div>
            <PlaceOrderPanel instrument={instrument} balance={balance} onTradeOpened={handleTradeOpened} vipTier={vipTier}/>
          </div>
        </div>
      </div>
    </>
  );
}
