"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  ShieldCheck,
  Wallet,
  Calendar,
  ChevronRight,
  ChevronDown,
  Loader2,
  Bot,
  Users,
  Copy,
  Star,
  Car,
  Check,
  UserPlus,
  Shield,
  BarChart2,
} from "lucide-react";

interface UserData {
  name: string;
  username: string;
  balance: number;
  totalProfit: number;
  totalWithdraw: number;
  role: string;
  createdAt: string;
}

const tradingBots = [
  { id: "1", name: "Index Arbitrage Bot", category: "Indices", winRate: "95%", dailyROI: "0.80–2.50%", minInvest: "$2,500" },
  { id: "2", name: "Crypto Momentum Bot", category: "Cryptocurrency", winRate: "88%", dailyROI: "1.20–3.50%", minInvest: "$1,000" },
  { id: "3", name: "Tesla Stock Bot", category: "Equities", winRate: "91%", dailyROI: "0.60–1.80%", minInvest: "$5,000" },
];

const topTraders = [
  { initials: "SR", name: "Stacy R. Hall", rating: 5, winRate: "80%", followers: 0, minInvest: "$6,500.00", color: "bg-blue-500" },
  { initials: "JA", name: "Jarvis B. Buckley", rating: 5, winRate: "80%", followers: 0, minInvest: "$20,000.00", color: "bg-blue-600" },
  { initials: "MA", name: "Mara Dao", rating: 5, winRate: "80%", followers: 0, minInvest: "$4,000.00", color: "bg-indigo-500" },
];

