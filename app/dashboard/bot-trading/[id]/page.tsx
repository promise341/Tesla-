"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft, Bot, CheckCircle2, AlertCircle, Loader2,
  TrendingUp, BarChart2, Clock, Shield, Zap, RefreshCw, X, Wallet,
} from "lucide-react";

/* ─────────────────────────────────────────────
   All 28 Bots — IDs match the hub page exactly
───────────────────────────────────────────── */
const BOTS: Record<string, {
  id: string; name: string; category: string; description: string; longDesc: string;
  winRate: number; dailyROI: string; dailyPctMid: number; expectedReturn: number;
  minInvest: number; maxInvest: number; duration: number;
  strategyType: string; tradingFrequency: string; riskLevel: string;
  pairs: string[]; status: "Active" | "Paused";
}> = {
  "1":  { id:"1",  name:"ForexMaster Pro",      category:"Forex Trading",        description:"Advanced forex trading bot specialising in major currency pairs. Uses sophisticated algorithms to analyse market trends and execute precision trades.",            longDesc:"ForexMaster Pro employs a multi-strategy approach combining trend following, mean reversion and breakout detection across all major forex pairs. The bot adapts to changing market conditions in real-time, adjusting position sizes dynamically based on volatility and drawdown limits.",             winRate:87, dailyROI:"0.80% - 2.50%", dailyPctMid:1.65, expectedReturn:1.65, minInvest:100,   maxInvest:10000,  duration:30,  strategyType:"Multi-Strategy Forex",     tradingFrequency:"8–15 trades daily",  riskLevel:"Medium",      pairs:["EUR/USD","GBP/USD","USD/JPY","USD/CHF"], status:"Active" },
  "2":  { id:"2",  name:"ScalpMaster Quick",    category:"Forex Trading",        description:"High-frequency scalping bot designed for quick profits from small price movements. Perfect for active traders seeking maximum daily activity.",               longDesc:"ScalpMaster Quick targets 5–20 pip moves across liquid forex pairs using a proprietary tick-data algorithm. The bot operates during peak liquidity hours and uses tight stop-loss management to preserve capital while compounding small wins.",                                                   winRate:79, dailyROI:"1.50% - 3.50%", dailyPctMid:2.5,  expectedReturn:2.5,  minInvest:150,   maxInvest:5000,   duration:21,  strategyType:"High-Frequency Scalping",  tradingFrequency:"20–50 trades daily", riskLevel:"Medium-High", pairs:["EUR/USD","GBP/JPY","USD/CAD","AUD/NZD"], status:"Active" },
  "3":  { id:"3",  name:"FX Trend Rider",       category:"Forex Trading",        description:"Trend-following forex bot that rides sustained directional moves in major and minor currency pairs using EMA crossovers and ADX confirmation.",               longDesc:"FX Trend Rider identifies high-probability trending setups using a combination of EMA crossover signals, ADX trend strength confirmation, and volume analysis. Once a trend is confirmed the bot scales into positions and trails stops to lock in profits as the move develops.",               winRate:83, dailyROI:"1.00% - 2.80%", dailyPctMid:1.9,  expectedReturn:1.9,  minInvest:200,   maxInvest:20000,  duration:45,  strategyType:"Trend Following",          tradingFrequency:"3–8 trades daily",   riskLevel:"Medium",      pairs:["EUR/USD","USD/JPY","GBP/USD","AUD/USD"], status:"Active" },
  "4":  { id:"4",  name:"NewsTrader FX",        category:"Forex Trading",        description:"Capitalises on high-impact economic news events to execute precision forex trades within seconds of major data releases.",                                    longDesc:"NewsTrader FX monitors the economic calendar 24/7 and pre-positions for high-impact events such as NFP, CPI, and central bank decisions. The bot uses a proprietary news-scoring algorithm to determine direction bias and executes trades within milliseconds of the data release.",          winRate:81, dailyROI:"0.90% - 2.20%", dailyPctMid:1.55, expectedReturn:1.55, minInvest:300,   maxInvest:15000,  duration:30,  strategyType:"News Event Trading",       tradingFrequency:"1–5 trades daily",   riskLevel:"Medium",      pairs:["EUR/USD","USD/CAD","USD/JPY"], status:"Active" },
  "5":  { id:"5",  name:"Grid Profit FX",       category:"Forex Trading",        description:"Grid trading system that profits from ranging markets by placing buy and sell orders at set price intervals to capture every oscillation.",                   longDesc:"Grid Profit FX deploys a dynamic grid of orders above and below the current price. As price oscillates within the grid, both buy and sell orders are triggered, generating profit from the spread. The grid automatically adjusts width based on daily ATR to optimise for market conditions.",  winRate:85, dailyROI:"0.70% - 1.90%", dailyPctMid:1.3,  expectedReturn:1.3,  minInvest:500,   maxInvest:25000,  duration:60,  strategyType:"Grid Trading",             tradingFrequency:"Multiple daily",     riskLevel:"Low-Medium",  pairs:["EUR/USD","GBP/USD","USD/CHF","EUR/GBP"], status:"Active" },
  "6":  { id:"6",  name:"CarryTrade Bot",       category:"Forex Trading",        description:"Exploits interest rate differentials between currencies by holding high-yield vs low-yield pairs to earn the swap overnight.",                               longDesc:"CarryTrade Bot systematically holds positions in high-yielding currency pairs versus low-yielding ones to accumulate daily swap income. The bot monitors central bank policy shifts and manages exposure to ensure the carry trade remains positive. Risk is managed through strict drawdown limits.", winRate:80, dailyROI:"0.60% - 1.50%", dailyPctMid:1.05, expectedReturn:1.05, minInvest:1000,  maxInvest:50000,  duration:90,  strategyType:"Carry Trade",              tradingFrequency:"Holds positions",    riskLevel:"Low",         pairs:["AUD/JPY","NZD/JPY","USD/TRY"], status:"Active" },
  "7":  { id:"7",  name:"DualMA Forex",         category:"Forex Trading",        description:"Dual moving-average crossover system that identifies medium-term forex trends with precision and manages exits with ATR-based trailing stops.",               longDesc:"DualMA Forex uses a fast and slow EMA crossover to generate trend signals across multiple timeframes. The bot filters signals with RSI divergence to avoid false breakouts and employs an ATR-based trailing stop to ride winners while cutting losers short.",                                     winRate:82, dailyROI:"0.80% - 2.00%", dailyPctMid:1.4,  expectedReturn:1.4,  minInvest:250,   maxInvest:12000,  duration:30,  strategyType:"MA Crossover",             tradingFrequency:"3–6 trades daily",   riskLevel:"Medium",      pairs:["EUR/USD","USD/JPY","GBP/USD"], status:"Active" },
  "8":  { id:"8",  name:"CryptoGain Elite",     category:"Crypto Trading",       description:"High-performance cryptocurrency trading bot designed for the volatile crypto markets. Leverages machine learning to identify high-probability setups.",      longDesc:"CryptoGain Elite uses a neural network trained on 5 years of crypto market data to identify recurring patterns before major moves. The bot trades BTC, ETH and top altcoins across multiple exchanges simultaneously, with cross-exchange arbitrage as an additional alpha source.",                winRate:82, dailyROI:"1.20% - 4.50%", dailyPctMid:2.85, expectedReturn:2.85, minInvest:250,   maxInvest:25000,  duration:45,  strategyType:"Machine Learning",         tradingFrequency:"5–10 trades daily",  riskLevel:"Medium",      pairs:["BTC/USD","ETH/USD","BNB/USD","ADA/USD"], status:"Active" },
  "9":  { id:"9",  name:"AlgoTrader Supreme",   category:"Crypto Trading",       description:"Next-generation algorithmic trading bot powered by quantum computing principles. Specialises in high-frequency crypto arbitrage.",                           longDesc:"AlgoTrader Supreme combines statistical arbitrage across 15+ crypto exchanges with a momentum overlay that identifies breakout setups. The bot executes hundreds of micro-trades per day, each individually sized to minimise market impact while maximising aggregate alpha.",                    winRate:91, dailyROI:"2.10% - 6.80%", dailyPctMid:4.45, expectedReturn:4.45, minInvest:500,   maxInvest:100000, duration:45,  strategyType:"Statistical Arbitrage",    tradingFrequency:"100+ trades daily",  riskLevel:"Medium-High", pairs:["BTC/USD","ETH/USD","SOL/USD","BNB/USD"], status:"Active" },
  "10": { id:"10", name:"DeFi Yield Hunter",    category:"Crypto Trading",       description:"Specialised DeFi protocol explorer that identifies the most profitable yield farming opportunities across decentralised exchanges.",                          longDesc:"DeFi Yield Hunter continuously scans Uniswap, Curve, AAVE, and 20+ other protocols for the highest risk-adjusted yield opportunities. The bot automatically moves capital between protocols as APYs shift, compounding returns and managing impermanent loss exposure.",                          winRate:88, dailyROI:"1.80% - 5.20%", dailyPctMid:3.5,  expectedReturn:3.5,  minInvest:1000,  maxInvest:50000,  duration:60,  strategyType:"DeFi Yield Optimisation",  tradingFrequency:"Continuous rebalance",riskLevel:"Medium",      pairs:["ETH/USD","LINK/USD","UNI/USD","AVAX/USD"], status:"Active" },
  "11": { id:"11", name:"BTCUSDT",              category:"Crypto Trading",       description:"SmartBot: Automated trading bot for crypto & forex markets. Uses real-time data and proven signals for consistent returns.",                                  longDesc:"BTCUSDT SmartBot is a versatile bot that applies momentum and mean-reversion strategies to the BTC/USDT pair. It combines on-chain data (whale wallet movements, exchange inflows) with traditional technical analysis to time entries with high confidence.",                                    winRate:85, dailyROI:"0.50% - 3.00%", dailyPctMid:1.75, expectedReturn:1.75, minInvest:100,   maxInvest:10000,  duration:30,  strategyType:"On-Chain + Technical",     tradingFrequency:"5–8 trades daily",   riskLevel:"Medium",      pairs:["BTC/USD","USDT","BNB/USD"], status:"Active" },
  "12": { id:"12", name:"AltCoin Surfer",       category:"Crypto Trading",       description:"Rides altcoin momentum cycles using on-chain analytics and sentiment scoring to buy breakouts early in the cycle.",                                          longDesc:"AltCoin Surfer monitors social sentiment, developer activity, and token unlock schedules across 200+ altcoins to identify the ones most likely to outperform in the next 7–30 days. Position sizing is weighted by confidence score with hard stops at 8% drawdown.",                            winRate:86, dailyROI:"1.50% - 5.00%", dailyPctMid:3.25, expectedReturn:3.25, minInvest:300,   maxInvest:20000,  duration:30,  strategyType:"Sentiment + On-Chain",     tradingFrequency:"4–10 trades daily",  riskLevel:"Medium-High", pairs:["SOL/USD","DOT/USD","AVAX/USD","MATIC/USD"], status:"Active" },
  "13": { id:"13", name:"ETH Gas Optimizer",    category:"Crypto Trading",       description:"Monitors Ethereum gas fees and executes DeFi arbitrage when conditions are optimal for maximum yield.",                                                       longDesc:"ETH Gas Optimizer tracks Ethereum mempool congestion in real-time and only executes transactions when gas costs are below a dynamic threshold. This ensures that arbitrage and yield-farming opportunities captured are genuinely profitable after all on-chain costs.",                         winRate:84, dailyROI:"1.00% - 3.50%", dailyPctMid:2.25, expectedReturn:2.25, minInvest:400,   maxInvest:30000,  duration:45,  strategyType:"Gas-Optimised Arbitrage",  tradingFrequency:"Variable",           riskLevel:"Medium",      pairs:["ETH/USD","WBTC","USDC"], status:"Active" },
  "14": { id:"14", name:"Memecoin Sniper",      category:"Crypto Trading",       description:"High-risk, high-reward bot that identifies early-stage memecoin pumps using social sentiment data and wallet tracking.",                                     longDesc:"Memecoin Sniper uses Twitter/X sentiment analysis, Telegram group monitoring, and smart-money wallet tracking to identify memecoins at the very early stage of viral distribution. The bot takes small positions with 10x stop-loss management and exits at predefined profit targets.",        winRate:77, dailyROI:"2.50% - 8.00%", dailyPctMid:5.25, expectedReturn:5.25, minInvest:50,    maxInvest:5000,   duration:14,  strategyType:"Social Sentiment Sniper",  tradingFrequency:"1–5 trades daily",   riskLevel:"High",        pairs:["DOGE/USD","SHIB/USD","PEPE/USD"], status:"Active" },
  "15": { id:"15", name:"Crypto Rebalancer",    category:"Crypto Trading",       description:"Automatically rebalances a diversified crypto portfolio to maintain target allocations and capture rebalancing premiums.",                                    longDesc:"Crypto Rebalancer manages a basket of the top 10 cryptocurrencies by market cap, maintaining target weights through periodic rebalancing. The act of rebalancing naturally buys dips and sells rallies, generating a rebalancing premium over simple buy-and-hold over time.",                  winRate:89, dailyROI:"0.80% - 2.20%", dailyPctMid:1.5,  expectedReturn:1.5,  minInvest:2000,  maxInvest:100000, duration:90,  strategyType:"Portfolio Rebalancing",    tradingFrequency:"Daily rebalance",    riskLevel:"Low",         pairs:["BTC/USD","ETH/USD","BNB/USD","SOL/USD"], status:"Active" },
  "16": { id:"16", name:"StockTrader AI",       category:"Stocks Trading",       description:"Intelligent stock trading bot focusing on blue-chip stocks and growth companies. Combines fundamental analysis with technical indicators for optimal stock selection and timing.", longDesc:"StockTrader AI screens the S&P 500 and NASDAQ daily using a proprietary scoring model that combines fundamental metrics (P/E, earnings growth, ROE) with technical signals. The bot builds a concentrated portfolio of 10–15 highest-conviction positions and rebalances weekly.", winRate:89, dailyROI:"0.50% - 2.00%", dailyPctMid:1.25, expectedReturn:1.25, minInvest:500,   maxInvest:50000,  duration:60,  strategyType:"Fundamental + Technical",  tradingFrequency:"2–5 trades daily",   riskLevel:"Low-Medium",  pairs:["AAPL","GOOGL","MSFT","AMZN"], status:"Active" },
  "17": { id:"17", name:"Tesla TSLA Bot",       category:"Stocks Trading",       description:"Specialised TSLA bot combining news sentiment, Elon tweet analysis, and key technical levels for precision entries and exits.",                              longDesc:"Tesla TSLA Bot monitors Elon Musk's social media activity, Tesla earnings calendars, EV delivery numbers, and macroeconomic factors that disproportionately affect TSLA. The bot generates a daily trade signal with a confidence score and executes only when all conditions align.",               winRate:91, dailyROI:"0.60% - 1.80%", dailyPctMid:1.2,  expectedReturn:1.2,  minInvest:1000,  maxInvest:50000,  duration:30,  strategyType:"Sentiment + Technical",    tradingFrequency:"2–5 trades daily",   riskLevel:"Low-Medium",  pairs:["TSLA"], status:"Active" },
  "18": { id:"18", name:"Tech Sector Titan",    category:"Stocks Trading",       description:"Focuses on semiconductor and tech stocks using earnings momentum, options flow, and technical breakouts for consistent alpha generation.",                    longDesc:"Tech Sector Titan monitors unusual options activity, insider buying, and earnings estimate revisions across the semiconductor and software sectors. The bot rotates between sub-sectors (AI, cloud, semi, cybersecurity) based on relative strength and sector rotation signals.",               winRate:87, dailyROI:"0.70% - 2.10%", dailyPctMid:1.4,  expectedReturn:1.4,  minInvest:750,   maxInvest:40000,  duration:45,  strategyType:"Sector Rotation + Options",tradingFrequency:"3–7 trades daily",   riskLevel:"Medium",      pairs:["NVDA","AMD","INTC","QCOM"], status:"Active" },
  "19": { id:"19", name:"Dividend Growth Bot",  category:"Stocks Trading",       description:"Targets high-quality dividend growth stocks and times entries around ex-dividend dates for compounded returns.",                                              longDesc:"Dividend Growth Bot builds a portfolio of Dividend Aristocrats — companies that have raised dividends for 25+ consecutive years. It times entries 2–3 weeks before ex-dividend dates and uses covered call overlays to boost income yield above the base dividend.",                             winRate:92, dailyROI:"0.40% - 1.20%", dailyPctMid:0.8,  expectedReturn:0.8,  minInvest:2000,  maxInvest:100000, duration:90,  strategyType:"Dividend + Options Overlay",tradingFrequency:"Weekly rebalance",   riskLevel:"Low",         pairs:["JNJ","PG","KO","PEP","ABBV"], status:"Active" },
  "20": { id:"20", name:"Small Cap Hunter",     category:"Stocks Trading",       description:"Scans thousands of small-cap stocks daily for breakout setups with unusual volume and insider buying signals.",                                               longDesc:"Small Cap Hunter uses a proprietary screen to identify small-cap stocks ($100M–$2B market cap) exhibiting unusual volume spikes, positive insider buying, and technical breakout patterns. The bot takes quick 3–5 day positions and moves on, keeping average holding time short.",              winRate:80, dailyROI:"1.20% - 4.00%", dailyPctMid:2.6,  expectedReturn:2.6,  minInvest:300,   maxInvest:15000,  duration:21,  strategyType:"Breakout + Insider Flow",  tradingFrequency:"2–4 trades daily",   riskLevel:"Medium-High", pairs:["Various US small-caps"], status:"Active" },
  "21": { id:"21", name:"Momentum Breakout",    category:"Stocks Trading",       description:"Identifies high-momentum stocks breaking out of consolidation patterns with volume confirmation for explosive short-term moves.",                             longDesc:"Momentum Breakout screens the entire S&P 500 for stocks forming tight consolidation bases after strong moves. When price breaks above resistance with at least 150% of average volume, the bot enters and manages the trade with a 2:1 minimum reward-to-risk ratio.",                            winRate:84, dailyROI:"0.90% - 2.80%", dailyPctMid:1.85, expectedReturn:1.85, minInvest:500,   maxInvest:25000,  duration:30,  strategyType:"Volume Breakout",          tradingFrequency:"2–5 trades daily",   riskLevel:"Medium",      pairs:["S&P 500 components"], status:"Active" },
  "22": { id:"22", name:"GoldRush Bot",         category:"Commodities Trading",  description:"Specialised commodities trading bot with expertise in precious metals and energy markets. Ideal for portfolio diversification.",                             longDesc:"GoldRush Bot trades gold, silver, and crude oil using a macro-driven approach that incorporates DXY correlation, real yield movements, and geopolitical risk scoring. The bot holds positions for 3–10 days and uses options for downside protection on larger positions.",                        winRate:84, dailyROI:"0.70% - 2.80%", dailyPctMid:1.75, expectedReturn:1.75, minInvest:200,   maxInvest:15000,  duration:90,  strategyType:"Macro Commodities",        tradingFrequency:"2–5 trades daily",   riskLevel:"Medium",      pairs:["GOLD","SILVER","OIL","COPPER"], status:"Active" },
  "23": { id:"23", name:"Energy Trader Pro",    category:"Commodities Trading",  description:"Trades crude oil and natural gas futures using supply/demand data, geopolitical analysis, and seasonal patterns.",                                           longDesc:"Energy Trader Pro combines weekly EIA storage reports, OPEC meeting outcomes, and seasonal demand patterns to trade WTI crude and Henry Hub natural gas. The bot is long-biased in winter gas and uses spreads between WTI and Brent to capture refinery margin plays.",                         winRate:81, dailyROI:"0.80% - 2.50%", dailyPctMid:1.65, expectedReturn:1.65, minInvest:300,   maxInvest:20000,  duration:45,  strategyType:"Fundamental Commodities",  tradingFrequency:"2–4 trades daily",   riskLevel:"Medium",      pairs:["WTI/USD","BRENT/USD","NG/USD"], status:"Active" },
  "24": { id:"24", name:"Agri Bot",             category:"Commodities Trading",  description:"Capitalises on agricultural commodity cycles using weather data, USDA crop reports, and seasonal trends for consistent profits.",                            longDesc:"Agri Bot integrates NOAA weather forecasts, USDA crop production reports, and historical seasonal patterns to trade corn, wheat, and soybeans. The bot is particularly active during planting and harvesting seasons when price volatility peaks and fundamental-driven moves are most predictable.", winRate:78, dailyROI:"0.60% - 1.80%", dailyPctMid:1.2,  expectedReturn:1.2,  minInvest:150,   maxInvest:10000,  duration:60,  strategyType:"Seasonal + Fundamental",   tradingFrequency:"1–3 trades daily",   riskLevel:"Medium",      pairs:["WHEAT","CORN","SOY","COFFEE"], status:"Active" },
  "25": { id:"25", name:"Metals & Mining AI",   category:"Commodities Trading",  description:"AI-driven metals trading bot combining macro cycle analysis with technical levels for precision entries in gold, silver, platinum, and copper.",              longDesc:"Metals & Mining AI uses a multi-factor model combining inflation expectations, USD strength, industrial demand projections, and technical chart patterns to trade the full metals complex. The bot dynamically shifts between precious and industrial metals based on the macro regime.",           winRate:83, dailyROI:"0.90% - 2.60%", dailyPctMid:1.75, expectedReturn:1.75, minInvest:400,   maxInvest:25000,  duration:30,  strategyType:"AI Macro Metals",          tradingFrequency:"2–5 trades daily",   riskLevel:"Medium",      pairs:["GOLD","SILVER","PLATINUM","COPPER"], status:"Active" },
  "26": { id:"26", name:"IndexMaster Pro",      category:"Indices Trading",      description:"Advanced index trading bot that capitalises on major market indices movements using correlation analysis and macro-economic indicators.",                       longDesc:"IndexMaster Pro monitors cross-asset correlations (bonds, FX, commodities) to anticipate directional moves in major equity indices. The bot has separate strategies for trending and mean-reverting regimes, switching automatically based on a volatility regime filter.",                       winRate:86, dailyROI:"0.60% - 2.20%", dailyPctMid:1.4,  expectedReturn:1.4,  minInvest:300,   maxInvest:20000,  duration:75,  strategyType:"Cross-Asset Index",        tradingFrequency:"3–6 trades daily",   riskLevel:"Low-Medium",  pairs:["S&P500","NASDAQ","DOW","FTSE"], status:"Active" },
  "27": { id:"27", name:"Index Arbitrage Bot",  category:"Indices Trading",      description:"Advanced arbitrage bot that exploits price differences between index futures and their underlying components. High-frequency execution with minimal risk.",    longDesc:"Index Arbitrage Bot continuously monitors the spread between index ETFs, futures, and their component stocks to identify arbitrage opportunities. When the spread exceeds transaction costs by a sufficient margin the bot simultaneously buys the underpriced instrument and shorts the overpriced one.", winRate:95, dailyROI:"0.80% - 2.50%", dailyPctMid:1.65, expectedReturn:1.65, minInvest:2500,  maxInvest:120000, duration:60,  strategyType:"Statistical Arbitrage",    tradingFrequency:"Multiple daily",     riskLevel:"Low",         pairs:["S&P500","NASDAQ","DAX","NIKKEI"], status:"Active" },
  "28": { id:"28", name:"VIX Volatility Bot",   category:"Indices Trading",      description:"Trades volatility itself — buys when fear spikes and sells when markets stabilise. Inverse correlation with traditional markets.",                            longDesc:"VIX Volatility Bot trades VIX futures and volatility ETPs (VXX, UVXY, SVXY) based on the term structure of volatility. When the VIX spikes above historical percentiles the bot takes long vol positions; when term structure inverts (backwardation) it shorts vol for mean-reversion gains.",  winRate:82, dailyROI:"1.20% - 3.80%", dailyPctMid:2.5,  expectedReturn:2.5,  minInvest:500,   maxInvest:30000,  duration:21,  strategyType:"Volatility Trading",       tradingFrequency:"1–5 trades daily",   riskLevel:"Medium-High", pairs:["VIX","S&P500","VXN"], status:"Active" },
};

