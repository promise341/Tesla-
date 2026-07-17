"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Search, Star, Users, TrendingUp, CheckCircle2, AlertCircle,
  Loader2, X, ShieldCheck, SlidersHorizontal, ChevronDown, ArrowLeft,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Expert Data
───────────────────────────────────────────── */
const EXPERTS = [
  { id: 1,  name: "Isabella Foster",  specialty: "Fixed Income",      category: "Bonds",    avatar: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5, followers: 13801, winRate: 93, totalReturn: "+124,500%", equity: 385000, totalTrades: 2789,  minInvest: 3800,  dailyRate: 2.5, bio: "Fixed income and bond trading expert with institutional background. Specialises in sovereign and corporate debt instruments.", color: "" },
  { id: 2,  name: "Alex Thompson",    specialty: "Forex Expert",      category: "Forex",    avatar: "", rating: 5, followers: 235, winRate: 92, totalReturn: "+86%", equity: 125000, totalTrades: 1547, minInvest: 100, dailyRate: 1.8, bio: "Experienced forex trader specialising in major currency pairs with a focus on risk-adjusted returns.", color: "bg-gray-400" },
  { id: 3,  name: "Stacy R. Hall",    specialty: "Equity Trader",     category: "Stocks",   avatar: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5, followers: 4200, winRate: 80, totalReturn: "+62%", equity: 95000, totalTrades: 3100, minInvest: 6500, dailyRate: 1.5, bio: "Professional equity trader focused on US large-cap growth stocks and momentum strategies.", color: "" },
  { id: 4,  name: "Jarvis B. Buckley", specialty: "Crypto Specialist", category: "Crypto",  avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, followers: 8900, winRate: 80, totalReturn: "+215%", equity: 210000, totalTrades: 5600, minInvest: 20000, dailyRate: 3.0, bio: "Crypto market specialist with deep expertise in BTC, ETH, and DeFi protocol trading.", color: "" },
  { id: 5,  name: "Mara Dao",         specialty: "Commodities",       category: "Commodities", avatar: "https://randomuser.me/api/portraits/women/29.jpg", rating: 5, followers: 1100, winRate: 80, totalReturn: "+44%", equity: 65000, totalTrades: 900, minInvest: 4000, dailyRate: 1.2, bio: "Commodities trader focused on gold, silver, and energy futures with macro overlay.", color: "" },
  { id: 6,  name: "James Whitfield",  specialty: "Options Trader",    category: "Stocks",   avatar: "https://randomuser.me/api/portraits/men/45.jpg", rating: 5, followers: 3200, winRate: 87, totalReturn: "+98%", equity: 175000, totalTrades: 2100, minInvest: 5000, dailyRate: 2.0, bio: "Options strategist specialising in covered calls, iron condors and volatility plays on S&P 500.", color: "" },
  { id: 7,  name: "Sofia Reyes",      specialty: "Tech Stocks",       category: "Stocks",   avatar: "https://randomuser.me/api/portraits/women/55.jpg", rating: 5, followers: 6700, winRate: 91, totalReturn: "+310%", equity: 420000, totalTrades: 4300, minInvest: 2500, dailyRate: 2.8, bio: "Technology sector specialist with a track record in FAANG and semiconductor stocks.", color: "" },
  { id: 8,  name: "Marcus Chen",      specialty: "Quantitative",      category: "Stocks",   avatar: "https://randomuser.me/api/portraits/men/60.jpg", rating: 5, followers: 2900, winRate: 94, totalReturn: "+180%", equity: 300000, totalTrades: 7800, minInvest: 10000, dailyRate: 3.2, bio: "Quant trader leveraging statistical arbitrage and machine learning models across equities and futures.", color: "" },
  { id: 9,  name: "Priya Patel",      specialty: "Emerging Markets",  category: "Forex",    avatar: "https://randomuser.me/api/portraits/women/72.jpg", rating: 4, followers: 1500, winRate: 78, totalReturn: "+55%", equity: 80000, totalTrades: 1200, minInvest: 3000, dailyRate: 1.4, bio: "Emerging markets specialist covering India, Brazil, and Southeast Asian equities and currencies.", color: "" },
  { id: 10, name: "David Laurent",    specialty: "Real Estate ETFs",  category: "Stocks",   avatar: "https://randomuser.me/api/portraits/men/22.jpg", rating: 4, followers: 850, winRate: 76, totalReturn: "+38%", equity: 55000, totalTrades: 680, minInvest: 2000, dailyRate: 1.1, bio: "Real estate investment specialist focused on REITs and property sector ETFs globally.", color: "" },
  { id: 11, name: "Amara Osei",       specialty: "African Markets",   category: "Stocks",   avatar: "https://randomuser.me/api/portraits/women/81.jpg", rating: 5, followers: 3400, winRate: 85, totalReturn: "+74%", equity: 110000, totalTrades: 1900, minInvest: 1500, dailyRate: 1.7, bio: "Pioneer in African stock market trading covering JSE, NSE, and GSE with deep local knowledge.", color: "" },
  { id: 12, name: "Lucas Hoffmann",   specialty: "European Equities", category: "Stocks",   avatar: "https://randomuser.me/api/portraits/men/77.jpg", rating: 5, followers: 4100, winRate: 89, totalReturn: "+112%", equity: 190000, totalTrades: 3300, minInvest: 4500, dailyRate: 2.1, bio: "European equity specialist covering DAX, FTSE and CAC 40 with value-investing approach.", color: "" },
  { id: 13, name: "Yuna Kim",         specialty: "Asian Forex",       category: "Forex",    avatar: "https://randomuser.me/api/portraits/women/37.jpg", rating: 5, followers: 5200, winRate: 90, totalReturn: "+145%", equity: 230000, totalTrades: 4700, minInvest: 3500, dailyRate: 2.4, bio: "Asian currency specialist with expertise in JPY, CNH, and KRW pairs against USD.", color: "" },
  { id: 14, name: "Omar Khalil",      specialty: "Oil & Gas",         category: "Commodities", avatar: "https://randomuser.me/api/portraits/men/88.jpg", rating: 4, followers: 2100, winRate: 82, totalReturn: "+67%", equity: 140000, totalTrades: 1600, minInvest: 7500, dailyRate: 1.6, bio: "Energy sector trader specialising in crude oil, natural gas, and oil company equities.", color: "" },
  { id: 15, name: "Rachel Stone",     specialty: "Biotech Stocks",    category: "Stocks",   avatar: "https://randomuser.me/api/portraits/women/11.jpg", rating: 5, followers: 3800, winRate: 88, totalReturn: "+195%", equity: 260000, totalTrades: 2900, minInvest: 5500, dailyRate: 2.7, bio: "Biotech and pharma trading specialist with deep sector research and FDA catalyst event trading.", color: "" },
  { id: 16, name: "Tomás Vidal",      specialty: "LatAm Markets",     category: "Forex",    avatar: "https://randomuser.me/api/portraits/men/14.jpg", rating: 4, followers: 970, winRate: 77, totalReturn: "+41%", equity: 72000, totalTrades: 820, minInvest: 2500, dailyRate: 1.3, bio: "Latin American equities and forex trader covering BRL, MXN, and local exchanges.", color: "" },
  { id: 17, name: "Aisha Mensah",     specialty: "ESG Investing",     category: "Stocks",   avatar: "https://randomuser.me/api/portraits/women/23.jpg", rating: 5, followers: 2700, winRate: 83, totalReturn: "+59%", equity: 98000, totalTrades: 1450, minInvest: 3000, dailyRate: 1.5, bio: "ESG-focused portfolio manager integrating environmental and social factors into equity selection.", color: "" },
  { id: 18, name: "Chen Wei",         specialty: "Crypto Futures",    category: "Crypto",   avatar: "https://randomuser.me/api/portraits/men/51.jpg", rating: 5, followers: 11200, winRate: 86, totalReturn: "+280%", equity: 350000, totalTrades: 6200, minInvest: 8000, dailyRate: 3.5, bio: "Crypto derivatives specialist trading BTC and ETH perpetual futures with high precision.", color: "" },
  { id: 19, name: "Nadia Volkov",     specialty: "Macro Trading",     category: "Forex",    avatar: "https://randomuser.me/api/portraits/women/62.jpg", rating: 5, followers: 4600, winRate: 91, totalReturn: "+133%", equity: 205000, totalTrades: 2400, minInvest: 6000, dailyRate: 2.3, bio: "Global macro trader navigating interest rate cycles, geopolitical events, and FX trends.", color: "" },
  { id: 20, name: "Kevin O'Brien",    specialty: "Small Cap Value",   category: "Stocks",   avatar: "https://randomuser.me/api/portraits/men/39.jpg", rating: 4, followers: 1300, winRate: 79, totalReturn: "+49%", equity: 85000, totalTrades: 1100, minInvest: 2000, dailyRate: 1.2, bio: "Small-cap value investor hunting undervalued US and Canadian equities with strong fundamentals.", color: "" },
];

