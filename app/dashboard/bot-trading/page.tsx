"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp, Search, CheckCircle2, AlertCircle,
  Loader2, X, Bot as BotIcon, ArrowRight, SlidersHorizontal, ChevronDown, Award,
} from "lucide-react";

/* ─────────────────────────────────────────────
   28 Bot Definitions
───────────────────────────────────────────── */
const BOTS = [
  // FOREX (7)
  { id:"1",  name:"ForexMaster Pro",       category:"Forex Trading",       successRate:87, dailyProfit:"0.80% - 2.50%", dailyPctMid:1.65, duration:30,  minInvest:100,   maxInvest:10000,  pairs:["EUR/USD","GBP/USD","USD/JPY","USD/CHF","+1 more"], desc:"Advanced forex trading bot specialising in major currency pairs. Uses sophisticated algorithms to analyse market trends..." },
  { id:"2",  name:"ScalpMaster Quick",     category:"Forex Trading",       successRate:79, dailyProfit:"1.50% - 3.50%", dailyPctMid:2.5,  duration:21,  minInvest:150,   maxInvest:5000,   pairs:["EUR/USD","GBP/JPY","USD/CAD","AUD/NZD"],          desc:"High-frequency scalping bot designed for quick profits from small price movements. Perfect for active traders seeking..." },
  { id:"3",  name:"FX Trend Rider",        category:"Forex Trading",       successRate:83, dailyProfit:"1.00% - 2.80%", dailyPctMid:1.9,  duration:45,  minInvest:200,   maxInvest:20000,  pairs:["EUR/USD","USD/JPY","GBP/USD","+2 more"],          desc:"Trend-following forex bot that rides sustained directional moves in major and minor currency pairs..." },
  { id:"4",  name:"NewsTrader FX",         category:"Forex Trading",       successRate:81, dailyProfit:"0.90% - 2.20%", dailyPctMid:1.55, duration:30,  minInvest:300,   maxInvest:15000,  pairs:["EUR/USD","USD/CAD","USD/JPY"],                    desc:"Capitalises on high-impact economic news events to execute precision forex trades within seconds of releases..." },
  { id:"5",  name:"Grid Profit FX",        category:"Forex Trading",       successRate:85, dailyProfit:"0.70% - 1.90%", dailyPctMid:1.3,  duration:60,  minInvest:500,   maxInvest:25000,  pairs:["EUR/USD","GBP/USD","USD/CHF","+2 more"],          desc:"Grid trading system that profits from ranging markets by placing buy and sell orders at set intervals..." },
  { id:"6",  name:"CarryTrade Bot",        category:"Forex Trading",       successRate:80, dailyProfit:"0.60% - 1.50%", dailyPctMid:1.05, duration:90,  minInvest:1000,  maxInvest:50000,  pairs:["AUD/JPY","NZD/JPY","USD/TRY"],                   desc:"Exploits interest rate differentials between currencies by holding high-yield vs low-yield pairs..." },
  { id:"7",  name:"DualMA Forex",          category:"Forex Trading",       successRate:82, dailyProfit:"0.80% - 2.00%", dailyPctMid:1.4,  duration:30,  minInvest:250,   maxInvest:12000,  pairs:["EUR/USD","USD/JPY","GBP/USD"],                   desc:"Dual moving-average crossover system that identifies medium-term forex trends with precision..." },
  // CRYPTO (8)
  { id:"8",  name:"CryptoGain Elite",      category:"Crypto Trading",      successRate:82, dailyProfit:"1.20% - 4.50%", dailyPctMid:2.85, duration:45,  minInvest:250,   maxInvest:25000,  pairs:["BTC/USD","ETH/USD","BNB/USD","ADA/USD","+2 more"], desc:"High-performance cryptocurrency trading bot designed for the volatile crypto markets. Leverages machine learning to iden..." },
  { id:"9",  name:"AlgoTrader Supreme",    category:"Crypto Trading",      successRate:91, dailyProfit:"2.10% - 6.80%", dailyPctMid:4.45, duration:45,  minInvest:500,   maxInvest:100000, pairs:["BTC/USD","ETH/USD","SOL/USD","+3 more"],          desc:"Next-generation algorithmic trading bot powered by quantum computing principles. Specialises in high-frequency crypto at..." },
  { id:"10", name:"DeFi Yield Hunter",     category:"Crypto Trading",      successRate:88, dailyProfit:"1.80% - 5.20%", dailyPctMid:3.5,  duration:60,  minInvest:1000,  maxInvest:50000,  pairs:["ETH/USD","LINK/USD","UNI/USD","AVAX/USD"],        desc:"Specialised DeFi protocol explorer that identifies the most profitable yield farming opportunities across decentralised..." },
  { id:"11", name:"BTCUSDT",               category:"Crypto Trading",      successRate:85, dailyProfit:"0.50% - 3.00%", dailyPctMid:1.75, duration:30,  minInvest:100,   maxInvest:10000,  pairs:["BTC/USD","USDT","BNB/USD"],                       desc:"SmartBot: Automated trading bot for crypto & forex markets..." },
  { id:"12", name:"AltCoin Surfer",        category:"Crypto Trading",      successRate:86, dailyProfit:"1.50% - 5.00%", dailyPctMid:3.25, duration:30,  minInvest:300,   maxInvest:20000,  pairs:["SOL/USD","DOT/USD","AVAX/USD","MATIC/USD"],       desc:"Rides altcoin momentum cycles using on-chain analytics and sentiment scoring to buy breakouts early..." },
  { id:"13", name:"ETH Gas Optimizer",     category:"Crypto Trading",      successRate:84, dailyProfit:"1.00% - 3.50%", dailyPctMid:2.25, duration:45,  minInvest:400,   maxInvest:30000,  pairs:["ETH/USD","WBTC","USDC"],                          desc:"Monitors Ethereum gas fees and executes DeFi arbitrage when conditions are optimal for maximum yield..." },
  { id:"14", name:"Memecoin Sniper",       category:"Crypto Trading",      successRate:77, dailyProfit:"2.50% - 8.00%", dailyPctMid:5.25, duration:14,  minInvest:50,    maxInvest:5000,   pairs:["DOGE/USD","SHIB/USD","PEPE/USD"],                 desc:"High-risk, high-reward bot that identifies early-stage memecoin pumps using social sentiment data..." },
  { id:"15", name:"Crypto Rebalancer",     category:"Crypto Trading",      successRate:89, dailyProfit:"0.80% - 2.20%", dailyPctMid:1.5,  duration:90,  minInvest:2000,  maxInvest:100000, pairs:["BTC/USD","ETH/USD","BNB/USD","+5 more"],          desc:"Automatically rebalances a diversified crypto portfolio to maintain target allocations and capture rebalancing premiums..." },
  // STOCKS (6)
  { id:"16", name:"StockTrader AI",        category:"Stocks Trading",      successRate:89, dailyProfit:"0.50% - 2.00%", dailyPctMid:1.25, duration:60,  minInvest:500,   maxInvest:50000,  pairs:["AAPL","GOOGL","MSFT","AMZN","+2 more"],          desc:"Intelligent stock trading bot focusing on blue-chip stocks and growth companies. Combines fundamental analysis with tech..." },
  { id:"17", name:"Tesla TSLA Bot",        category:"Stocks Trading",      successRate:91, dailyProfit:"0.60% - 1.80%", dailyPctMid:1.2,  duration:30,  minInvest:1000,  maxInvest:50000,  pairs:["TSLA"],                                           desc:"Specialised TSLA bot combining news sentiment, Elon tweet analysis, and technical levels for precision entries..." },
  { id:"18", name:"Tech Sector Titan",     category:"Stocks Trading",      successRate:87, dailyProfit:"0.70% - 2.10%", dailyPctMid:1.4,  duration:45,  minInvest:750,   maxInvest:40000,  pairs:["NVDA","AMD","INTC","QCOM","+3 more"],             desc:"Focuses on semiconductor and tech stocks using earnings momentum, options flow, and technical breakouts..." },
  { id:"19", name:"Dividend Growth Bot",   category:"Stocks Trading",      successRate:92, dailyProfit:"0.40% - 1.20%", dailyPctMid:0.8,  duration:90,  minInvest:2000,  maxInvest:100000, pairs:["JNJ","PG","KO","PEP","+5 more"],                  desc:"Targets high-quality dividend growth stocks and times entries around ex-dividend dates for compounded returns..." },
  { id:"20", name:"Small Cap Hunter",      category:"Stocks Trading",      successRate:80, dailyProfit:"1.20% - 4.00%", dailyPctMid:2.6,  duration:21,  minInvest:300,   maxInvest:15000,  pairs:["Various small-cap US equities"],                  desc:"Scans thousands of small-cap stocks daily for breakout setups with unusual volume and insider buying..." },
  { id:"21", name:"Momentum Breakout",     category:"Stocks Trading",      successRate:84, dailyProfit:"0.90% - 2.80%", dailyPctMid:1.85, duration:30,  minInvest:500,   maxInvest:25000,  pairs:["S&P 500 components"],                             desc:"Identifies high-momentum stocks breaking out of consolidation patterns with volume confirmation..." },
  // COMMODITIES (4)
  { id:"22", name:"GoldRush Bot",          category:"Commodities Trading",  successRate:84, dailyProfit:"0.70% - 2.80%", dailyPctMid:1.75, duration:90,  minInvest:200,   maxInvest:15000,  pairs:["GOLD","SILVER","OIL","COPPER","+1 more"],         desc:"Specialised commodities trading bot with expertise in precious metals and energy markets. Ideal for portfolio diversific..." },
  { id:"23", name:"Energy Trader Pro",     category:"Commodities Trading",  successRate:81, dailyProfit:"0.80% - 2.50%", dailyPctMid:1.65, duration:45,  minInvest:300,   maxInvest:20000,  pairs:["WTI/USD","BRENT/USD","NG/USD"],                   desc:"Trades crude oil and natural gas futures using supply/demand data, geopolitical analysis, and seasonal patterns..." },
  { id:"24", name:"Agri Bot",              category:"Commodities Trading",  successRate:78, dailyProfit:"0.60% - 1.80%", dailyPctMid:1.2,  duration:60,  minInvest:150,   maxInvest:10000,  pairs:["WHEAT","CORN","SOY","COFFEE"],                    desc:"Capitalises on agricultural commodity cycles using weather data, USDA crop reports, and seasonal trends..." },
  { id:"25", name:"Metals & Mining AI",    category:"Commodities Trading",  successRate:83, dailyProfit:"0.90% - 2.60%", dailyPctMid:1.75, duration:30,  minInvest:400,   maxInvest:25000,  pairs:["GOLD","SILVER","PLATINUM","COPPER"],              desc:"AI-driven metals trading bot combining macro cycle analysis with technical levels for precision entries..." },
  // INDICES (3)
  { id:"26", name:"IndexMaster Pro",       category:"Indices Trading",      successRate:86, dailyProfit:"0.60% - 2.20%", dailyPctMid:1.4,  duration:75,  minInvest:300,   maxInvest:20000,  pairs:["S&P500","NASDAQ","DOW","FTSE","+2 more"],         desc:"Advanced index trading bot that capitalises on major market indices movements. Uses correlation analysis and macro-econo..." },
  { id:"27", name:"Index Arbitrage Bot",   category:"Indices Trading",      successRate:95, dailyProfit:"0.80% - 2.50%", dailyPctMid:1.65, duration:60,  minInvest:2500,  maxInvest:120000, pairs:["S&P500","NASDAQ","DAX","NIKKEI"],                 desc:"Advanced arbitrage bot that exploits price differences between index futures and their underlying components..." },
  { id:"28", name:"VIX Volatility Bot",    category:"Indices Trading",      successRate:82, dailyProfit:"1.20% - 3.80%", dailyPctMid:2.5,  duration:21,  minInvest:500,   maxInvest:30000,  pairs:["VIX","S&P500","VXN"],                             desc:"Trades volatility itself — buys when fear spikes and sells when markets stabilise. Inverse correlation with markets..." },
];

