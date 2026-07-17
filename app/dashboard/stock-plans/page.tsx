"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ChevronRight, TrendingUp, BarChart2, DollarSign, Globe, Building2, Zap, PiggyBank, ShoppingBag, Factory, Info, CheckCircle2, AlertCircle, Loader2, X, Lock, ArrowRight } from "lucide-react";

const STOCK_PLANS = [
  { name: "Test", tag: "Popular", tagColor: "bg-primary-500", roi: "156%", roiLabel: "Every 30 Min ROI", min: 500, max: 2999, rate: 156, rateLabel: "156% Every 30 Minutes", duration: 5, bonus: 5, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80" },
  { name: "Beginner Plan", tag: null, tagColor: "", roi: "100%", roiLabel: "Daily ROI", min: 100, max: 25000, rate: 100, rateLabel: "100% Daily", duration: 60, bonus: 10, img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80" },
  { name: "Stock Starter Plan", tag: "Popular", tagColor: "bg-primary-500", roi: "1.5%", roiLabel: "Daily ROI", min: 100, max: 500, rate: 1.5, rateLabel: "1.5% Daily", duration: 30, bonus: 5, img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&q=80" },
  { name: "Stock Growth Plan", tag: "Recommended", tagColor: "bg-green-500", roi: "2.5%", roiLabel: "Daily ROI", min: 500, max: 2000, rate: 2.5, rateLabel: "2.5% Daily", duration: 45, bonus: 10, img: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&q=80" },
  { name: "Stock Premium Plan", tag: "Premium", tagColor: "bg-purple-500", roi: "4.0%", roiLabel: "Daily ROI", min: 2000, max: 10000, rate: 4.0, rateLabel: "4.0% Daily", duration: 60, bonus: 50, img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80" },
  { name: "Stock Elite Plan", tag: "Elite", tagColor: "bg-yellow-500", roi: "6.0%", roiLabel: "Daily ROI", min: 10000, max: 50000, rate: 6.0, rateLabel: "6.0% Daily", duration: 90, bonus: 200, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80" },
];
type Plan = (typeof STOCK_PLANS)[number];

/* ── Confirm Modal ── */
function ConfirmModal({ plan, amount, onConfirm, onClose, loading, error }: { plan: Plan; amount: number; onConfirm: () => void; onClose: () => void; loading: boolean; error: string; }) {
  const daily = (amount * plan.rate) / 100;
  const total = daily * plan.duration;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center"><TrendingUp size={20} className="text-primary-500" /></div>
          <div><h3 className="font-extrabold text-gray-900 dark:text-white">Confirm Stock Investment</h3><p className="text-xs text-gray-400">{plan.name}</p></div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2 mb-5">
          {[{ label: "Plan", value: plan.name, red: false }, { label: "Amount", value: `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, red: false }, { label: "Return Rate", value: plan.rateLabel, red: true }, { label: "Duration", value: `${plan.duration} Days`, red: false }, { label: "Daily Return", value: `$${daily.toFixed(2)}`, red: true }, { label: `Total (${plan.duration}d)`, value: `$${total.toFixed(2)}`, red: true }].map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-gray-400">{r.label}</span>
              <span className={r.red ? "font-bold text-primary-500" : "font-bold text-gray-900 dark:text-white"}>{r.value}</span>
            </div>
          ))}
        </div>
        {error && <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold"><AlertCircle size={13} className="flex-shrink-0" /> {error}</div>}
        <button onClick={onConfirm} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-colors">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : <><Lock size={14} /> Confirm Investment</>}
        </button>
      </div>
    </div>
  );
}

/* ── Success Modal ── */
function SuccessModal({ plan, amount, onClose }: { plan: Plan; amount: number; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5"><CheckCircle2 size={36} className="text-green-500" /></div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Investment Activated!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You joined <span className="font-bold text-gray-900 dark:text-white">{plan.name}</span></p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6"><span className="font-bold text-primary-500">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> invested successfully.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">View Plans</button>
          <Link href="/dashboard/investments" className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl text-center transition-colors">My Portfolio</Link>
        </div>
      </div>
    </div>
  );
}
   // Helper to get card styles depending on the plan name
function getStockPlanTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("elite") || n.includes("premium") || n === "test") {
    return {
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
      bgLight: "bg-amber-500/10",
      textLight: "text-amber-500",
      borderGlow: "hover:border-amber-500/40 hover:shadow-amber-500/10",
      perks: ["Dividend Payouts", "High-Equity Option", "Capital Protected"],
    };
  }
  if (n.includes("growth") || n.includes("starter") || n.includes("beginner")) {
    return {
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgLight: "bg-emerald-500/10",
      textLight: "text-emerald-500",
      borderGlow: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
      perks: ["Automated Dividend", "Blue-Chip Equity", "Capital Protected"],
    };
  }
  return {
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgLight: "bg-blue-500/10",
    textLight: "text-blue-500",
    borderGlow: "hover:border-blue-500/40 hover:shadow-blue-500/10",
    perks: ["Standard Dividend", "Sector Equity", "Capital Protected"],
  };
}

/* ── Plan Card ── */
function PlanCard({ plan, onInvest }: { plan: Plan; onInvest: (p: Plan, a: number) => void; }) {
  const [amount, setAmount] = useState(plan.min);
  const clamped = Math.min(Math.max(amount, plan.min), plan.max);
  const sliderPct = ((clamped - plan.min) / (plan.max - plan.min)) * 100;
  const daily = (clamped * plan.rate) / 100;
  const total = daily * plan.duration;
  const theme = getStockPlanTheme(plan.name);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700/60 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col ${theme.borderGlow}`}>
      
      {/* Header section with gradient background */}
      <div className={`bg-gradient-to-br ${theme.gradient} p-6 text-white relative`}>
        {/* Background glow overlay */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        
        {/* ROI badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/25">
          <TrendingUp size={11} className="animate-pulse" /> {plan.roi}
        </div>
        
        <p className="text-xs uppercase font-bold tracking-widest text-white/70 mb-1">Equity Tier</p>
        <h3 className="text-2xl font-black tracking-tight mb-4">
          {plan.name}
        </h3>
        
        <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-2">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/75 tracking-wider">Minimum Entry</p>
            <p className="text-2xl font-black tracking-tight">${plan.min.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-white/75 tracking-wider">Duration</p>
            <p className="text-lg font-black tracking-tight">{plan.duration} Days</p>
          </div>
        </div>
      </div>

      {/* Perks and details */}
      <div className="p-6 space-y-4 flex-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Equity Benefits</p>
        <div className="grid grid-cols-1 gap-2.5">
          {theme.perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-350 font-bold">
              <div className={`w-5 h-5 rounded-full ${theme.bgLight} flex items-center justify-center flex-shrink-0`}>
                <CheckCircle2 size={12} className={theme.textLight} />
              </div>
              <span>{perk}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-700/60 pt-4 mt-2 grid grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <span className="text-gray-400 block">Return Rate</span>
            <span className={`text-sm font-extrabold ${theme.textLight}`}>{plan.rateLabel}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Bonus Awarded</span>
            <span className="text-sm font-extrabold text-blue-500">${plan.bonus}</span>
          </div>
        </div>
      </div>

      {/* Amount input + slider */}
      <div className="px-6 pb-2 space-y-3.5 bg-gray-50/50 dark:bg-gray-800/40 py-4 border-t border-b border-gray-100 dark:border-gray-700/60 font-semibold">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Share Capital ($)
          </p>
          <span className="text-[10px] font-extrabold text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
            USD
          </span>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border border-gray-250 dark:border-gray-650 rounded-2xl px-4 py-2 bg-white dark:bg-gray-900 shadow-inner focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
          <span className="text-gray-450 font-black text-sm">$</span>
          <input
            type="number"
            min={plan.min}
            max={plan.max}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 bg-transparent text-sm font-black text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Slider */}
        <div className="relative pt-1">
          <input
            type="range"
            min={plan.min}
            max={plan.max}
            step={Math.max(1, Math.floor(plan.min / 2))}
            value={clamped}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none bg-gray-200 dark:bg-gray-700"
            style={{
              background: `linear-gradient(to right, ${theme.textLight.includes("amber") ? "#F59E0B" : theme.textLight.includes("emerald") ? "#10B981" : "#6366F1"} 0%, ${theme.textLight.includes("amber") ? "#F59E0B" : theme.textLight.includes("emerald") ? "#10B981" : "#6366F1"} ${sliderPct}%, #e5e7eb ${sliderPct}%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
            <span>Min: ${plan.min.toLocaleString()}</span>
            <span>Max: ${plan.max.toLocaleString()}</span>
          </div>
        </div>

        {/* Potential return banner */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl px-4 py-2.5 space-y-1.5 border border-transparent dark:border-white/5">
          <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Daily Dividends:</span><span className="font-bold text-primary-500">${daily.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Total Yield ({plan.duration}d):</span><span className="font-bold text-primary-500">${total.toFixed(2)}</span></div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6">
        <button
          onClick={() => onInvest(plan, clamped)}
          className={`w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r ${theme.gradient} text-white font-extrabold text-sm rounded-2xl hover:opacity-95 active:scale-95 transition-all shadow-lg hover:shadow-xl`}
        >
          <TrendingUp size={15} /> Invest in Stocks
        </button>
      </div>
    </div>
  );
}

/* ── Payment Method Modal (COPIED FROM BUY-PLAN) ── */
function PaymentMethodModal({ plan, amount, userBalance, onSelectBalance, onSelectCrypto, onClose }: { plan: Plan; amount: number; userBalance: number; onSelectBalance: () => void; onSelectCrypto: () => void; onClose: () => void; }) {
  const router = useRouter();
  const hasEnoughBalance = userBalance >= amount;
  const remainingBalance = userBalance - amount;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center"><DollarSign size={20} className="text-primary-500" /></div>
          <div><h3 className="font-extrabold text-gray-900 dark:text-white">Choose Payment Method</h3><p className="text-xs text-gray-400">{plan.name} - ${amount.toLocaleString()}</p></div>
        </div>
        <div className="space-y-3">
          <button
            onClick={hasEnoughBalance ? onSelectBalance : () => {
              const shortfall = amount - userBalance;
              router.push(`/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(plan.name + " plan")}&required=${amount.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`);
            }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
              hasEnoughBalance
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-300"
                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:border-red-300"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasEnoughBalance ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  <DollarSign size={16} className={hasEnoughBalance ? "text-green-500" : "text-red-500"} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {hasEnoughBalance ? "Pay with Account Balance" : "Deposit Funds (Insufficient Balance)"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hasEnoughBalance ? "Instant activation • No waiting" : "Redirect to deposit page to add funds"}
                  </p>
                </div>
              </div>
              {hasEnoughBalance ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <ArrowRight size={18} className="text-red-500" />
              )}
            </div>
            <div className="flex justify-between text-xs mt-2"><span className="text-gray-500 dark:text-gray-400">Current Balance:</span><span className="font-bold text-gray-900 dark:text-white">${userBalance.toLocaleString()}</span></div>
            {hasEnoughBalance && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">After Purchase:</span>
                <span className="font-bold text-green-600 dark:text-green-400">${remainingBalance.toLocaleString()}</span>
              </div>
            )}
            {!hasEnoughBalance && (
              <div className="flex items-center gap-1 mt-2 text-xs text-red-650 dark:text-red-400 font-bold">
                <AlertCircle size={12} />
                <span>Insufficient balance (Need ${(amount - userBalance).toLocaleString()} more. Click to Deposit)</span>
              </div>
            )}
          </button>
          <button onClick={onSelectCrypto} className="w-full text-left p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-300 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Lock size={16} className="text-blue-500" /></div>
                <div><p className="font-bold text-gray-900 dark:text-white text-sm">Pay with Cryptocurrency</p><p className="text-xs text-gray-500 dark:text-gray-400">Admin approval required • 2-4 hours</p></div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1"><p>✓ Support: BTC, ETH, BNB, SOLANA, USDT</p><p>✓ Upload payment proof after sending</p></div>
          </button>
        </div>
        <div className="mt-5 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2"><AlertCircle size={14} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" /><p className="text-xs text-yellow-800 dark:text-yellow-200">Balance payments are instant. Crypto payments require admin verification before plan activation.</p></div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function StockPlansPage() {
  const router = useRouter();
  const [userBalance, setUserBalance] = useState(0);
  const [hasGeneralSub, setHasGeneralSub] = useState<boolean | null>(null);
  const [paymentMethodPlan, setPaymentMethodPlan] = useState<Plan | null>(null);
  const [paymentMethodAmount, setPaymentMethodAmount] = useState(0);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [confirmAmount, setConfirmAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successPlan, setSuccessPlan] = useState<Plan | null>(null);
  const [successAmount, setSuccessAmount] = useState(0);

  useEffect(() => {
    fetch("/api/user/me").then(r => r.json()).then(d => { if (d?.balance !== undefined) setUserBalance(Number(d.balance)); }).catch(() => {});
    
    fetch("/api/plans")
      .then((r) => r.json())
      .then((plans) => {
        if (Array.isArray(plans)) {
          const subbed = plans.some((p) =>
            ["Test", "Beginner Plan", "Standard plan", "Business plan", "Basic Plan"].includes(p.planName)
          );
          setHasGeneralSub(subbed);
        } else {
          setHasGeneralSub(false);
        }
      })
      .catch(() => setHasGeneralSub(false));
  }, []);

  function handleInvest(plan: Plan, amount: number) { 
    setPaymentMethodPlan(plan); 
    setPaymentMethodAmount(amount); 
    setError(""); 
  }

  function handleSelectBalance() {
    setConfirmPlan(paymentMethodPlan);
    setConfirmAmount(paymentMethodAmount);
    setPaymentMethodPlan(null);
  }

  function handleSelectCrypto() {
    if (!paymentMethodPlan) return;
    router.push(`/dashboard/buy-plan/crypto-payment?plan=${encodeURIComponent(paymentMethodPlan.name)}&amount=${paymentMethodAmount}&rate=${paymentMethodPlan.rate}&duration=${paymentMethodPlan.duration}`);
  }

  async function handleConfirm() {
    if (!confirmPlan) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/plans/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planName: confirmPlan.name, amount: confirmAmount, rate: confirmPlan.rate, duration: confirmPlan.duration }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Investment failed."); setLoading(false); return; }
      setUserBalance(b => b - confirmAmount);
      setSuccessPlan(confirmPlan); setSuccessAmount(confirmAmount); setConfirmPlan(null);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  // ── Loading state ──
  if (hasGeneralSub === null) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  // ── Lock Screen ──
  if (hasGeneralSub === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <Lock size={36} className="text-primary-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Feature Locked</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The Stock Market investment portal is locked. Please subscribe to at least one basic investment plan under the "All Plans" section first to unlock access.
        </p>
        <Link
          href="/dashboard/buy-plan"
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-primary-500/20"
        >
          Browse All Plans
        </Link>
      </div>
    );
  }

  return (
    <>
      {paymentMethodPlan && <PaymentMethodModal plan={paymentMethodPlan} amount={paymentMethodAmount} userBalance={userBalance} onSelectBalance={handleSelectBalance} onSelectCrypto={handleSelectCrypto} onClose={() => setPaymentMethodPlan(null)} />}
      {confirmPlan && <ConfirmModal plan={confirmPlan} amount={confirmAmount} onConfirm={handleConfirm} onClose={() => { setConfirmPlan(null); setError(""); }} loading={loading} error={error} />}
      {successPlan && <SuccessModal plan={successPlan} amount={successAmount} onClose={() => setSuccessPlan(null)} />}
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><Link href="/dashboard" className="hover:text-primary-500 transition-colors">Home</Link>
          <ChevronRight size={11} /><Link href="/dashboard/buy-plan" className="hover:text-primary-500 transition-colors">Investment Plans</Link>
          <ChevronRight size={11} /><span className="text-gray-600 dark:text-gray-300 font-semibold">Stock Market</span>
        </div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center"><BarChart2 size={22} className="text-primary-500" /></div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-primary-500">Stock Market Investment Plans</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Invest in leading companies and build wealth through equity markets</p>
            <div className="flex flex-wrap gap-2">
              {[{ label: "Dividend Income", cls: "bg-red-50 dark:bg-red-900/20 text-primary-500 border-primary-200 dark:border-primary-800" }, { label: "Capital Growth", cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" }, { label: "Proven Returns", cls: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" }].map(b => (
                <span key={b.label} className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${b.cls}`}><TrendingUp size={10} /> {b.label}</span>
              ))}
            </div>
          </div>
          <div className="text-right bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 shadow-sm flex-shrink-0">
            <p className="text-2xl font-black text-primary-500">5-25%</p>
            <p className="text-xs text-gray-400 font-semibold">Annual Returns</p>
          </div>
        </div>
        {/* Global Insights */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-primary-500" /><h3 className="font-extrabold text-gray-900 dark:text-white">Global Stock Market Insights</h3></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[{ value: "$95T", label: "Global Market Cap", color: "text-primary-500" }, { value: "7.5%", label: "Historical Returns", color: "text-blue-600 dark:text-blue-400" }, { value: "60+", label: "Global Exchanges", color: "text-purple-600 dark:text-purple-400" }, { value: "40K+", label: "Listed Companies", color: "text-green-600 dark:text-green-400" }].map(s => (
              <div key={s.label}><p className={`text-xl font-black ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p></div>
            ))}
          </div>
        </div>
        {/* Balance */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign size={14} className="text-primary-500" />
          <span className="text-gray-500 dark:text-gray-400">Your Balance:</span>
          <span className="font-extrabold text-gray-900 dark:text-white">${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {STOCK_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} onInvest={handleInvest} />)}
        </div>
        {/* Why Choose */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5"><BarChart2 size={16} className="text-primary-500" /><h3 className="font-extrabold text-gray-900 dark:text-white">Why Choose Stock Market Investment?</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[{ icon: <Building2 size={20} className="text-primary-500" />, bg: "bg-red-50 dark:bg-red-900/20", title: "Company Ownership", desc: "Own a piece of successful companies and benefit from their growth and success." }, { icon: <DollarSign size={20} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20", title: "Dividend Income", desc: "Receive regular dividend payments from profitable companies as passive income." }, { icon: <TrendingUp size={20} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20", title: "Long-term Growth", desc: "Historically, stocks have provided superior long-term returns compared to other asset classes." }].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${f.bg} flex items-center justify-center flex-shrink-0`}>{f.icon}</div>
                <div><h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{f.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        {/* Portfolio Sectors */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-center mb-6">Our Stock Portfolio Sectors</h3>
          <div className="flex flex-wrap justify-center gap-8">
            {[{ icon: <Zap size={22} className="text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-900/20", label: "Technology" }, { icon: <Globe size={22} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20", label: "Healthcare" }, { icon: <Factory size={22} className="text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-900/20", label: "Energy" }, { icon: <Building2 size={22} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20", label: "Financial" }, { icon: <ShoppingBag size={22} className="text-pink-500" />, bg: "bg-pink-50 dark:bg-pink-900/20", label: "Consumer" }, { icon: <PiggyBank size={22} className="text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-900/20", label: "Industrial" }].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-full ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Strategy & Risk */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5"><Info size={16} className="text-primary-500" /><h3 className="font-extrabold text-gray-900 dark:text-white">Investment Strategy & Risk Management</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-3">Our Investment Approach:</p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                {["Diversified portfolio across multiple sectors", "Professional fund management and analysis", "Focus on blue-chip and growth stocks", "Regular portfolio rebalancing and optimization"].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-3">Risk Considerations:</p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                {["Stock prices can be volatile and may decline", "Market conditions can affect all investments", "Past performance doesn't guarantee future results", "Diversification helps reduce but not eliminate risk"].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
