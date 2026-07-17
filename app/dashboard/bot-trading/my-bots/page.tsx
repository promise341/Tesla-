"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Bot, TrendingUp, RefreshCw, Loader2, AlertCircle, X, ArrowLeft,
  CheckCircle2, Plus, Minus, Info, Download, Wallet,
} from "lucide-react";

interface BotPlan {
  id: string; planName: string; capital: number; rate: number; status: string; createdAt: string;
}

function fmt(n: number) { return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2 }); }
function days(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000); }
function estValue(p: BotPlan) { return p.capital + (p.capital * p.rate / 100) * days(p.createdAt); }

/* ─────────────────────────────────────────────
   Adjust Bot Capital Modal
───────────────────────────────────────────── */
function AdjustBotModal({
  plan, userBalance, onClose, onSuccess,
}: {
  plan: BotPlan; userBalance: number; onClose: () => void; onSuccess: () => void;
}) {
  const name = plan.planName.replace("BOT: ", "");
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const num = parseFloat(addAmount) || 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (num <= 0)           { setError("Enter a valid amount."); return; }
    if (num > userBalance)  { setError(`You only have ${fmt(userBalance)} available.`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bots/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, addAmount: num }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed. Please try again."); return; }
      toast.success(`Added ${fmt(num)} to ${name}!`);
      onSuccess();
      onClose();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
        <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Add Bot Capital</h3>
        <p className="text-xs text-gray-400 mb-4">Add funds to <span className="font-bold text-gray-700 dark:text-gray-300">{name}</span></p>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 mb-4 space-y-1.5">
          {[
            { label: "Current Capital",  value: fmt(plan.capital) },
            { label: "Daily Return",     value: `${plan.rate}% / day` },
            { label: "Available Cash",   value: fmt(userBalance) },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-xs">
              <span className="text-gray-400">{r.label}</span>
              <span className="font-bold text-gray-900 dark:text-white">{r.value}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Amount to Add ($)</label>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-primary-500">
              <span className="text-gray-400 font-bold">$</span>
              <input type="number" min={1} value={addAmount}
                onChange={e => { setAddAmount(e.target.value); setError(""); }}
                className="flex-1 bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none"
                placeholder="0.00" />
            </div>
          </div>

          <div className="flex gap-2">
            {[100, 500, 1000].map(v => (
              <button key={v} type="button" onClick={() => setAddAmount(v.toString())}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ${addAmount === v.toString() ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400"}`}>
                +${v}
              </button>
            ))}
            <button type="button" onClick={() => setAddAmount(userBalance.toFixed(2))}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ${addAmount === userBalance.toFixed(2) ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400"}`}>
              Max
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Adding…</> : <><Plus size={14} /> Add Capital</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function MyBotsPage() {
  const [plans,         setPlans]       = useState<BotPlan[]>([]);
  const [userBalance,   setUserBalance] = useState(0);
  const [loading,       setLoading]     = useState(true);
  const [refreshing,    setRefreshing]  = useState(false);
  const [stopping,      setStopping]    = useState<string | null>(null);
  const [adjustTarget,  setAdjustTarget] = useState<BotPlan | null>(null);

  const fetchPlans = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const [plansRes, meRes] = await Promise.all([
        fetch("/api/plans"),
        fetch("/api/user/me"),
      ]);
      if (plansRes.ok) {
        const d: BotPlan[] = await plansRes.json();
        setPlans(Array.isArray(d) ? d.filter(p => p.planName.startsWith("BOT:") && p.status === "ACTIVE") : []);
      }
      if (meRes.ok) {
        const d = await meRes.json();
        if (d?.balance !== undefined) setUserBalance(Number(d.balance));
      }
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Listen to balance updates
  useEffect(() => {
    function onBalanceUpdated() { fetchPlans(true); }
    window.addEventListener("balance-updated", onBalanceUpdated);
    return () => window.removeEventListener("balance-updated", onBalanceUpdated);
  }, [fetchPlans]);

  async function stopBot(id: string) {
    if (!confirm("Stop this bot? Your remaining capital will be returned to your balance.")) return;
    setStopping(id);
    const tid = toast.loading("Stopping AI Bot…");
    try {
      const r = await fetch("/api/plans/cancel", {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ planId: id })
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error || "Failed to stop bot.", { id: tid });
        return;
      }
      const target = plans.find(p => p.id === id);
      const refund = target ? target.capital : 0;
      toast.success(`Bot stopped! ${fmt(refund)} has been returned to your balance.`, { id: tid, duration: 5000 });
      setPlans(p => p.filter(b => b.id !== id));
      await fetchPlans(true);
      window.dispatchEvent(new CustomEvent("balance-updated"));
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
    } finally { setStopping(null); }
  }

  const totalInvested = plans.reduce((s, p) => s + p.capital, 0);
  const totalValue    = plans.reduce((s, p) => s + estValue(p), 0);
  const totalPnl      = totalValue - totalInvested;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {adjustTarget && (
        <AdjustBotModal
          plan={adjustTarget}
          userBalance={userBalance}
          onClose={() => setAdjustTarget(null)}
          onSuccess={() => { fetchPlans(true); window.dispatchEvent(new CustomEvent("balance-updated")); }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Bot Investments</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your active AI trading bots</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchPlans(true)} disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""}/>
          </button>
          <Link href="/dashboard/bot-trading" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
            <Bot size={14}/> Browse Bots
          </Link>
        </div>
      </div>

      {/* Stats */}
      {plans.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"Active Bots",    value: plans.length.toString(), color:"text-gray-900 dark:text-white" },
            { label:"Total Invested", value: fmt(totalInvested),       color:"text-gray-900 dark:text-white" },
            { label:"Accrued P&L",   value: (totalPnl>=0?"+":"")+fmt(totalPnl), color: totalPnl>=0?"text-green-500":"text-red-500" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm text-center">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-primary-500"/>
          <p className="text-sm text-gray-400">Loading your bots…</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
            <Bot size={30} className="text-gray-400"/>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">No Active Bots</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">You haven't invested in any bots yet. Browse our 28 AI-powered trading bots to get started.</p>
          <Link href="/dashboard/bot-trading" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
            <Bot size={14}/> Browse Trading Bots
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => {
            const val  = estValue(plan);
            const pnl  = val - plan.capital;
            const pct  = (pnl / plan.capital) * 100;
            const name = plan.planName.replace("BOT: ","");
            return (
              <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={22} className="text-primary-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{name}</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> Active
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">{days(plan.createdAt)} days active · {plan.rate}% daily rate</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div><p className="text-[10px] text-gray-400">Invested</p><p className="text-sm font-extrabold text-gray-900 dark:text-white">{fmt(plan.capital)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Current Value</p><p className="text-sm font-extrabold text-gray-900 dark:text-white">{fmt(val)}</p></div>
                    <div><p className="text-[10px] text-gray-400">P&L</p><p className={`text-sm font-extrabold ${pnl>=0?"text-green-500":"text-red-500"}`}>{pnl>=0?"+":""}{fmt(pnl)} ({pct>=0?"+":""}{pct.toFixed(2)}%)</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setAdjustTarget(plan)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-primary-200 dark:border-primary-800 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                    <Plus size={11} /> Add
                  </button>
                  {stopping === plan.id
                    ? <Loader2 size={18} className="animate-spin text-primary-500"/>
                    : <button onClick={() => stopBot(plan.id)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        <Minus size={11}/> Stop
                      </button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link href="/dashboard/bot-trading" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-primary-500 transition-colors">
        <ArrowLeft size={14}/> Back to Bot Hub
      </Link>
    </div>
  );
}