type Expert = (typeof EXPERTS)[number];
type SortKey = "winRate" | "followers" | "minInvest" | "dailyRate";

const CATEGORIES = ["All", "Crypto", "Forex", "Stocks", "Commodities", "Bonds"];
const SORT_OPTIONS: { label: string; key: SortKey; asc: boolean }[] = [
  { label: "Highest Win Rate", key: "winRate",   asc: false },
  { label: "Most Followers",   key: "followers", asc: false },
  { label: "Best Daily Rate",  key: "dailyRate", asc: false },
  { label: "Lowest Minimum",   key: "minInvest", asc: true  },
];

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function Avatar({ expert }: { expert: Expert }) {
  if (expert.avatar) {
    return <img src={expert.avatar} alt={expert.name} className="w-16 h-16 rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover" />;
  }
  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black ${expert.color || "bg-primary-500"}`}>
      {expert.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  );
}

function ExpertCard({
  expert, onCopy, canAfford, isCopying,
}: {
  expert: Expert;
  onCopy: (e: Expert) => void;
  canAfford: boolean;
  isCopying: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative ${
      isCopying
        ? "border-green-400 dark:border-green-600 ring-1 ring-green-400/40"
        : canAfford
          ? "border-gray-200 dark:border-gray-700"
          : "border-gray-200 dark:border-gray-700 opacity-70"
    }`}>

      {/* Already Copying badge */}
      {isCopying && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-[10px] font-black text-center py-1 flex items-center justify-center gap-1">
          <CheckCircle2 size={10} /> Currently Copying
        </div>
      )}

      <div className={`px-5 ${isCopying ? "pt-7" : "pt-4"} flex justify-end`}>
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
        </span>
      </div>

      <div className="flex flex-col items-center px-5 pb-3 gap-1">
        <Avatar expert={expert} />
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white text-center mt-2">{expert.name}</h3>
        <p className="text-xs text-gray-400">{expert.specialty}</p>
        <Stars rating={expert.rating} />
        <p className="text-[11px] text-gray-400 flex items-center gap-1"><Users size={10} /> {expert.followers.toLocaleString()} followers</p>
      </div>

      <div className="grid grid-cols-2 border-t border-gray-100 dark:border-gray-700">
        <div className="p-3 text-center border-r border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 mb-1">Win Rate</p>
          <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-700 mb-1 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${expert.winRate}%` }} />
          </div>
          <p className="text-base font-black text-green-600 dark:text-green-400">{expert.winRate}%</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] text-gray-400 mb-1">Total Return</p>
          <p className="text-base font-black text-green-500 mt-3">{expert.totalReturn}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-gray-100 dark:border-gray-700">
        <div className="p-3 text-center border-r border-gray-100 dark:border-gray-700">
          <p className="text-sm font-black text-gray-900 dark:text-white">${(expert.equity/1000).toFixed(0)}K</p>
          <p className="text-[10px] text-gray-400">Equity</p>
        </div>
        <div className="p-3 text-center border-r border-gray-100 dark:border-gray-700">
          <p className="text-sm font-black text-gray-900 dark:text-white">{expert.totalTrades.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400">Trades</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-sm font-black text-green-600 dark:text-green-400">{expert.dailyRate}%</p>
          <p className="text-[10px] text-gray-400">Daily</p>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{expert.bio}</p>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mt-auto gap-3">
        <div>
          <p className="text-[10px] text-gray-400">Min. Investment</p>
          <p className={`text-sm font-extrabold ${canAfford ? "text-gray-900 dark:text-white" : "text-red-500"}`}>
            ${expert.minInvest.toLocaleString()}
          </p>
          {!canAfford && !isCopying && (
            <p className="text-[9px] text-red-400 font-semibold">Insufficient balance</p>
          )}
        </div>
        {isCopying ? (
          <span className="flex items-center gap-1.5 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl">
            <CheckCircle2 size={12} /> Copying
          </span>
        ) : (
          <button
            onClick={() => onCopy(expert)}
            className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl transition-colors ${
              canAfford
                ? "bg-primary-500 hover:bg-primary-600"
                : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
            }`}
            disabled={!canAfford}
            title={!canAfford ? `Deposit at least $${expert.minInvest.toLocaleString()} to copy this expert` : ""}
          >
            <TrendingUp size={13} /> Copy
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Copy Modal
───────────────────────────────────────────── */
function CopyModal({ expert, userBalance, onClose, onSuccess }: {
  expert: Expert; userBalance: number; onClose: () => void; onSuccess: (n: number) => void;
}) {
  const [amount, setAmount] = useState(expert.minInvest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (amount < expert.minInvest) { setError(`Minimum investment is $${expert.minInvest.toLocaleString()}.`); return; }
    if (userBalance <= 0) {
      setError(`You have no funds available. Please deposit at least $${expert.minInvest.toLocaleString()} to start copy trading.`);
      return;
    }
    if (amount > userBalance) {
      setError(`Insufficient balance. You have $${userBalance.toFixed(2)} — you need $${amount.toLocaleString()} to copy ${expert.name}. Please deposit more funds.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copy-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertName: expert.name, amount }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed. Please try again."); return; }
      onSuccess(amount);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const quickAmounts = [expert.minInvest, expert.minInvest * 2, expert.minInvest * 5, expert.minInvest * 10];
  const projectedMonthly = ((amount * expert.dailyRate) / 100) * 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-5">
          <Avatar expert={expert} />
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white">{expert.name}</h3>
            <p className="text-xs text-gray-400">{expert.specialty}</p>
            <Stars rating={expert.rating} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
          {[
            { label: "Win Rate",     value: `${expert.winRate}%`,        green: true  },
            { label: "Total Return", value: expert.totalReturn,           green: true  },
            { label: "Daily Rate",   value: `${expert.dailyRate}%/day`,  green: true  },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-sm font-black ${s.green ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>{s.value}</p>
              <p className="text-[9px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Investment Amount ($)</label>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-3 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-primary-500">
              <span className="text-gray-400 font-bold">$</span>
              <input type="number" min={expert.minInvest} value={amount}
                onChange={(e) => { setAmount(Number(e.target.value)); setError(""); }}
                className="flex-1 bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none" />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Min: <span className="font-bold text-gray-700 dark:text-gray-300">${expert.minInvest.toLocaleString()}</span></span>
              <span>Your balance: <span className={`font-bold ${userBalance >= expert.minInvest ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>${userBalance.toFixed(2)}</span></span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map((v) => (
              <button key={v} type="button" onClick={() => setAmount(v)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${amount === v ? "bg-primary-500 text-white border-primary-500" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400"}`}>
                ${v.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Projected earnings */}
          {amount >= expert.minInvest && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <p className="text-[10px] font-bold text-green-700 dark:text-green-400 mb-1.5">📈 Projected Returns</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Daily", value: `$${((amount * expert.dailyRate) / 100).toFixed(2)}` },
                  { label: "Weekly", value: `$${((amount * expert.dailyRate) / 100 * 7).toFixed(2)}` },
                  { label: "Monthly", value: `$${projectedMonthly.toFixed(2)}` },
                ].map(r => (
                  <div key={r.label}>
                    <p className="text-sm font-black text-green-600 dark:text-green-400">{r.value}</p>
                    <p className="text-[9px] text-green-600 dark:text-green-500">{r.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-green-600 dark:text-green-500 mt-1.5 text-center">*Estimated based on {expert.dailyRate}% daily rate. Past returns do not guarantee future performance.</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <div>
                <p>{error}</p>
                {(error.includes("Insufficient") || error.includes("no funds")) && (
                  <a href="/dashboard/wallet/deposit" className="mt-2 inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 font-bold underline">
                    Deposit funds now →
                  </a>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-colors">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : <><TrendingUp size={14} /> Start Copy Trading</>}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Success Modal
───────────────────────────────────────────── */
function SuccessModal({ expert, amount, onClose }: { expert: Expert; amount: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={36} className="text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Copy Trading Started!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          You are now copying <span className="font-bold text-gray-900 dark:text-white">{expert.name}</span>.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span className="font-bold text-primary-500">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> allocated successfully.
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-6">
          Estimated: +${((amount * expert.dailyRate / 100) * 30).toFixed(2)} / month at {expert.dailyRate}% daily
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            View More Experts
          </button>
          <Link href="/dashboard/copy/dashboard" className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl text-center transition-colors">
            My Copy Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function CopyExpertsPage() {
  const [userBalance,    setUserBalance]    = useState(0);
  const [activeCopyNames, setActiveCopyNames] = useState<string[]>([]);
  const [search,         setSearch]         = useState("");
  const [category,       setCategory]       = useState("All");
  const [sortKey,        setSortKey]        = useState<SortKey>("winRate");
  const [sortAsc,        setSortAsc]        = useState(false);
  const [showSortMenu,   setShowSortMenu]   = useState(false);
  const [copyTarget,     setCopyTarget]     = useState<Expert | null>(null);
  const [successTarget,  setSuccessTarget]  = useState<Expert | null>(null);
  const [successAmount,  setSuccessAmount]  = useState(0);

  useEffect(() => {
    // Fetch user balance + active copy names
    Promise.all([
      fetch("/api/user/me").then(r => r.json()),
      fetch("/api/plans").then(r => r.json()),
    ]).then(([me, plans]) => {
      if (me?.balance !== undefined) setUserBalance(Number(me.balance));
      if (Array.isArray(plans)) {
        const copyNames = plans
          .filter((p: { planName: string; status: string }) => p.planName.startsWith("COPY:") && p.status === "ACTIVE")
          .map((p: { planName: string }) => p.planName.replace("COPY: ", ""));
        setActiveCopyNames(copyNames);
      }
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = EXPERTS.filter(e =>
      (category === "All" || e.category === category) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
       e.specialty.toLowerCase().includes(search.toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [search, category, sortKey, sortAsc]);

  function handleSuccess(amount: number) {
    if (!copyTarget) return;
    setUserBalance(b => b - amount);
    setActiveCopyNames(prev => [...prev, copyTarget.name]);
    setSuccessAmount(amount);
    setSuccessTarget(copyTarget);
    setCopyTarget(null);
    window.dispatchEvent(new CustomEvent("balance-updated"));
  }

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortKey && o.asc === sortAsc)?.label ?? "Sort By";

  return (
    <>
      {copyTarget && <CopyModal expert={copyTarget} userBalance={userBalance} onClose={() => setCopyTarget(null)} onSuccess={handleSuccess} />}
      {successTarget && <SuccessModal expert={successTarget} amount={successAmount} onClose={() => setSuccessTarget(null)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center pt-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-600 dark:text-green-400">{EXPERTS.length} Expert Traders Available</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">Copy Expert Traders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
            Choose from our top-performing traders and automatically copy their trades to your portfolio.
          </p>
          <div className="flex items-center justify-center gap-5 mt-4">
            <Link href="/dashboard/copy/dashboard" className="text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors flex items-center gap-1"><ArrowLeft size={13} /> My Portfolio</Link>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><ShieldCheck size={13} className="text-green-500" /> Verified</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><TrendingUp size={13} className="text-primary-500" /> Proven Results</span>
          </div>
        </div>

        {/* Balance banner */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Your balance: <span className="font-extrabold text-gray-900 dark:text-white">${userBalance.toFixed(2)}</span></p>
          {userBalance < 100 && (
            <Link href="/dashboard/wallet/deposit" className="text-xs font-bold text-primary-500 hover:text-primary-600 underline">Deposit Funds →</Link>
          )}
        </div>

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-primary-500">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search experts by name or specialty..."
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none" />
              {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-primary-400 transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal size={14} /> {currentSortLabel} <ChevronDown size={12} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 min-w-[180px] overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key + opt.asc}
                      onClick={() => { setSortKey(opt.key); setSortAsc(opt.asc); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                        sortKey === opt.key && sortAsc === opt.asc
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  category === cat
                    ? "bg-primary-500 border-primary-500 text-white shadow-sm"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 bg-white dark:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
            <span className="text-xs font-bold text-gray-400 ml-auto">{filtered.length} expert{filtered.length !== 1 ? "s" : ""} found</span>
          </div>
        </div>

        {/* Expert Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onCopy={setCopyTarget}
              canAfford={userBalance >= expert.minInvest}
              isCopying={activeCopyNames.includes(expert.name)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <Search size={32} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No experts found for &quot;{search}&quot;</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }} className="mt-3 text-xs font-bold text-primary-500 hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
