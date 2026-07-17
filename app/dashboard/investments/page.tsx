"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Home, ChevronRight, TrendingUp, DollarSign, BarChart2,
  PlusCircle, Loader2, RefreshCw, Clock, CheckCircle2,
  AlertCircle, Calendar, Percent, Activity, Wallet,
  X, Eye, XCircle, Download, Bitcoin, Building2,
  LineChart, Shield, CreditCard, ChevronDown, Info,
  Filter, Lock,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface ActivePlan {
  id: string;
  planName: string;
  capital: number;
  rate: number;
  status: string; // "ACTIVE" | "COMPLETED" | "PENDING_PAYMENT"
  paymentMethod: string | null;
  paymentStatus: string | null; // "PENDING" | "APPROVED" | "REJECTED"
  paymentProofUrl: string | null;
  userWalletAddress: string | null;
  category: string | null;
  createdAt: string;
  lastPayout: string;
}

type StatusFilter = "All" | "ACTIVE" | "COMPLETED" | "PENDING_PAYMENT";
type CategoryFilter = "All" | "General" | "Stocks" | "Crypto" | "Real Estate";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmt(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function daysElapsed(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

// Estimated plan duration based on rate (rough mapping)
function planDuration(plan: ActivePlan): number {
  if (plan.rate >= 100) return 30;
  if (plan.rate >= 50)  return 60;
  if (plan.rate >= 20)  return 90;
  if (plan.rate >= 10)  return 120;
  return 180;
}

function daysRemaining(plan: ActivePlan): number {
  const duration = planDuration(plan);
  const elapsed  = daysElapsed(plan.createdAt);
  return Math.max(0, duration - elapsed);
}

function accruedProfit(plan: ActivePlan) {
  if (plan.status === "PENDING_PAYMENT") return 0;
  const days = daysElapsed(plan.createdAt);
  return (plan.capital * plan.rate) / 100 * days;
}

function progressPct(plan: ActivePlan) {
  const duration = planDuration(plan);
  const elapsed  = daysElapsed(plan.createdAt);
  return Math.min((elapsed / duration) * 100, 100);
}

function categoryLabel(plan: ActivePlan): CategoryFilter {
  const n = (plan.category || plan.planName).toLowerCase();
  if (n.includes("crypto") || n.includes("coin") || n.includes("defi") || n.includes("btc") || n.includes("eth")) return "Crypto";
  if (n.includes("stock") || n.includes("equity")) return "Stocks";
  if (n.includes("real") || n.includes("property") || n.includes("estate") || n.includes("reit") || n.includes("luxury")) return "Real Estate";
  return "General";
}

function categoryColor(plan: ActivePlan) {
  const cat = categoryLabel(plan);
  if (cat === "Crypto")      return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
  if (cat === "Stocks")      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
  if (cat === "Real Estate") return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
  return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
}

function categoryIcon(plan: ActivePlan) {
  const cat = categoryLabel(plan);
  if (cat === "Crypto")      return <Bitcoin size={16} />;
  if (cat === "Stocks")      return <LineChart size={16} />;
  if (cat === "Real Estate") return <Building2 size={16} />;
  return <TrendingUp size={16} />;
}

function paymentMethodLabel(method: string | null) {
  if (!method) return "—";
  if (method === "BALANCE") return "Account Balance";
  if (method === "USDT-ETH" || method === "USDT-TRX") return "USDT";
  return method;
}

function paymentStatusBadge(status: string | null, method: string | null) {
  if (method === "BALANCE") return null; // Instant, no badge needed
  if (status === "APPROVED") return { label: "Payment Approved", cls: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" };
  if (status === "REJECTED") return { label: "Payment Rejected", cls: "bg-red-100 dark:bg-red-900/30 text-red-500" };
  if (status === "PENDING")  return { label: "Awaiting Approval", cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" };
  return null;
}

/* ─────────────────────────────────────────────
   Sparkline chart (SVG)
───────────────────────────────────────────── */
function Sparkline({ plan }: { plan: ActivePlan }) {
  const days = Math.min(daysElapsed(plan.createdAt), 30);
  const daily = (plan.capital * plan.rate) / 100;
  const points = Array.from({ length: Math.max(days + 1, 2) }, (_, i) => i * daily);
  const max = Math.max(...points, 1);
  const w = 120, h = 36;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9 overflow-visible">
      <defs>
        <linearGradient id={`sg-${plan.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={coords}
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${h} ${coords} ${w},${h}`}
        fill={`url(#sg-${plan.id})`}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Plan Detail Modal
───────────────────────────────────────────── */
function PlanDetailModal({ plan, onClose, onCancel }: { plan: ActivePlan; onClose: () => void; onCancel: (id: string) => void }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelErr, setCancelErr] = useState("");
  const elapsed = daysElapsed(plan.createdAt);
  const profit = accruedProfit(plan);
  const daily = (plan.capital * plan.rate) / 100;
  const remaining = daysRemaining(plan);
  const pct = progressPct(plan);
  const badge = paymentStatusBadge(plan.paymentStatus, plan.paymentMethod);
  const isActive = plan.status === "ACTIVE";
  const isPending = plan.status === "PENDING_PAYMENT";

  async function doCancel() {
    setCancelling(true);
    setCancelErr("");
    try {
      const res = await fetch("/api/plans/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) { setCancelErr(data.error || "Failed to cancel"); setCancelling(false); return; }
      onCancel(plan.id);
      onClose();
    } catch {
      setCancelErr("Network error. Try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${categoryColor(plan)}`}>
              {categoryIcon(plan)}
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white">{plan.planName}</h2>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor(plan)}`}>
                {categoryLabel(plan)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Plan Status</span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full ${
              isActive  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
              isPending ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-500"
            }`}>
              {isActive  ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ACTIVE</> :
               isPending ? <><Clock size={10} /> PENDING PAYMENT</> :
                           <><CheckCircle2 size={10} /> COMPLETED</>}
            </span>
          </div>

          {/* Payment status banner */}
          {badge && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${badge.cls} border-current/20`}>
              {badge.label === "Payment Rejected" ? <XCircle size={14} /> : badge.label === "Payment Approved" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {badge.label}
              {isPending && <span className="ml-auto text-[10px] font-normal opacity-75">Admin will review your proof within 2-4 hours</span>}
            </div>
          )}

          {/* Profit Sparkline */}
          {(isActive || plan.status === "COMPLETED") && (
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 font-semibold mb-2 flex items-center gap-1"><LineChart size={10} /> Profit Growth (last {Math.min(elapsed, 30)} days)</p>
              <Sparkline plan={plan} />
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Capital Invested", value: fmt(plan.capital), icon: <DollarSign size={12} />, cls: "text-gray-900 dark:text-white" },
              { label: "Daily Rate", value: `${plan.rate}%`, icon: <Percent size={12} />, cls: "text-primary-500" },
              { label: "Daily Return", value: fmt(daily), icon: <TrendingUp size={12} />, cls: "text-green-600 dark:text-green-400" },
              { label: "Accrued Profit", value: fmt(profit), icon: <Activity size={12} />, cls: "text-blue-600 dark:text-blue-400" },
              { label: "Days Active", value: `${elapsed} days`, icon: <Clock size={12} />, cls: "text-gray-700 dark:text-gray-300" },
              { label: "Days Remaining", value: plan.status === "COMPLETED" ? "Ended" : `${remaining} days`, icon: <Calendar size={12} />, cls: remaining <= 5 && isActive ? "text-red-500" : "text-gray-700 dark:text-gray-300" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">{s.icon}{s.label}</p>
                <p className={`text-sm font-black ${s.cls}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
              <span>Plan Progress</span>
              <span>{pct.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-primary-500" : "bg-gray-400"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Payment info */}
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-extrabold text-gray-700 dark:text-gray-300 flex items-center gap-2"><CreditCard size={13} /> Payment Details</h4>
            {[
              { label: "Method", value: paymentMethodLabel(plan.paymentMethod) },
              { label: "Plan ID", value: plan.id.slice(0, 8).toUpperCase(), mono: true },
              { label: "Start Date", value: new Date(plan.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" }) },
              ...(plan.userWalletAddress ? [{ label: "Refund Wallet", value: plan.userWalletAddress.slice(0, 12) + "..." + plan.userWalletAddress.slice(-6), mono: true }] : []),
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-gray-400">{r.label}</span>
                <span className={`font-bold text-gray-700 dark:text-gray-300 ${r.mono ? "font-mono" : ""}`}>{r.value}</span>
              </div>
            ))}
            {plan.paymentProofUrl && (
              <a href={plan.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600 font-bold mt-1">
                <Eye size={12} /> View Payment Proof Screenshot
              </a>
            )}
          </div>

          {/* Cancel plan */}
          {isActive && !isPending && (
            <div className="border border-red-100 dark:border-red-900/30 rounded-xl p-4">
              {!confirmCancel ? (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300">Cancel Plan</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Your capital (${plan.capital.toLocaleString()}) will be refunded to your balance.</p>
                  </div>
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Cancel Plan
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-red-500">⚠ Are you sure? This cannot be undone.</p>
                  <p className="text-[10px] text-gray-400">You will lose all accrued profit ({fmt(profit)}) and only receive your capital ({fmt(plan.capital)}) back.</p>
                  {cancelErr && <p className="text-[10px] text-red-500 font-bold">{cancelErr}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmCancel(false)} className="flex-1 py-2 text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
                      Keep Plan
                    </button>
                    <button onClick={doCancel} disabled={cancelling} className="flex-1 py-2 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-60">
                      {cancelling ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Plan Card
───────────────────────────────────────────── */
function PlanCard({ plan, onClick }: { plan: ActivePlan; onClick: () => void }) {
  const elapsed = daysElapsed(plan.createdAt);
  const profit = accruedProfit(plan);
  const daily = (plan.capital * plan.rate) / 100;
  const isActive = plan.status === "ACTIVE";
  const isPending = plan.status === "PENDING_PAYMENT";
  const isCompleted = plan.status === "COMPLETED";
  const remaining = daysRemaining(plan);
  const pct = progressPct(plan);
  const badge = paymentStatusBadge(plan.paymentStatus, plan.paymentMethod);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      {/* Top gradient accent bar */}
      <div className={`h-1 w-full ${
        isActive    ? "bg-gradient-to-r from-primary-500 to-primary-400" :
        isPending   ? "bg-gradient-to-r from-yellow-400 to-amber-400" :
                      "bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"
      }`} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColor(plan)}`}>
              {categoryIcon(plan)}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">{plan.planName}</h3>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${categoryColor(plan)}`}>
                {categoryLabel(plan)}
              </span>
            </div>
          </div>
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0 ${
            isActive    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
            isPending   ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}>
            {isActive    ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ACTIVE</> :
             isPending   ? <><Clock size={9} /> PENDING</> :
                           <><CheckCircle2 size={9} /> DONE</>}
          </span>
        </div>

        {/* Payment proof pending warning */}
        {isPending && badge && (
          <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${badge.cls}`}>
            <Clock size={10} /> {badge.label}
          </div>
        )}

        {/* Sparkline for active plans */}
        {(isActive || isCompleted) && elapsed > 0 && (
          <div className="opacity-70 group-hover:opacity-100 transition-opacity">
            <Sparkline plan={plan} />
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><DollarSign size={9} /> Capital</p>
            <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(plan.capital)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Percent size={9} /> Daily Rate</p>
            <p className="text-sm font-black text-primary-500">{plan.rate}%</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><TrendingUp size={9} /> Daily Return</p>
            <p className="text-sm font-black text-green-600 dark:text-green-400">{fmt(daily)}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><Activity size={9} /> Accrued Profit</p>
            <p className="text-sm font-black text-blue-600 dark:text-blue-400">{fmt(profit)}</p>
          </div>
        </div>

        {/* Progress bar */}
        {!isPending && (
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span className="flex items-center gap-1"><Clock size={9} /> {elapsed} days active</span>
              <span className={`font-bold ${remaining <= 5 && isActive ? "text-red-500" : ""}`}>
                {isActive ? `${remaining} days left` : `${pct.toFixed(0)}% complete`}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-primary-500" : "bg-gray-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Payment method + footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <CreditCard size={9} />
            {paymentMethodLabel(plan.paymentMethod)}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono">
              {plan.id.slice(0, 8).toUpperCase()}
            </div>
            <Info size={12} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Export CSV helper
───────────────────────────────────────────── */
function exportCSV(plans: ActivePlan[]) {
  const headers = ["Plan Name", "Category", "Status", "Capital ($)", "Daily Rate (%)", "Daily Return ($)", "Accrued Profit ($)", "Payment Method", "Payment Status", "Days Active", "Start Date", "Plan ID"];
  const rows = plans.map(p => [
    p.planName,
    categoryLabel(p),
    p.status,
    p.capital.toFixed(2),
    p.rate.toFixed(2),
    ((p.capital * p.rate) / 100).toFixed(2),
    accruedProfit(p).toFixed(2),
    paymentMethodLabel(p.paymentMethod),
    p.paymentStatus || "N/A",
    daysElapsed(p.createdAt).toString(),
    new Date(p.createdAt).toLocaleDateString(),
    p.id,
  ]);

  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tesla-capx-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function InvestmentsPage() {
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActivePlan | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchPlans = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      const data = await res.json();
      setPlans(data);
    } catch {
      setError("Could not load your investment plans. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function handleCancel(id: string) {
    setPlans(prev => prev.filter(p => p.id !== id));
  }

  /* ── Derived stats ── */
  const activePlans    = useMemo(() => plans.filter(p => p.status === "ACTIVE"), [plans]);
  const completedPlans = useMemo(() => plans.filter(p => p.status === "COMPLETED"), [plans]);
  const pendingPlans   = useMemo(() => plans.filter(p => p.status === "PENDING_PAYMENT"), [plans]);
  const totalCapital   = useMemo(() => plans.reduce((s, p) => s + p.capital, 0), [plans]);
  const totalProfit    = useMemo(() => plans.reduce((s, p) => s + accruedProfit(p), 0), [plans]);
  const totalDaily     = useMemo(() => activePlans.reduce((s, p) => s + (p.capital * p.rate) / 100, 0), [activePlans]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let result = plans;
    if (statusFilter !== "All")   result = result.filter(p => p.status === statusFilter);
    if (categoryFilter !== "All") result = result.filter(p => categoryLabel(p) === categoryFilter);
    return result;
  }, [plans, statusFilter, categoryFilter]);

  const STATUS_FILTERS: { label: string; value: StatusFilter; count: number; color: string }[] = [
    { label: "All Plans",  value: "All",             count: plans.length,        color: "text-gray-600" },
    { label: "Active",     value: "ACTIVE",           count: activePlans.length,  color: "text-green-600" },
    { label: "Pending",    value: "PENDING_PAYMENT",  count: pendingPlans.length, color: "text-yellow-600" },
    { label: "Completed",  value: "COMPLETED",        count: completedPlans.length, color: "text-gray-400" },
  ];

  const CATEGORY_FILTERS: CategoryFilter[] = ["All", "General", "Stocks", "Crypto", "Real Estate"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onCancel={handleCancel}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Home size={11} />
        <Link href="/dashboard" className="hover:text-primary-500 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-gray-600 dark:text-gray-300 font-semibold">My Investment Plans</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">My Investment Plans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage your active investment portfolios</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export CSV */}
          {plans.length > 0 && (
            <button
              onClick={() => exportCSV(plans)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:border-primary-400 hover:text-primary-500 transition-colors"
              title="Export CSV"
            >
              <Download size={14} /> <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold border rounded-xl transition-colors ${showFilters ? "bg-primary-500 border-primary-500 text-white" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-500"}`}
          >
            <Filter size={14} /> <span className="hidden sm:inline">Filter</span>
            <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          {/* Refresh */}
          <button
            onClick={() => fetchPlans(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
          <Link
            href="/dashboard/buy-plan"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
          >
            <PlusCircle size={15} /> New Investment
          </Link>
        </div>
      </div>

      {/* Stats row */}
      {plans.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Invested",  value: fmt(totalCapital), icon: <Wallet size={16} className="text-primary-500" />,   bg: "bg-red-50 dark:bg-red-900/20" },
            { label: "Accrued Profit",  value: fmt(totalProfit),  icon: <TrendingUp size={16} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Daily Earnings",  value: fmt(totalDaily),   icon: <DollarSign size={16} className="text-blue-500" />,  bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Active Plans",    value: `${activePlans.length}${pendingPlans.length > 0 ? ` (+${pendingPlans.length} pending)` : ""}`, icon: <BarChart2 size={16} className="text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-900/20" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">{s.label}</p>
                <p className="text-base font-black text-gray-900 dark:text-white leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
          {/* Status filter */}
          <div>
            <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Filter by Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === f.value
                      ? "bg-primary-500 text-white shadow-sm"
                      : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
                  }`}
                >
                  {f.label}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${statusFilter === f.value ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Category filter */}
          <div>
            <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Filter by Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    categoryFilter === cat
                      ? "bg-primary-500 text-white shadow-sm"
                      : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick status tabs (always visible) */}
      {!showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                statusFilter === f.value
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
              }`}
            >
              {f.label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${statusFilter === f.value ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <p className="text-sm text-gray-400">Loading your plans...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
          <AlertCircle size={36} className="text-red-400 mb-4" />
          <h3 className="font-extrabold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">{error}</p>
          <button
            onClick={() => fetchPlans()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
            <BarChart2 size={30} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">No Plans Found</h3>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6">
            {statusFilter === "All" && categoryFilter === "All"
              ? "You don't have any investment plans yet."
              : "No plans match your current filter selection."}
          </p>
          {statusFilter === "All" && categoryFilter === "All" ? (
            <Link href="/dashboard/buy-plan" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
              <PlusCircle size={14} /> Start Your First Investment
            </Link>
          ) : (
            <button onClick={() => { setStatusFilter("All"); setCategoryFilter("All"); }} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 font-bold text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(plan => (
            <PlanCard key={plan.id} plan={plan} onClick={() => setSelectedPlan(plan)} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      {!loading && !error && plans.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-700 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={22} className="text-primary-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Grow Your Portfolio</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Earning <span className="text-green-400 font-bold">{fmt(totalDaily)}/day</span> across {activePlans.length} active plan{activePlans.length !== 1 ? "s" : ""}.
                {pendingPlans.length > 0 && <span className="text-yellow-400 font-bold ml-1">{pendingPlans.length} pending approval.</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => exportCSV(plans)} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-600 text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
              <Download size={13} /> Export
            </button>
            <Link href="/dashboard/buy-plan" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <PlusCircle size={14} /> New Investment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