interface MockTrade {
  pair: string;
  side: "BUY" | "SELL";
  pnl: number;
  time: string;
}

export default function BotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id     = (params?.id as string) ?? "1";
  const bot    = BOTS[id] ?? BOTS["1"];

  const [userBalance,    setUserBalance]    = useState(0);
  const [amount,         setAmount]         = useState(bot.minInvest);
  const [autoReinvest,   setAutoReinvest]   = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");

  // Active status state
  const [activePlanId,   setActivePlanId]   = useState<string | null>(null);
  const [activeCapital,  setActiveCapital]  = useState<number>(0);

  // Simulated live trade feed
  const [tradeFeed,      setTradeFeed]      = useState<MockTrade[]>([]);

  // Realistic simulated metrics
  const [simProfit,      setSimProfit]      = useState(0);
  const [simTrades,      setSimTrades]      = useState(0);

  // Reset when route changes
  useEffect(() => { setAmount(bot.minInvest); setError(""); }, [id, bot.minInvest]);

  // Generate initial simulated stats
  useEffect(() => {
    const baseTrades = Math.floor(Number(bot.id) * 143 + 312);
    const baseProfit = Number(bot.id) * 1250 + 420.50;
    setSimTrades(baseTrades);
    setSimProfit(baseProfit);
  }, [bot.id]);

  // Simulated live feed builder
  useEffect(() => {
    // Generate initial items
    const initialTrades: MockTrade[] = [];
    for (let i = 0; i < 4; i++) {
      const pair = bot.pairs[Math.floor(Math.random() * bot.pairs.length)];
      const isWin = Math.random() * 100 < bot.winRate;
      const val = (Math.random() * 45) + 5;
      initialTrades.push({
        pair,
        side: Math.random() > 0.5 ? "BUY" : "SELL",
        pnl: isWin ? val : -val * 0.4,
        time: `${i * 3 + 2}m ago`,
      });
    }
    setTradeFeed(initialTrades);

    // Live update interval
    const interval = setInterval(() => {
      const pair = bot.pairs[Math.floor(Math.random() * bot.pairs.length)];
      const isWin = Math.random() * 100 < bot.winRate;
      const val = (Math.random() * 45) + 5;
      const newTrade: MockTrade = {
        pair,
        side: Math.random() > 0.5 ? "BUY" : "SELL",
        pnl: isWin ? val : -val * 0.4,
        time: "Just now",
      };

      setTradeFeed(prev => [newTrade, ...prev.slice(0, 5).map((t, idx) => ({ ...t, time: `${idx + 1}m ago` }))]);
      setSimTrades(t => t + 1);
      setSimProfit(p => p + newTrade.pnl);
    }, 6000);

    return () => clearInterval(interval);
  }, [bot]);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/me").then(r => r.json()),
      fetch("/api/plans").then(r => r.json()),
    ]).then(([me, plans]) => {
      if (me?.balance !== undefined) setUserBalance(Number(me.balance));
      if (Array.isArray(plans)) {
        const found = plans.find(p => p.planName === `BOT: ${bot.name}` && p.status === "ACTIVE");
        if (found) {
          setActivePlanId(found.id);
          setActiveCapital(found.capital);
        }
      }
    }).catch(() => {});
  }, [bot.name]);

  const clamped    = Math.min(Math.max(amount, bot.minInvest), bot.maxInvest);
  const sliderPct  = bot.maxInvest > bot.minInvest
    ? ((clamped - bot.minInvest) / (bot.maxInvest - bot.minInvest)) * 100
    : 0;
  const dailyReturn = (clamped * bot.dailyPctMid) / 100;
  const insufficientBalance = clamped > userBalance;

  async function handleInvest() {
    setError("");
    if (clamped < bot.minInvest) { setError(`Minimum investment is $${bot.minInvest.toLocaleString()}`); return; }
    if (insufficientBalance) {
      setError(`Insufficient balance — you have $${userBalance.toFixed(2)}.`);
      toast.error(`Insufficient balance. Please deposit at least $${bot.minInvest.toLocaleString()}.`);
      return;
    }
    setLoading(true);
    const tid = toast.loading(`Activating ${bot.name}…`);
    try {
      const res = await fetch("/api/bots/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botName: bot.name, amount: clamped, autoReinvest }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Investment failed. Please try again.", { id: tid });
        setError(data.error || "Investment failed.");
        return;
      }
      setUserBalance(b => b - clamped);
      toast.success(`${bot.name} activated! $${clamped.toLocaleString(undefined, { minimumFractionDigits: 2 })} invested.`, { id: tid, duration: 5000 });
      window.dispatchEvent(new CustomEvent("balance-updated"));
      router.push("/dashboard/bot-trading/my-bots");
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back + Header */}
      <div>
        <Link href="/dashboard/bot-trading"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors mb-4">
          <ArrowLeft size={15}/> Back to Bots
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Bot className="text-primary-500" size={24}/> {bot.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">{bot.description}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-xs font-bold text-green-600 dark:text-green-400">{bot.status}</span>
          </div>
        </div>
      </div>

      {/* Active warning banner */}
      {activePlanId && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-500 mt-0.5" size={20}/>
            <div>
              <p className="font-extrabold text-green-700 dark:text-green-400 text-sm">Bot is Active & Running</p>
              <p className="text-xs text-green-600 dark:text-green-500">You currently have <span className="font-bold">${activeCapital.toLocaleString()}</span> invested in this bot.</p>
            </div>
          </div>
          <Link href="/dashboard/bot-trading/my-bots" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-extrabold text-xs rounded-xl transition-all text-center">
            Manage Investment
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — 2 cols */}
        <div className="lg:col-span-2 space-y-5">

          {/* Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-5">Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label:"Success Rate",    value:`${bot.winRate}%`,                               color:"text-green-500" },
                { label:"Total Trades",    value: simTrades.toLocaleString(),                     color:"text-gray-900 dark:text-white" },
                { label:"Total Profit",    value: `$${simProfit.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color:"text-green-500 font-extrabold" },
                { label:"Expected Return", value:`${bot.dailyPctMid.toFixed(2)}%`,                color:"text-primary-500" },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Trades Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"/> Live Execution Feed
              </h3>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin text-primary-500"/> Ticking
              </span>
            </div>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {tradeFeed.map((tr, idx) => {
                const isWin = tr.pnl > 0;
                return (
                  <div key={idx} className="flex items-center justify-between py-2 px-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl text-xs border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${tr.side === "BUY" ? "bg-green-100 dark:bg-green-950/40 text-green-600" : "bg-red-100 dark:bg-red-950/40 text-red-500"}`}>
                        {tr.side}
                      </span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{tr.pair}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${isWin ? "text-green-500" : "text-red-500"}`}>
                        {isWin ? "+" : ""}${tr.pnl.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400">{tr.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trading Strategy */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-5">Trading Strategy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon:<BarChart2 size={16} className="text-primary-500"/>, bg:"bg-primary-50 dark:bg-primary-900/20", label:"Strategy Type",     value: bot.strategyType },
                { icon:<Clock size={16} className="text-blue-500"/>,        bg:"bg-blue-50 dark:bg-blue-900/20",      label:"Trading Frequency", value: bot.tradingFrequency },
                { icon:<Shield size={16} className="text-green-500"/>,      bg:"bg-green-50 dark:bg-green-900/20",    label:"Risk Level",        value: bot.riskLevel },
                { icon:<TrendingUp size={16} className="text-purple-500"/>, bg:"bg-purple-50 dark:bg-purple-900/20",  label:"Win Rate",          value: `${bot.winRate}%` },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center flex-shrink-0`}>{r.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-0.5">{r.label}</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 mb-2">Trading Pairs</p>
              <div className="flex flex-wrap gap-2">
                {bot.pairs.map(p => (
                  <span key={p} className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-gray-400"/>
              <h3 className="font-extrabold text-gray-900 dark:text-white">Description</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{bot.longDesc}</p>
          </div>
        </div>

        {/* RIGHT — Investment panel */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-6 space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white">Investment Details</h3>

            {/* Key details */}
            <div className="space-y-2">
              {[
                { label:"Minimum Investment", value:`$${bot.minInvest.toLocaleString()}.00` },
                { label:"Maximum Investment", value:`$${bot.maxInvest.toLocaleString()}.00` },
                { label:"Daily Profit",       value: bot.dailyROI, green: true },
                { label:"Duration",           value:`${bot.duration} Days` },
                { label:"Expected ROI",       value:`${bot.dailyPctMid.toFixed(2)}%`, green: true },
                { label:"Risk Level",         value: bot.riskLevel },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-700 pb-1.5 last:border-0">
                  <span className="text-gray-400 text-xs">{r.label}</span>
                  <span className={`font-bold text-xs ${r.green ? "text-green-500" : "text-gray-900 dark:text-white"}`}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Balance */}
            <div className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-gray-400 font-semibold">Your Balance</span>
              <span className={`font-extrabold ${userBalance >= bot.minInvest ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Deposit shortcut triggers */}
            {insufficientBalance && (
              <Link
                href="/dashboard/wallet?tab=deposit"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl transition-colors shadow-md shadow-orange-500/20"
              >
                <Wallet size={13}/> Insufficient Balance — Deposit Funds
              </Link>
            )}

            {/* Amount input */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block">Investment Amount</label>
              <div className="flex items-center gap-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 mb-2">
                <span className="text-gray-400 font-bold text-sm">$</span>
                <input type="number" min={bot.minInvest} max={bot.maxInvest} value={amount}
                  onChange={e => { setAmount(Number(e.target.value)); setError(""); }}
                  className="flex-1 bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none"/>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-2">
                <span>Min: ${bot.minInvest.toLocaleString()}.00</span>
                <span>Max: ${bot.maxInvest.toLocaleString()}.00</span>
              </div>
              <input type="range" min={bot.minInvest} max={bot.maxInvest}
                step={Math.max(50, Math.floor(bot.minInvest / 2))}
                value={clamped} onChange={e => { setAmount(Number(e.target.value)); setError(""); }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer mb-3"
                style={{ background: `linear-gradient(to right,#E31937 0%,#E31937 ${sliderPct}%,#e5e7eb ${sliderPct}%,#e5e7eb 100%)` }}/>
            </div>

            {/* Daily return preview */}
            <div className="flex justify-between text-xs bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-xl">
              <span className="text-gray-400">Potential Daily Return</span>
              <span className="font-extrabold text-primary-500">${dailyReturn.toFixed(2)}/day</span>
            </div>

            {/* Auto-reinvest */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={autoReinvest} onChange={e => setAutoReinvest(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"/>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Auto-reinvest profits</span>
            </label>

            {/* Error */}
            {error && !insufficientBalance && (
              <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold">
                <AlertCircle size={12} className="flex-shrink-0 mt-0.5"/> {error}
              </div>
            )}

            {/* Start Investment */}
            <button onClick={handleInvest} disabled={loading || insufficientBalance}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
              {loading ? <><Loader2 size={15} className="animate-spin"/> Processing…</> : <><TrendingUp size={15}/> Start Investment</>}
            </button>

            {/* Risk info */}
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
              <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 mb-1 flex items-center gap-1">
                <AlertCircle size={10}/> Risk Information
              </p>
              <ul className="space-y-1 text-[10px] text-orange-600 dark:text-orange-400">
                <li>• Trading involves substantial risk and may result in loss of capital.</li>
                <li>• Past performance does not guarantee future results.</li>
                <li>• Only invest what you can afford to lose.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
