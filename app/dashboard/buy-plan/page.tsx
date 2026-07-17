"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  TrendingUp as GrowIcon,
  ArrowRight,
} from "lucide-react";

// ── Plan definitions (exactly from screenshots) ──────────────────────────────
const PLANS = [
  {
    name: "Test",
    roi: "156% ROI",
    minAmount: 500,
    maxAmount: 2999,
    rate: 156,
    rateLabel: "156% Every 30 Minutes",
    duration: 5,
    durationUnit: "Days",
    category: "general",
  },
  {
    name: "Beginner Plan",
    roi: "100% ROI",
    minAmount: 100,
    maxAmount: 25000,
    rate: 100,
    rateLabel: "100% Daily",
    duration: 60,
    durationUnit: "Days",
    category: "general",
  },
  {
    name: "Standard plan",
    roi: "2.5% ROI",
    minAmount: 25000,
    maxAmount: 100000,
    rate: 2.5,
    rateLabel: "2.5% Daily",
    duration: 60,
    durationUnit: "Days",
    category: "general",
  },
  {
    name: "Business plan",
    roi: "3.1% ROI",
    minAmount: 100000,
    maxAmount: 1000000,
    rate: 3.1,
    rateLabel: "3.1% Daily",
    duration: 60,
    durationUnit: "Days",
    category: "general",
  },
  {
    name: "Basic Plan",
    roi: "25% ROI",
    minAmount: 3000,
    maxAmount: 29999,
    rate: 25,
    rateLabel: "25% Daily",
    duration: 5,
    durationUnit: "Days",
    category: "general",
  },
  {
    name: "Stock Starter Plan",
    roi: "1.5% ROI",
    minAmount: 100,
    maxAmount: 500,
    rate: 1.5,
    rateLabel: "1.5% Daily",
    duration: 30,
    durationUnit: "Days",
    category: "stock",
  },
  {
    name: "Stock Growth Plan",
    roi: "2.5% ROI",
    minAmount: 500,
    maxAmount: 2000,
    rate: 2.5,
    rateLabel: "2.5% Daily",
    duration: 45,
    durationUnit: "Days",
    category: "stock",
  },
  {
    name: "Stock Premium Plan",
    roi: "4.0% ROI",
    minAmount: 2000,
    maxAmount: 10000,
    rate: 4.0,
    rateLabel: "4.0% Daily",
    duration: 60,
    durationUnit: "Days",
    category: "stock",
  },
  {
    name: "Stock Elite Plan",
    roi: "6.0% ROI",
    minAmount: 10000,
    maxAmount: 50000,
    rate: 6.0,
    rateLabel: "6.0% Daily",
    duration: 90,
    durationUnit: "Days",
    category: "stock",
  },
];

type Plan = (typeof PLANS)[number];

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

// ── Single P// Helper to get card styles depending on the plan name
function getPlanTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("business") || n.includes("elite") || n.includes("premium") || n === "test") {
    return {
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
      bgLight: "bg-amber-500/10",
      textLight: "text-amber-500",
      borderGlow: "hover:border-amber-500/40 hover:shadow-amber-500/10",
      badge: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 border border-amber-500/30",
      perks: ["Priority Support", "High-Yield Premium", "Protected Capital Base"],
    };
  }
  if (n.includes("growth") || n.includes("standard") || n.includes("basic")) {
    return {
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgLight: "bg-emerald-500/10",
      textLight: "text-emerald-500",
      borderGlow: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
      badge: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border border-emerald-500/30",
      perks: ["Automated Compound", "Standard Priority", "Protected Capital Base"],
    };
  }
  // Default/Starter themes
  return {
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgLight: "bg-blue-500/10",
    textLight: "text-blue-500",
    borderGlow: "hover:border-blue-500/40 hover:shadow-blue-500/10",
    badge: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 border border-blue-500/30",
    perks: ["Instant Allocation", "Flexible Withdrawals", "Protected Capital Base"],
  };
}

