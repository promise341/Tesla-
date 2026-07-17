"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Users, DollarSign, TrendingUp, BarChart2, RefreshCw,
  Search, Shield, Copy, Info, CheckCircle2, X,
  Loader2, AlertCircle, ArrowRight, Plus, Minus,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface ActiveCopy {
  id: string;
  planName: string;   // "COPY: Isabella Foster"
  capital: number;
  rate: number;
  status: string;
  createdAt: string;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmt(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysElapsed(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function estimatedValue(copy: ActiveCopy) {
  const days = daysElapsed(copy.createdAt);
  return copy.capital + (copy.capital * copy.rate / 100) * days;
}

function expertName(planName: string) {
  return planName.replace("COPY: ", "");
}

/* ─────────────────────────────────────────────
   Adjust Investment Modal
───────────────────────────────────────────── */
function AdjustModal({
  copy, userBalance, onClose, onSuccess,
}: {
  copy: ActiveCopy; userBalance: number; onClose: () => void; onSuccess: () => void;
}) {
  const name = expertName(copy.planName);
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
      const res = await fetch("/api/copy-trade/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: copy.id, addAmount: num }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed. Please try again."); return; }
      toast.success(`Added ${fmt(num)} to ${name} copy!`);
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
        <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Adjust Investment</h3>
        <p className="text-xs text-gray-400 mb-4">Add capital to your copy of <span className="font-bold text-gray-700 dark:text-gray-300">{name}</span></p>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 mb-4 space-y-1.5">
          {[
            { label: "Current Capital",  value: fmt(copy.capital) },
            { label: "Daily Rate",       value: `${copy.rate}% / day` },
            { label: "Your Balance",     value: fmt(userBalance) },
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
   Active Copy Row
───────────────────────────────────────────── */
function ActiveCopyRow({ copy, onStop, onAdjust }: {
  copy: ActiveCopy;
  onStop: (id: string) => void;
  onAdjust: (copy: ActiveCopy) => void;
}) {
  const days    = daysElapsed(copy.createdAt);
  const value   = estimatedValue(copy);
  const pnl     = value - copy.capital;
  const pnlPct  = (pnl / copy.capital) * 100;
  const isProfit = pnl >= 0;
  const name    = expertName(copy.planName);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
        {name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{name}</h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Copying
          </span>
        </div>
        <p className="text-[10px] text-gray-400">{days} days active · {copy.rate}% daily rate</p>

        <div className="flex flex-wrap gap-4 mt-2">
          <div>
            <p className="text-[10px] text-gray-400">Invested</p>
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">{fmt(copy.capital)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Current Value</p>
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">{fmt(value)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">P&L</p>
            <p className={`text-sm font-extrabold ${isProfit ? "text-green-500" : "text-red-500"}`}>
              {isProfit ? "+" : ""}{fmt(pnl)} ({isProfit ? "+" : ""}{pnlPct.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onAdjust(copy)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-primary-200 dark:border-primary-800 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
        >
          <Plus size={11} /> Add
        </button>
        <button
          onClick={() => onStop(copy.id)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <Minus size={11} /> Stop
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   How It Works Modal
───────────────────────────────────────────── */
function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const steps = [
    { step: "1", title: "Browse Expert Traders", desc: "Explore our verified professionals with proven track records, win rates, and full trading history." },
    { step: "2", title: "Choose & Invest",        desc: "Select an expert, set your investment amount (minimum varies per expert), and confirm your copy." },
    { step: "3", title: "Auto-Copy Trades",        desc: "Your account automatically mirrors the expert's trades proportionally to your investment." },
    { step: "4", title: "Track & Earn",            desc: "Monitor your portfolio in real time. Profits are credited to your balance automatically." },
    { step: "5", title: "Stop Anytime",            desc: "You stay in full control. Stop copying at any time and your remaining capital is returned." },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Info size={20} className="text-primary-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 dark:text-white">How Copy Trading Works</h2>
            <p className="text-xs text-gray-400">5 simple steps to start earning</p>
          </div>
        </div>
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-0.5">{s.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Close</button>
          <Link href="/dashboard/copy/experts" className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl text-center transition-colors">
            Browse Experts
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function CopyDashboardPage() {
  const [copies,      setCopies]      = useState<ActiveCopy[]>([]);
  const [balance,     setBalance]     = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState("");
  const [showHowTo,   setShowHowTo]   = useState(false);
  const [stopping,    setStopping]    = useState<string | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<ActiveCopy | null>(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const [plansRes, meRes] = await Promise.all([
        fetch("/api/plans"),
        fetch("/api/user/me"),
      ]);
      if (plansRes.ok) {
        const plans: ActiveCopy[] = await plansRes.json();
        setCopies(Array.isArray(plans) ? plans.filter((p) => p.planName.startsWith("COPY:") && p.status === "ACTIVE") : []);
      }
      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.balance !== undefined) setBalance(Number(me.balance));
      }
    } catch { setError("Could not load your copy trading data."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Stop copying an expert */
  async function handleStop(id: string) {
    if (!confirm("Stop copying this expert? Your remaining capital will be returned to your balance.")) return;
    setStopping(id);
    const tid = toast.loading("Stopping copy trade…");
    try {
      const res = await fetch(`/api/plans/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to stop copy trade.", { id: tid });
        return;
      }
      const stoppedCopy = copies.find(c => c.id === id);
      const refund = stoppedCopy ? stoppedCopy.capital : 0;
      toast.success(
        `Copy trade stopped! ${fmt(refund)} has been returned to your balance.`,
        { id: tid, duration: 5000 }
      );
      setCopies((prev) => prev.filter((c) => c.id !== id));
      // Refresh balance immediately
      await fetchAll(true);
      window.dispatchEvent(new CustomEvent("balance-updated"));
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
    }
    finally { setStopping(null); }
  }

  /* Derived stats */
  const totalInvested    = copies.reduce((s, c) => s + c.capital, 0);
  const totalValue       = copies.reduce((s, c) => s + estimatedValue(c), 0);
  const totalPnl         = totalValue - totalInvested;
  const totalPnlPct      = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const isPnlPositive    = totalPnl >= 0;

  const STATS = [
    {
      label: "Active Copies",
      value: copies.length.toString(),
      sub: "Experts being copied",
      icon: <Users size={22} className="text-gray-400" />,
      bg: "bg-gray-50 dark:bg-gray-700",
    },
    {
      label: "Total Invested",
      value: fmt(totalInvested),
      sub: "Capital deployed",
      icon: <DollarSign size={22} className="text-green-500" />,
      bg: "bg-green-50 dark:bg-green-900/20",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      label: "Current Value",
      value: fmt(totalValue),
      sub: "Portfolio value",
      icon: <BarChart2 size={22} className="text-primary-500" />,
      bg: "bg-red-50 dark:bg-red-900/20",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      label: "Total P&L",
      value: (isPnlPositive ? "+" : "") + fmt(totalPnl),
      sub: `${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(1)}% ROI`,
      icon: <TrendingUp size={22} className={isPnlPositive ? "text-green-500" : "text-red-500"} />,
      bg: isPnlPositive ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
      valueColor: isPnlPositive ? "text-green-500" : "text-red-500",
    },
  ];

  return (
    <>
      {showHowTo && <HowItWorksModal onClose={() => setShowHowTo(false)} />}
      {adjustTarget && (
        <AdjustModal
          copy={adjustTarget}
          userBalance={balance}
          onClose={() => setAdjustTarget(null)}
          onSuccess={() => { fetchAll(true); window.dispatchEvent(new CustomEvent("balance-updated")); }}
        />
      )}

      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">Copy Trading Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your copy trading portfolio and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <Link
              href="/dashboard/copy/experts"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
            >
              <Search size={14} /> Browse Experts
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.valueColor ?? "text-gray-900 dark:text-white"}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-primary-500" />
            <p className="text-sm text-gray-400">Loading your copy trades…</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
            <AlertCircle size={32} className="text-red-400 mb-4" />
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <button onClick={() => fetchAll()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : copies.length > 0 ? (
          /* Active copies list */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-gray-900 dark:text-white">Active Copies ({copies.length})</h2>
              <button
                onClick={() => setShowHowTo(true)}
                className="text-xs font-bold text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-1"
              >
                <Info size={12} /> How it works
              </button>
            </div>
            {copies.map((copy) => (
              <div key={copy.id} className="relative">
                {stopping === copy.id && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 rounded-2xl flex items-center justify-center z-10">
                    <Loader2 size={20} className="animate-spin text-primary-500" />
                  </div>
                )}
                <ActiveCopyRow copy={copy} onStop={handleStop} onAdjust={setAdjustTarget} />
              </div>
            ))}

            {/* Browse more experts CTA */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Users size={18} className="text-primary-500" />
                </div>
                <div>
                  <p className="font-extrabold text-primary-700 dark:text-primary-300 text-sm">Copy more experts</p>
                  <p className="text-[11px] text-primary-600 dark:text-primary-400">Diversify your portfolio with multiple traders</p>
                </div>
              </div>
              <Link href="/dashboard/copy/experts" className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition-colors">
                Browse <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 flex flex-col items-center text-center">

            {/* Copy icon */}
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
              <Copy size={36} className="text-primary-500" />
            </div>

            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">Start Copy Trading</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-8">
              You haven't started copying any traders yet. Browse our expert traders and start copying their winning strategies to earn profits automatically.
            </p>

            {/* 3 feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mb-8">
              {[
                { icon: <Users size={22} className="text-primary-500" />,  bg: "bg-red-50 dark:bg-red-900/20",    title: "Expert Traders",  desc: "Copy from verified professional traders with proven track records" },
                { icon: <TrendingUp size={22} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20", title: "Auto Trading",     desc: "Trades are executed automatically when experts make moves" },
                { icon: <Shield size={22} className="text-gray-500" />,    bg: "bg-gray-100 dark:bg-gray-700",     title: "Risk Management", desc: "Set your own risk limits and stop-loss parameters" },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col items-center text-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${f.bg} flex items-center justify-center`}>{f.icon}</div>
                  <div>
                    <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{f.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link
                href="/dashboard/copy/experts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
              >
                <Search size={15} /> Browse Expert Traders
              </Link>
              <button
                onClick={() => setShowHowTo(true)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Info size={15} /> How It Works
              </button>
            </div>
          </div>
        )}

        {/* Deposit CTA if balance is low */}
        {!loading && balance < 100 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-yellow-800 dark:text-yellow-300 text-sm">Low Balance</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                  Your balance is {fmt(balance)}. Most experts require a minimum investment. Deposit funds to start copy trading.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/wallet/deposit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-sm rounded-xl transition-colors flex-shrink-0"
            >
              Deposit Funds <ArrowRight size={14} />
            </Link>
          </div>
        )}

      </div>
    </>
  );
}
