"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ChevronRight, TrendingUp, Zap, Globe, AlertTriangle, DollarSign, CheckCircle2, AlertCircle, Loader2, X, Lock, Building2 } from "lucide-react";

const CRYPTO_PLANS = [
  { name: "Crypto Starter", tag: "Popular", tagColor: "bg-primary-500", roi: "2.5%", roiLabel: "Daily ROI", min: 100, max: 5000, rate: 2.5, rateLabel: "2.5% Daily", duration: 30, bonus: 10, coin: "BTC", img: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&q=80" },
  { name: "Crypto Growth", tag: "Recommended", tagColor: "bg-green-500", roi: "5%", roiLabel: "Daily ROI", min: 500, max: 20000, rate: 5, rateLabel: "5% Daily", duration: 45, bonus: 25, coin: "ETH", img: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&q=80" },
  { name: "Crypto Premium", tag: "Premium", tagColor: "bg-purple-500", roi: "10%", roiLabel: "Daily ROI", min: 2000, max: 50000, rate: 10, rateLabel: "10% Daily", duration: 60, bonus: 100, coin: "BNB", img: "https://images.unsplash.com/photo-1609554496796-c345a5335ceb?w=400&q=80" },
  { name: "Crypto Elite", tag: "Elite", tagColor: "bg-yellow-500", roi: "15%", roiLabel: "Daily ROI", min: 5000, max: 100000, rate: 15, rateLabel: "15% Daily", duration: 60, bonus: 250, coin: "SOL", img: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&q=80" },
  { name: "Crypto Whale", tag: "VIP", tagColor: "bg-red-600", roi: "25%", roiLabel: "Daily ROI", min: 10000, max: 500000, rate: 25, rateLabel: "25% Daily", duration: 90, bonus: 500, coin: "BTC", img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80" },
  { name: "DeFi Master", tag: "New", tagColor: "bg-blue-500", roi: "35%", roiLabel: "Daily ROI", min: 25000, max: 1000000, rate: 35, rateLabel: "35% Daily", duration: 90, bonus: 1000, coin: "ETH", img: "https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=400&q=80" },
];
type Plan = (typeof CRYPTO_PLANS)[number];

const PORTFOLIO_COINS = [
  { symbol: "₿", label: "Bitcoin",  bg: "bg-orange-100 dark:bg-orange-900/20", color: "text-orange-500" },
  { symbol: "Ξ",  label: "Ethereum", bg: "bg-blue-100 dark:bg-blue-900/20",    color: "text-blue-500"   },
  { symbol: "T",  label: "Tether",   bg: "bg-green-100 dark:bg-green-900/20",  color: "text-green-600"  },
  { symbol: "B",  label: "BNB",      bg: "bg-yellow-100 dark:bg-yellow-900/20",color: "text-yellow-600" },
  { symbol: "S",  label: "Solana",   bg: "bg-purple-100 dark:bg-purple-900/20",color: "text-purple-500" },
  { symbol: "A",  label: "Cardano",  bg: "bg-red-100 dark:bg-red-900/20",      color: "text-primary-500"},
];

function ConfirmModal({ plan, amount, onConfirm, onClose, loading, error }: { plan: Plan; amount: number; onConfirm: () => void; onClose: () => void; loading: boolean; error: string; }) {
  const daily = (amount * plan.rate) / 100;
  const total = daily * plan.duration;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center"><span className="text-xl font-black text-orange-500">₿</span></div>
          <div><h3 className="font-extrabold text-gray-900 dark:text-white">Confirm Crypto Investment</h3><p className="text-xs text-gray-400">{plan.name}</p></div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2 mb-5">
          {[{ l: "Plan", v: plan.name, r: false }, { l: "Amount", v: `$${amount.toLocaleString(undefined,{minimumFractionDigits:2})}`, r: false }, { l: "Return Rate", v: plan.rateLabel, r: true }, { l: "Duration", v: `${plan.duration} Days`, r: false }, { l: "Daily Return", v: `$${daily.toFixed(2)}`, r: true }, { l: `Total (${plan.duration}d)`, v: `$${total.toFixed(2)}`, r: true }].map(row => (
            <div key={row.l} className="flex justify-between text-sm">
              <span className="text-gray-400">{row.l}</span>
              <span className={row.r ? "font-bold text-primary-500" : "font-bold text-gray-900 dark:text-white"}>{row.v}</span>
            </div>
          ))}
        </div>
        {error && <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold"><AlertCircle size={13} className="flex-shrink-0" />{error}</div>}
        <button onClick={onConfirm} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-colors">
          {loading ? <><Loader2 size={15} className="animate-spin" />Processing...</> : <><Lock size={14} />Confirm Investment</>}
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ plan, amount, onClose }: { plan: Plan; amount: number; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5"><CheckCircle2 size={36} className="text-green-500" /></div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Crypto Investment Activated!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You joined <span className="font-bold text-gray-900 dark:text-white">{plan.name}</span></p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6"><span className="font-bold text-primary-500">${amount.toLocaleString(undefined,{minimumFractionDigits:2})}</span> invested successfully.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">View Plans</button>
          <Link href="/dashboard/investments" className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl text-center transition-colors">My Portfolio</Link>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, onInvest }: { plan: Plan; onInvest: (p: Plan, a: number) => void; }) {
  const [amount, setAmount] = useState(plan.min);
  const clamped = Math.min(Math.max(amount, plan.min), plan.max);
  const sliderPct = ((clamped - plan.min) / (plan.max - plan.min)) * 100;
  const daily = (clamped * plan.rate) / 100;
  const total = daily * plan.duration;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-28 overflow-hidden">
        <img src={plan.img} alt={plan.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gray-900/75" />
        {plan.tag && <span className={`absolute top-2 right-2 ${plan.tagColor} text-white text-[10px] font-black px-2 py-0.5 rounded-full`}>→ {plan.tag}</span>}
        <div className="absolute bottom-2 left-3">
          <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-sm font-black text-white">{plan.roi}</span>
            <span className="text-[10px] text-white/80">{plan.roiLabel}</span>
          </div>
          <p className="text-[10px] text-white/70 font-semibold mt-0.5">Crypto · {plan.coin}</p>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
          <div className="text-right"><p className="text-[10px] text-gray-400">Duration</p><p className="text-xs font-bold text-gray-700 dark:text-gray-300">{plan.duration} Days</p></div>
        </div>
        <p className="text-xl font-black text-primary-500">${plan.min.toLocaleString()} <span className="text-sm font-semibold text-gray-400">minimum</span></p>
        <div className="space-y-1.5">
          {[{ l: "Investment Range", v: `$${plan.min.toLocaleString()} - $${plan.max.toLocaleString()}`, r: false, b: false }, { l: "Return Rate", v: plan.rateLabel, r: true, b: false }, { l: "Welcome Bonus", v: `$${plan.bonus}`, r: false, b: true }].map(row => (
            <div key={row.l} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-gray-500 dark:text-gray-400">{row.l}</span>
              <span className={row.r ? "font-bold text-primary-500" : row.b ? "font-bold text-blue-500" : "font-bold text-gray-700 dark:text-gray-300"}>{row.v}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Investment Amount ($)</p>
          <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-primary-500">
            <span className="text-gray-400 font-bold text-sm">$</span>
            <input type="number" min={plan.min} max={plan.max} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="flex-1 bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none" />
          </div>
        </div>
        <input type="range" min={plan.min} max={plan.max} step={Math.max(1, Math.floor(plan.min / 2))} value={clamped} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #E31937 0%, #E31937 ${sliderPct}%, #e5e7eb ${sliderPct}%, #e5e7eb 100%)` }} />
        <div className="flex justify-between text-[10px] text-gray-400"><span>${plan.min.toLocaleString()}</span><span>${plan.max.toLocaleString()}</span></div>
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl px-4 py-2.5 space-y-1">
          <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Daily Return:</span><span className="font-bold text-primary-500">${daily.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">Total Return ({plan.duration}d):</span><span className="font-bold text-primary-500">${total.toFixed(2)}</span></div>
        </div>
        <button onClick={() => onInvest(plan, clamped)} className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
          <TrendingUp size={15} /> Invest in Crypto
        </button>
      </div>
    </div>
  );
}

/* ── Payment Method Modal ── */
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
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center"><TrendingUp size={20} className="text-primary-500" /></div>
          <div><h3 className="font-extrabold text-gray-900 dark:text-white">Select Payment Method</h3><p className="text-xs text-gray-400">{plan.name} - ${amount.toLocaleString()}</p></div>
        </div>
        <div className="space-y-4">
          <button 
            onClick={() => {
              if (hasEnoughBalance) {
                onSelectBalance();
              } else {
                const shortfall = amount - userBalance;
                router.push(`/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(plan.name)}&required=${amount.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`);
              }
            }} 
            className="w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center"><DollarSign size={16} className="text-primary-500" /></div>
                <div><p className="font-bold text-gray-900 dark:text-white text-sm">Account Balance</p><p className="text-xs text-gray-500 dark:text-gray-450">Pay instantly using your balance</p></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-2"><span className="text-gray-500 dark:text-gray-455">Current Balance:</span><span className="font-bold text-gray-900 dark:text-white">${userBalance.toLocaleString()}</span></div>
            {hasEnoughBalance && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-455">After Purchase:</span>
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
                <div><p className="font-bold text-gray-900 dark:text-white text-sm">Pay with Cryptocurrency</p><p className="text-xs text-gray-500 dark:text-gray-405">Admin approval required • 2-4 hours</p></div>
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

export default function CryptoPlansPage() {
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
          The Cryptocurrency investment portal is locked. Please subscribe to at least one basic investment plan under the "All Plans" section first to unlock access.
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
          <ChevronRight size={11} /><span className="text-gray-600 dark:text-gray-300 font-semibold">Cryptocurrency</span>
        </div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-black text-primary-500">₿</span>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-primary-500">Cryptocurrency Investment Plans</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Capitalize on the digital currency revolution with high-yield crypto investments</p>
            <div className="flex flex-wrap gap-2">
              {[{ label: "High Returns", cls: "bg-red-50 dark:bg-red-900/20 text-primary-500 border-primary-200 dark:border-primary-800" }, { label: "Quick Profits", cls: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" }, { label: "Secure Trading", cls: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" }].map(b => (
                <span key={b.label} className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${b.cls}`}><TrendingUp size={10} /> {b.label}</span>
              ))}
            </div>
          </div>
          <div className="text-right bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 shadow-sm flex-shrink-0">
            <p className="text-2xl font-black text-primary-500">8-35%</p>
            <p className="text-xs text-gray-400 font-semibold">Daily Returns</p>
          </div>
        </div>
        {/* Market Insights */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-primary-500" /><h3 className="font-extrabold text-gray-900 dark:text-white">Cryptocurrency Market Insights</h3></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[{ value: "$1.2T", label: "Total Market Cap", color: "text-primary-500" }, { value: "24/7", label: "Trading Hours", color: "text-blue-600 dark:text-blue-400" }, { value: "10K+", label: "Active Coins", color: "text-purple-600 dark:text-purple-400" }, { value: "100M+", label: "Global Users", color: "text-green-600 dark:text-green-400" }].map(s => (
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
          {CRYPTO_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} onInvest={handleInvest} />)}
        </div>
        {/* Why Choose */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5"><TrendingUp size={16} className="text-primary-500" /><h3 className="font-extrabold text-gray-900 dark:text-white">Why Choose Cryptocurrency Investment?</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[{ icon: <TrendingUp size={20} className="text-primary-500" />, bg: "bg-red-50 dark:bg-red-900/20", title: "High Growth Potential", desc: "Cryptocurrency offers exceptional growth opportunities with potential for significant returns." }, { icon: <Zap size={20} className="text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-900/20", title: "24/7 Trading", desc: "Unlike traditional markets, crypto markets never close, providing continuous trading opportunities." }, { icon: <Globe size={20} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20", title: "Global Access", desc: "Access global cryptocurrency markets without geographical restrictions or traditional banking limitations." }].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${f.bg} flex items-center justify-center flex-shrink-0`}>{f.icon}</div>
                <div><h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{f.title}</h4><p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        {/* Portfolio */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-center mb-6">Our Cryptocurrency Portfolio</h3>
          <div className="flex flex-wrap justify-center gap-8">
            {PORTFOLIO_COINS.map(c => (
              <div key={c.label} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-full ${c.bg} flex items-center justify-center`}><span className={`text-xl font-black ${c.color}`}>{c.symbol}</span></div>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Risk Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-yellow-700 dark:text-yellow-400 mb-1">Important Risk Notice</p>
            <p className="text-xs text-yellow-700/80 dark:text-yellow-300/80 leading-relaxed">Cryptocurrency investments are highly volatile and carry significant risk. Prices can fluctuate dramatically in short periods. Only invest what you can afford to lose. Past performance does not guarantee future results.</p>
          </div>
        </div>
      </div>
    </>
  );
}