// ── Single Plan Card ──────────────────────────────────────────────────────────
function PlanCard({
  plan,
  onJoin,
}: {
  plan: Plan;
  onJoin: (plan: Plan, amount: number) => void;
}) {
  const [amount, setAmount] = useState(plan.minAmount);

  const clamped = Math.min(Math.max(amount, plan.minAmount), plan.maxAmount);
  const dailyReturn = (clamped * plan.rate) / 100;
  const returnLabel = plan.rateLabel.includes("Minutes")
    ? `${fmt(dailyReturn)} Every 30 Minutes`
    : `${fmt(dailyReturn)} Daily`;

  const sliderPct =
    ((clamped - plan.minAmount) / (plan.maxAmount - plan.minAmount)) * 100;

  const theme = getPlanTheme(plan.name);

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
        
        <p className="text-xs uppercase font-extrabold tracking-widest text-white/70 mb-1">Investment Tier</p>
        <h3 className="text-2xl font-black tracking-tight mb-4">
          {plan.name}
        </h3>
        
        <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-2">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/75 tracking-wider">Minimum Entry</p>
            <p className="text-2xl font-black tracking-tight">{fmt(plan.minAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-white/75 tracking-wider">Duration</p>
            <p className="text-lg font-black tracking-tight">{plan.duration} {plan.durationUnit}</p>
          </div>
        </div>
      </div>

      {/* Perks and details */}
      <div className="px-6 py-5 space-y-3 flex-1">
        <p className="text-xs font-bold text-gray-405 dark:text-gray-400 uppercase tracking-wider mb-2">Plan Benefits</p>
        <div className="grid grid-cols-1 gap-2">
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
            <span className="text-gray-400 block">Rate</span>
            <span className={`text-sm font-extrabold ${theme.textLight}`}>{plan.rateLabel}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Max Limit</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">{fmt(plan.maxAmount)}</span>
          </div>
        </div>
      </div>

      {/* Amount input + slider */}
      <div className="px-6 pb-2 space-y-3.5 bg-gray-50/50 dark:bg-gray-800/40 py-4 border-t border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Amount to Invest ($)
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
            min={plan.minAmount}
            max={plan.maxAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 bg-transparent text-sm font-black text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Slider */}
        <div className="relative pt-1">
          <input
            type="range"
            min={plan.minAmount}
            max={plan.maxAmount}
            step={plan.minAmount}
            value={clamped}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none bg-gray-200 dark:bg-gray-700"
            style={{
              background: `linear-gradient(to right, ${theme.textLight.includes("amber") ? "#F59E0B" : theme.textLight.includes("emerald") ? "#10B981" : "#6366F1"} 0%, ${theme.textLight.includes("amber") ? "#F59E0B" : theme.textLight.includes("emerald") ? "#10B981" : "#6366F1"} ${sliderPct}%, #e5e7eb ${sliderPct}%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
            <span>Min: {fmt(plan.minAmount)}</span>
            <span>Max: {fmt(plan.maxAmount)}</span>
          </div>
        </div>

        {/* Potential return banner */}
        <div className={`p-3 rounded-2xl ${theme.bgLight} border border-transparent dark:border-white/5 text-center transition-all duration-300`}>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Est. Return:{" "}
            <span className={`font-black text-sm ${theme.textLight}`}>{returnLabel}</span>
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6">
        <button
          onClick={() => onJoin(plan, clamped)}
          className={`w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r ${theme.gradient} text-white font-extrabold text-sm rounded-2xl hover:opacity-95 active:scale-95 transition-all shadow-lg hover:shadow-xl`}
        >
          <Lock size={15} /> Join {plan.name}
        </button>
      </div>
    </div>
  );
}

// ── Payment Method Selection Modal ───────────────────────────────────────────
function PaymentMethodModal({
  plan,
  amount,
  userBalance,
  onSelectBalance,
  onSelectCrypto,
  onClose,
}: {
  plan: Plan;
  amount: number;
  userBalance: number;
  onSelectBalance: () => void;
  onSelectCrypto: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const hasEnoughBalance = userBalance >= amount;
  const remainingBalance = userBalance - amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <DollarSign size={20} className="text-primary-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white">
              Choose Payment Method
            </h3>
            <p className="text-xs text-gray-400">
              {plan.name} - {fmt(amount)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Option 1: Pay with Balance */}
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
                  <p className="font-bold text-gray-950 dark:text-white text-sm">
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
            <div className="flex justify-between text-xs mt-2">
              <span className="text-gray-500 dark:text-gray-400">
                Current Balance:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {fmt(userBalance)}
              </span>
            </div>
            {hasEnoughBalance && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">
                  After Purchase:
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {fmt(remainingBalance)}
                </span>
              </div>
            )}
            {!hasEnoughBalance && (
              <div className="flex items-center gap-1 mt-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={12} />
                <span>
                  Insufficient balance (Need {fmt(amount - userBalance)} more. Click to Deposit)
                </span>
              </div>
            )}
          </button>

          {/* Option 2: Pay with Crypto */}
          <button
            onClick={onSelectCrypto}
            className="w-full text-left p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Pay with Cryptocurrency
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin approval required • 2-4 hours
                  </p>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p>✓ Support: BTC, ETH, BNB, SOLANA, USDT</p>
              <p>✓ Upload payment proof after sending</p>
            </div>
          </button>
        </div>

        <div className="mt-5 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle
              size={14}
              className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Balance payments are instant. Crypto payments require admin
              verification before plan activation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  plan,
  amount,
  onConfirm,
  onClose,
  loading,
  error,
}: {
  plan: Plan;
  amount: number;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  error: string;
}) {
  const dailyReturn = (amount * plan.rate) / 100;
  const returnLabel = plan.rateLabel.includes("Minutes")
    ? `${fmt(dailyReturn)} Every 30 Minutes`
    : `${fmt(dailyReturn)} Daily`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-primary-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white">
              Confirm Investment
            </h3>
            <p className="text-xs text-gray-400">{plan.name}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2 mb-5">
          {[
            { label: "Plan", value: plan.name },
            { label: "Investment Amount", value: fmt(amount) },
            { label: "Return Rate", value: plan.rateLabel, red: true },
            {
              label: "Duration",
              value: `${plan.duration} ${plan.durationUnit}`,
            },
            { label: "Potential Return", value: returnLabel, red: true },
          ].map((r) => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {r.label}
              </span>
              <span
                className={
                  r.red
                    ? "font-bold text-primary-500"
                    : "font-bold text-gray-900 dark:text-white"
                }
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold">
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </div>
        )}

        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Lock size={14} /> Confirm & Join Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({
  plan,
  amount,
  onClose,
}: {
  plan: Plan;
  amount: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={36} className="text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
          Investment Activated!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          You have successfully joined the{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {plan.name}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span className="font-bold text-primary-500">{fmt(amount)}</span> has
          been deducted from your balance.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View More Plans
          </button>
          <Link
            href="/dashboard/investments"
            className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl text-center transition-colors"
          >
            My Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BuyPlanPage() {
  const router = useRouter();
  const [userBalance, setUserBalance] = useState(0);
  const [balanceLoaded, setBalanceLoaded] = useState(false);

  // Modal state
  const [paymentMethodPlan, setPaymentMethodPlan] = useState<Plan | null>(null);
  const [paymentMethodAmount, setPaymentMethodAmount] = useState(0);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [confirmAmount, setConfirmAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successPlan, setSuccessPlan] = useState<Plan | null>(null);
  const [successAmount, setSuccessAmount] = useState(0);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.balance !== undefined) setUserBalance(Number(d.balance));
        setBalanceLoaded(true);
      })
      .catch(() => setBalanceLoaded(true));
  }, []);

  function handleJoin(plan: Plan, amount: number) {
    // Clamp amount to plan limits
    const clamped = Math.min(Math.max(amount, plan.minAmount), plan.maxAmount);
    // Show payment method selection FIRST
    setPaymentMethodPlan(plan);
    setPaymentMethodAmount(clamped);
    setError("");
  }

  function handleSelectBalance() {
    // User chose balance payment - show confirmation
    setConfirmPlan(paymentMethodPlan);
    setConfirmAmount(paymentMethodAmount);
    setPaymentMethodPlan(null);
  }

  function handleSelectCrypto() {
    // User chose crypto - redirect to crypto payment page
    if (!paymentMethodPlan) return;
    router.push(
      `/dashboard/buy-plan/crypto-payment?plan=${encodeURIComponent(paymentMethodPlan.name)}&amount=${paymentMethodAmount}&rate=${paymentMethodPlan.rate}&duration=${paymentMethodPlan.duration}`
    );
  }

  async function handleConfirm() {
    if (!confirmPlan) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/plans/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: confirmPlan.name,
          amount: confirmAmount,
          rate: confirmPlan.rate,
          duration: confirmPlan.duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join plan. Please try again.");
        setLoading(false);
        return;
      }

      // Update local balance
      setUserBalance((b) => b - confirmAmount);
      setSuccessPlan(confirmPlan);
      setSuccessAmount(confirmAmount);
      setConfirmPlan(null);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Payment method selection modal */}
      {paymentMethodPlan && (
        <PaymentMethodModal
          plan={paymentMethodPlan}
          amount={paymentMethodAmount}
          userBalance={userBalance}
          onSelectBalance={handleSelectBalance}
          onSelectCrypto={handleSelectCrypto}
          onClose={() => setPaymentMethodPlan(null)}
        />
      )}

      {/* Confirm modal (for balance payments) */}
      {confirmPlan && (
        <ConfirmModal
          plan={confirmPlan}
          amount={confirmAmount}
          onConfirm={handleConfirm}
          onClose={() => { setConfirmPlan(null); setError(""); }}
          loading={loading}
          error={error}
        />
      )}

      {/* Success modal */}
      {successPlan && (
        <SuccessModal
          plan={successPlan}
          amount={successAmount}
          onClose={() => setSuccessPlan(null)}
        />
      )}

      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
              <Home size={11} />
              <Link href="/dashboard" className="hover:text-primary-500 transition-colors">Home</Link>
              <ChevronRight size={11} />
              <span className="text-gray-600 dark:text-gray-300 font-semibold">Investment Plans</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
              Investment Plans
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Upgrade your account with our high-yield investment opportunities
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance display */}
            {balanceLoaded && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
                <DollarSign size={14} className="text-primary-500" />
                <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                <span className="font-extrabold text-gray-900 dark:text-white">
                  ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <button
              onClick={() => router.push("/dashboard/investments")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-primary-500 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors"
            >
              <GrowIcon size={15} /> Grow Your Portfolio
            </button>
          </div>
        </div>

        {/* ── Plans Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} onJoin={handleJoin} />
          ))}
        </div>

        {/* ── Investment Guide ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <AlertCircle size={16} className="text-primary-500" />
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white">Investment Guide</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <DollarSign size={22} className="text-green-500" />,
                bg: "bg-green-50 dark:bg-green-900/20",
                title: "Choose your plan",
                desc: "Select an investment plan that matches your financial goals and risk tolerance.",
              },
              {
                icon: <ShieldCheck size={22} className="text-primary-500" />,
                bg: "bg-red-50 dark:bg-red-900/20",
                title: "Invest securely",
                desc: "Your funds are securely managed with state-of-the-art investment strategies.",
              },
              {
                icon: <TrendingUp size={22} className="text-purple-500" />,
                bg: "bg-purple-50 dark:bg-purple-900/20",
                title: "Earn returns",
                desc: "Watch your investment grow with competitive returns deposited directly to your account.",
              },
            ].map((g) => (
              <div key={g.title} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full ${g.bg} flex items-center justify-center flex-shrink-0`}>
                  {g.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{g.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