type Bot = (typeof BOTS)[number];
type SortKey = "successRate" | "dailyPctMid" | "minInvest" | "duration";

const SORT_OPTIONS: { label: string; key: SortKey; asc: boolean }[] = [
  { label: "Highest Success Rate", key: "successRate", asc: false },
  { label: "Highest Daily Profit", key: "dailyPctMid",  asc: false },
  { label: "Lowest Minimum",       key: "minInvest",   asc: true  },
  { label: "Shortest Duration",    key: "duration",    asc: true  },
];

/* ─────────────────────────────────────────────
   Bot Card
───────────────────────────────────────────── */
function BotCard({ bot, canAfford, isActive }: { bot: Bot; canAfford: boolean; isActive: boolean }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative ${
      isActive
        ? "border-green-400 dark:border-green-600 ring-1 ring-green-400/40"
        : canAfford
          ? "border-gray-200 dark:border-gray-700"
          : "border-gray-200 dark:border-gray-700 opacity-75"
    }`}>
      {/* Running badge */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-[10px] font-black text-center py-1 flex items-center justify-center gap-1 z-10">
          <BotIcon size={10}/> Currently Running 🤖
        </div>
      )}

      {/* Header */}
      <div className={`flex items-start justify-between px-5 ${isActive ? "pt-7" : "pt-4"} pb-3`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <BotIcon size={20} className="text-primary-500"/>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">{bot.name}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{bot.category}</p>
          </div>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex-shrink-0">
          {bot.successRate}% Success
        </span>
      </div>

      {/* Description */}
      <p className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{bot.desc}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-gray-100 dark:border-gray-700 mx-5 pt-3 mb-3 gap-2">
        <div>
          <p className="text-sm font-black text-gray-900 dark:text-white">{bot.dailyProfit}</p>
          <p className="text-[9px] text-gray-400">Daily Profit</p>
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 dark:text-white">{bot.duration} Days</p>
          <p className="text-[9px] text-gray-400">Duration</p>
        </div>
        <div>
          <p className="text-sm font-black text-green-600 dark:text-green-400">+{bot.dailyPctMid}%</p>
          <p className="text-[9px] text-gray-400">Expected</p>
        </div>
      </div>

      {/* Investment range */}
      <div className="px-5 pb-2 flex items-center justify-between text-xs">
        <span className="text-gray-400">Min. Investment:</span>
        <span className={`font-bold ${canAfford ? "text-gray-700 dark:text-gray-300" : "text-red-500"}`}>
          ${bot.minInvest.toLocaleString()}
        </span>
      </div>

      {/* Trading pairs */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-gray-400 mb-1.5">Trading Pairs:</p>
        <div className="flex flex-wrap gap-1.5">
          {bot.pairs.slice(0, 4).map(p => (
            <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{p}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 mt-auto">
        {isActive ? (
          <Link
            href="/dashboard/bot-trading/my-bots"
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-500 text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 font-extrabold text-sm rounded-xl transition-colors">
            <CheckCircle2 size={13}/> Manage Active Bot
          </Link>
        ) : (
          <Link
            href={`/dashboard/bot-trading/${bot.id}`}
            className={`w-full flex items-center justify-center gap-2 py-3 text-white font-extrabold text-sm rounded-xl transition-colors shadow-md ${
              canAfford
                ? "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
                : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed shadow-none"
            }`}
            title={!canAfford ? "Insufficient balance to start this bot" : ""}
          >
            Invest Now <ArrowRight size={13}/>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function BotTradingHubPage() {
  const [userBalance,     setUserBalance]     = useState(0);
  const [activeBotNames,  setActiveBotNames]  = useState<string[]>([]);
  const [activeFilter,    setActiveFilter]    = useState("All Bots");
  const [search,          setSearch]          = useState("");
  const [sortKey,         setSortKey]         = useState<SortKey>("successRate");
  const [sortAsc,         setSortAsc]         = useState(false);
  const [showSortMenu,    setShowSortMenu]    = useState(false);

  useEffect(() => {
    // Fetch balance + active bot list
    Promise.all([
      fetch("/api/user/me").then(r => r.json()),
      fetch("/api/plans").then(r => r.json()),
    ]).then(([me, plans]) => {
      if (me?.balance !== undefined) setUserBalance(Number(me.balance));
      if (Array.isArray(plans)) {
        const botNames = plans
          .filter((p: { planName: string; status: string }) => p.planName.startsWith("BOT:") && p.status === "ACTIVE")
          .map((p: { planName: string }) => p.planName.replace("BOT: ", ""));
        setActiveBotNames(botNames);
      }
    }).catch(() => {});
  }, []);

  const CATEGORIES = ["All Bots", "Forex", "Crypto", "Stocks", "Commodities", "Indices"];

  const displayed = useMemo(() => {
    let list = BOTS.filter(b => {
      const matchCat = activeFilter === "All Bots" || b.category.toLowerCase().includes(activeFilter.toLowerCase());
      const matchQ   = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQ;
    });
    // Sort
    list = [...list].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [activeFilter, search, sortKey, sortAsc]);

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortKey && o.asc === sortAsc)?.label ?? "Sort By";

  return (
    <div className="space-y-6">
      {/* Hero — bot.mp4 background with light overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-800" style={{ minHeight: 280 }}>
        {/* Background video */}
        <video
          src="/bot.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Light dark overlay so text stays readable but video shows through */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(90,10,10,0.72) 0%, rgba(20,5,5,0.68) 60%, rgba(10,10,10,0.60) 100%)" }} />

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none" style={{ height: 40 }}>
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,40 C300,0 900,0 1200,40 L1200,40 L0,40 Z" fill="white" className="dark:fill-gray-900"/>
          </svg>
        </div>

        <div className="relative px-6 py-14 text-center pb-16">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-primary-500/50 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            AI-Powered Trading
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 leading-tight">
            Bot Trading
          </h1>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-primary-400 mb-5 leading-tight">
            Hub
          </h1>

          <p className="text-gray-300 max-w-sm mx-auto text-sm leading-relaxed mb-8">
            Invest in AI-powered trading bots that work 24/7 to maximize your profits across multiple markets.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold text-sm rounded-xl transition-colors">
              ← Back to Dashboard
            </Link>
            <Link href="/dashboard/bot-trading/my-bots"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-primary-500/30">
              <TrendingUp size={14}/> My Bot Investments
            </Link>
          </div>
        </div>
      </div>

      {/* Balance banner */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Your Balance: <span className="font-extrabold text-gray-900 dark:text-white">${userBalance.toFixed(2)}</span></p>
        {userBalance < 100 && (
          <Link href="/dashboard/wallet/deposit" className="text-xs font-bold text-primary-500 hover:text-primary-600 underline">Deposit Funds →</Link>
        )}
      </div>

      {/* Bots section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Available Trading Bots</h2>
            <p className="text-sm text-gray-400 mt-0.5">Choose from our {BOTS.length} AI-powered trading bots</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search bots…"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"/>
            </div>

            {/* Sort Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(s => !s)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-primary-400 transition-colors whitespace-nowrap"
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
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeFilter === cat
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
              }`}>
              {cat}
            </button>
          ))}
          <span className="text-xs font-bold text-gray-400 ml-auto whitespace-nowrap">{displayed.length} bot{displayed.length !== 1 ? "s" : ""} found</span>
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <BotIcon size={32} className="text-gray-200 dark:text-gray-700 mx-auto mb-3"/>
            <p className="text-sm text-gray-400">No bots found.</p>
            <button onClick={() => { setSearch(""); setActiveFilter("All Bots"); }} className="mt-2 text-xs font-bold text-primary-500 hover:underline">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayed.map(bot => (
              <BotCard
                key={bot.id}
                bot={bot}
                canAfford={userBalance >= bot.minInvest}
                isActive={activeBotNames.includes(bot.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