const featuredCars = [
  {
    id: "tesla-semi",
    name: "Tesla Semi",
    year: 2026,
    transmission: "Automatic",
    price: 28500,
    img: "https://teslacapx.com/dash/cars/13/69c40a3f6c962.jpg",
  },
  {
    id: "cyber-truck",
    name: "Cyber Truck",
    year: 2025,
    transmission: "Automatic",
    price: 91500,
    img: "https://teslacapx.com/dash/cars/5/69c2a1cf16d3c.jpeg",
  },
  {
    id: "tesla-model-3-long-range-1",
    name: "Tesla Model 3 Long Range",
    year: 2025,
    transmission: "Automatic",
    price: 42490,
    img: "https://teslacapx.com/dash/cars/4/69c29f1b7979e.jpg",
  },
  {
    id: "tesla-model-y",
    name: "Tesla Model Y",
    year: 2025,
    transmission: "Automatic",
    price: 43489,
    img: "https://teslacapx.com/dash/cars/6/69c2cf1617bff.png",
  },
  {
    id: "tesla-roadster",
    name: "Tesla Roadster",
    year: 2026,
    transmission: "Automatic",
    price: 199499,
    img: "https://teslacapx.com/dash/cars/7/69c3ee94623a4.webp",
  },
  {
    id: "tesla-model-s",
    name: "Tesla Model S Plaid",
    year: 2025,
    transmission: "Automatic",
    price: 89990,
    img: "https://teslacapx.com/dash/cars/8/model-s.jpg",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [bonus] = useState(0);
  const [copied, setCopied] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const [userRes, txRes] = await Promise.all([
          fetch("/api/user/me"),
          fetch("/api/transactions"),
        ]);
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data);
        }
        if (txRes.ok) {
          const txs = await txRes.json();
          if (Array.isArray(txs)) {
            const deposits = txs
              .filter((t: { type: string; status: string }) => t.type === "DEPOSIT" && t.status === "COMPLETED")
              .reduce((s: number, t: { amount: number }) => s + t.amount, 0);
            setTotalDeposit(deposits);
          }
        }
      } catch {
        // fallback — use session name only
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const userName = user?.name || session?.user?.name || "User";
  const username = user?.username || "user";
  const balance = user?.balance ?? 0;
  const totalProfit = user?.totalProfit ?? 0;
  const totalWithdraw = user?.totalWithdraw ?? 0;
  const isVerified = false;
  const referralLink = `http://teslacapx.com/ref/${username}`;

  const fmt = (n: number) =>
    "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2 });

  function copyReferral() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your investment dashboard overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/connect-wallet"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm rounded-xl hover:border-primary-400 transition-colors shadow-sm"
          >
            <Wallet size={16} className="text-primary-500" />
            Connect Wallet
          </Link>
          <Link
            href="/dashboard/buy-plan"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
          >
            <TrendingUp size={16} />
            Invest Now
          </Link>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Account Balance */}
        <div className="sm:col-span-2 xl:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Account Balance</p>
            <DollarSign size={16} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-xs text-gray-400 mb-3">Your available funds</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white mb-3">{fmt(balance)}</p>
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Available for Withdrawal</span>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            <span className={`w-2 h-2 rounded-full ${isVerified ? "bg-green-500" : "bg-orange-400"}`}></span>
            <span className={`text-xs font-bold ${isVerified ? "text-green-600" : "text-orange-500"}`}>
              {isVerified ? "Verified" : "Unverified"}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mb-4 flex items-center gap-1">
            <Calendar size={10} />
            Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="flex gap-3">
            <Link href="/dashboard/wallet/deposit" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors">
              <ArrowDownCircle size={15} /> Deposit
            </Link>
            <Link href="/dashboard/wallet/withdraw" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ArrowUpCircle size={15} /> Withdraw
            </Link>
          </div>
        </div>

        {/* 2×2 mini stats */}
        <div className="sm:col-span-2 xl:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Profit</p>
              <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign size={14} className="text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{fmt(totalProfit)}</p>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Calendar size={9} /> Last period</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Deposit</p>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <ArrowDownCircle size={14} className="text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{fmt(totalDeposit)}</p>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Calendar size={9} /> All time</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Withdrawal</p>
              <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <ArrowUpCircle size={14} className="text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{fmt(totalWithdraw)}</p>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Calendar size={9} /> All time</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Bonus</p>
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Gift size={14} className="text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{fmt(bonus)}</p>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Calendar size={9} /> All time</p>
          </div>
        </div>
      </div>

      {/* ── Identity Verification Banner ── */}
      {/* ── Identity Verification Banner (expandable) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} className="text-primary-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Identity Verification</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Complete verification to access all features</p>
            </div>
          </div>
          <button
            onClick={() => setVerifyOpen(!verifyOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            View Details
            <ChevronDown size={14} className={`transition-transform duration-200 ${verifyOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expandable panel */}
        {verifyOpen && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-8 flex flex-col items-center text-center bg-gray-50/50 dark:bg-gray-900/30">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
              <UserPlus size={28} className="text-gray-500 dark:text-gray-300" />
            </div>
            <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">Complete Your Verification</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-7">
              Verify your identity to unlock higher limits and enhanced security features.
            </p>
            <div className="flex items-center justify-center gap-12 mb-8">
              <div className="flex flex-col items-center gap-2">
                <Shield size={22} className="text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Enhanced Security</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BarChart2 size={22} className="text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Higher Limits</span>
              </div>
            </div>
            <Link
              href="/dashboard/verify-account"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
            >
              <UserPlus size={16} /> Start Verification
            </Link>
          </div>
        )}
      </div>

      {/* ── Connect Wallet CTA ── */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-700 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Wallet size={22} className="text-primary-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm">Connect Your Wallet to Start Earning</h3>
            <p className="text-xs text-gray-400 mt-0.5">Connect your cryptocurrency wallet to unlock daily earning opportunities of up to $3000 per day.</p>
          </div>
        </div>
        <Link href="/dashboard/connect-wallet" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex-shrink-0">
          <Wallet size={14} /> Connect Wallet
        </Link>
      </div>

      {/* ── Latest Trades + Referrals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Latest Trades */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-extrabold text-gray-900 dark:text-white mb-4">Latest Trades</h3>
          <div className="grid grid-cols-3 text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2 mb-3">
            <span>Details</span>
            <span className="text-center">Amount</span>
            <span className="text-right">Status</span>
          </div>
          {/* Empty state */}
          <div className="flex flex-col items-center py-10 text-center">
            <TrendingUp size={28} className="text-gray-200 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No trades yet</p>
          </div>
          <div className="text-center mt-2">
            <Link href="/dashboard/trading" className="text-sm font-bold text-primary-500 hover:text-primary-600">
              View All
            </Link>
          </div>
        </div>

        {/* Referrals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Referrals</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Present our project to your network and enjoy financial benefits. You don't need an active deposit to earn affiliate commissions.
            </p>
            <Link
              href="/dashboard/referrals"
              className="mt-3 inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Personal Referral Link */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-3">Personal Referral Link</p>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                {referralLink}
              </span>
              <button
                onClick={copyReferral}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trading Bots ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-gray-700 dark:text-gray-300" />
            <h3 className="font-extrabold text-gray-900 dark:text-white">Trading Bots</h3>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">AI</span>
          </div>
          <Link href="/dashboard/trading" className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tradingBots.map((bot, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-primary-500" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">{bot.name}</p>
                  <p className="text-xs text-gray-400">{bot.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">Win Rate</p>
                  <p className="text-sm font-black text-green-600 dark:text-green-400">{bot.winRate}</p>
                </div>
                <div className="rounded-lg p-2 text-center border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] text-gray-400 mb-0.5">Daily ROI</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{bot.dailyROI}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Min: {bot.minInvest}</span>
                <Link href={`/dashboard/bot-trading/${bot.id}`} className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-0.5">
                  Invest <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Traders ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-700 dark:text-gray-300" />
            <h3 className="font-extrabold text-gray-900 dark:text-white">Top Traders</h3>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">COPY</span>
          </div>
          <Link href="/dashboard/copy/experts" className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topTraders.map((trader, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${trader.color} text-white flex items-center justify-center font-black text-sm flex-shrink-0`}>
                  {trader.initials}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">{trader.name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[...Array(trader.rating)].map((_, s) => (
                      <Star key={s} size={10} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">({trader.rating}/5)</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">Win Rate</p>
                  <p className="text-sm font-black text-green-600 dark:text-green-400">{trader.winRate}</p>
                </div>
                <div className="rounded-lg p-2 text-center border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] text-gray-400 mb-0.5">Followers</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{trader.followers}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">{trader.minInvest}</span>
                <button className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
                onClick={() => window.location.href = '/dashboard/copy/experts'}>
                  Copy <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Cars ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-gray-700 dark:text-gray-300" />
            <h3 className="font-extrabold text-gray-900 dark:text-white">Featured Cars</h3>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">NEW</span>
          </div>
          <Link href="/dashboard/inventory" className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCars.map((car) => (
            <div key={car.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-750">
                <img
                  src={car.img}
                  alt={car.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-primary-500 text-white text-[10px] font-black rounded-md tracking-wider">
                  FEATURED
                </div>
              </div>
              {/* Details */}
              <div className="p-4">
                <Link href={`/dashboard/inventory/${car.id}`} className="font-extrabold text-primary-500 hover:text-primary-600 text-sm transition-colors">
                  {car.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{car.year} · {car.transmission}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-lg font-black text-gray-900 dark:text-white">
                    ${car.price.toLocaleString()}
                  </p>
                  <Link
                    href={`/dashboard/inventory/${car.id}`}
                    className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-0.5"
                  >
                    Details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
