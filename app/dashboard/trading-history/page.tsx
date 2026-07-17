"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Home, ChevronRight, BarChart2, TrendingUp, TrendingDown,
  ArrowDownCircle, ArrowUpCircle, Activity, RefreshCw,
  Loader2, AlertCircle, Calendar, Search, Download,
  Filter, ChevronDown, X, DollarSign, ShoppingBag,
  ShieldCheck, CheckCircle2, Clock, XCircle, Bitcoin,
  Building2, LineChart, Wallet, CreditCard, Receipt,
  ArrowRight, ChevronLeft, Eye,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Tx {
  id: string;
  type: string;
  amount: number;
  method: string;
  address: string | null;
  status: string;
  proofImageUrl?: string | null;
  createdAt: string;
}

interface TradePlan {
  id: string;
  planName: string;
  capital: number;
  rate: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  category: string | null;
  createdAt: string;
}

interface LiveTrade {
  id: string;
  pair: string;
  name: string;
  category: string;
  side: string;
  entryPrice: number;
  amount: number;
  leverage: number;
  status: string;
  closePrice: number | null;
  pnl: number | null;
  pnlPct: number | null;
  openedAt: string;
  closedAt: string | null;
}

type TabType = "All" | "Investments" | "Deposits" | "Withdrawals" | "Trades";
type DateRange = "all" | "today" | "week" | "month";

/* ─────────────────────────────────────────────
   Config Maps
───────────────────────────────────────────── */
const TYPE_LABEL: Record<string, string> = {
  DEPOSIT:                   "Deposit",
  WITHDRAWAL:                "Withdrawal",
  INVESTMENT:                "Investment Subscription",
  PROFIT:                    "Profit Credit",
  ADMIN_CREDIT:              "Admin Credit",
  PLAN_REFUND:               "Plan Cancelled – Refund",
  PLAN_APPROVED:             "Investment Plan Approved",
  PLAN_REJECTED:             "Investment Plan Rejected",
  VIP_PURCHASE:              "VIP Membership Purchase",
  VIP_ACTIVATED:             "VIP Membership Activated",
  VIP_APPROVED:              "VIP Membership Approved",
  VIP_REJECTED:              "VIP Membership Rejected",
  VIP_PURCHASE_SUBMITTED:    "VIP Application Submitted",
  CAR_PURCHASE:              "Vehicle Order Purchase",
  ORDER_SUBMITTED:           "Vehicle Order Submitted",
  ORDER_APPROVED:            "Vehicle Order Approved",
  CAR_ORDER_APPROVED:        "Vehicle Order Approved",
  CAR_ORDER_REJECTED:        "Vehicle Order Rejected",
  DEPOSIT_APPROVED:          "Deposit Approved",
  DEPOSIT_REJECTED:          "Deposit Rejected",
  PAYMENT_PROOF_SUBMITTED:   "Payment Proof Submitted",
  REAL_ESTATE_APPROVED:      "Real Estate Plan Approved",
  REAL_ESTATE_REJECTED:      "Real Estate Plan Rejected",
};

function txLabel(type: string) {
  return TYPE_LABEL[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/** Is this transaction a debit (money leaves user account)? */
function isDebit(type: string) {
  return ["WITHDRAWAL", "INVESTMENT", "CAR_PURCHASE", "VIP_PURCHASE"].includes(type);
}

/** Is this transaction a credit (money enters user account)? */
function isCredit(type: string) {
  return ["DEPOSIT", "PROFIT", "ADMIN_CREDIT", "DEPOSIT_APPROVED", "PLAN_REFUND"].includes(type);
}

/** Which filter tab does this transaction belong to? */
function txTab(tx: Tx): TabType {
  if (tx.type === "DEPOSIT" || tx.type === "DEPOSIT_APPROVED") return "Deposits";
  if (tx.type === "WITHDRAWAL") return "Withdrawals";
  if (["INVESTMENT", "PLAN_REFUND", "PLAN_APPROVED", "PLAN_REJECTED"].includes(tx.type)) return "Investments";
  return "All";
}

/* ─────────────────────────────────────────────
   Icon helper
───────────────────────────────────────────── */
function TxIcon({ type }: { type: string }) {
  const base = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0";

  if (type === "DEPOSIT" || type === "DEPOSIT_APPROVED")
    return <div className={`${base} bg-green-50 dark:bg-green-900/20`}><ArrowDownCircle size={18} className="text-green-500" /></div>;

  if (type === "WITHDRAWAL")
    return <div className={`${base} bg-orange-50 dark:bg-orange-900/20`}><ArrowUpCircle size={18} className="text-orange-500" /></div>;

  if (type === "INVESTMENT")
    return <div className={`${base} bg-primary-50 dark:bg-primary-900/20`}><TrendingUp size={18} className="text-primary-500" /></div>;

  if (type === "PROFIT" || type === "ADMIN_CREDIT")
    return <div className={`${base} bg-emerald-50 dark:bg-emerald-900/20`}><DollarSign size={18} className="text-emerald-500" /></div>;

  if (type === "PLAN_REFUND")
    return <div className={`${base} bg-blue-50 dark:bg-blue-900/20`}><Wallet size={18} className="text-blue-500" /></div>;

  if (type.includes("VIP"))
    return <div className={`${base} bg-purple-50 dark:bg-purple-900/20`}><ShieldCheck size={18} className="text-purple-500" /></div>;

  if (type.includes("CAR") || type.includes("ORDER"))
    return <div className={`${base} bg-red-50 dark:bg-red-900/20`}><ShoppingBag size={18} className="text-primary-500" /></div>;

  if (type.includes("REAL_ESTATE"))
    return <div className={`${base} bg-green-50 dark:bg-green-900/20`}><Building2 size={18} className="text-green-500" /></div>;

  if (type.includes("REJECTED"))
    return <div className={`${base} bg-red-50 dark:bg-red-900/20`}><XCircle size={18} className="text-red-500" /></div>;

  if (type.includes("APPROVED"))
    return <div className={`${base} bg-green-50 dark:bg-green-900/20`}><CheckCircle2 size={18} className="text-green-500" /></div>;

  if (type.includes("SUBMITTED") || type.includes("PENDING"))
    return <div className={`${base} bg-yellow-50 dark:bg-yellow-900/20`}><Clock size={18} className="text-yellow-500" /></div>;

  return <div className={`${base} bg-gray-50 dark:bg-gray-700`}><Activity size={18} className="text-gray-400" /></div>;
}

function TradeIcon({ side }: { side: string }) {
  const base = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0";
  if (side === "BUY") return <div className={`${base} bg-green-50 dark:bg-green-900/20`}><TrendingUp size={18} className="text-green-500" /></div>;
  return <div className={`${base} bg-red-50 dark:bg-red-900/20`}><TrendingDown size={18} className="text-primary-500" /></div>;
}

/* ─────────────────────────────────────────────
   Status badge
───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    APPROVED:  "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    WIN:       "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    CLOSED:    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    OPEN:      "bg-blue-100 dark:bg-blue-900/30 text-blue-500",
    PENDING:   "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    REJECTED:  "bg-red-100 dark:bg-red-900/30 text-red-500",
    LOSS:      "bg-red-100 dark:bg-red-900/30 text-red-500",
    ACTIVE:    "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  };
  const cls = map[status] ?? "bg-gray-100 dark:bg-gray-700 text-gray-500";
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${cls}`}>{label}</span>;
}

/* ─────────────────────────────────────────────
   Method badge
───────────────────────────────────────────── */
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    BTC:     "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
    ETH:     "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    USDT:    "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    BNB:     "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    SOLANA:  "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    SOL:     "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    BALANCE: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    PLAN:    "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  };
  const cls = colors[method] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600";
  return <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${cls}`}>{method}</span>;
}

/* ─────────────────────────────────────────────
   Transaction Detail Modal
───────────────────────────────────────────── */
function TxDetailModal({ tx, onClose }: { tx: Tx; onClose: () => void }) {
  const credit = isCredit(tx.type);
  const debit  = isDebit(tx.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <TxIcon type={tx.type} />
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">{txLabel(tx.type)}</h2>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{tx.id.slice(0, 12).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Amount */}
          <div className="text-center py-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl">
            <p className="text-[10px] text-gray-400 font-semibold mb-1">Amount</p>
            <p className={`text-3xl font-black ${credit ? "text-green-600 dark:text-green-400" : debit ? "text-primary-500" : "text-gray-900 dark:text-white"}`}>
              {credit ? "+" : debit ? "-" : ""}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2"><StatusBadge status={tx.status} /></div>
          </div>

          {/* Details grid */}
          <div className="space-y-3">
            {[
              { label: "Transaction Type", value: txLabel(tx.type) },
              { label: "Payment Method", value: tx.method },
              { label: "Date & Time", value: new Date(tx.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) },
              ...(tx.address ? [{ label: "Reference / Address", value: tx.address, mono: true }] : []),
              { label: "Transaction ID", value: tx.id.toUpperCase(), mono: true },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-start gap-4 text-xs">
                <span className="text-gray-400 flex-shrink-0">{r.label}</span>
                <span className={`font-bold text-gray-700 dark:text-gray-300 text-right ${(r as {mono?: boolean}).mono ? "font-mono text-[10px] break-all" : ""}`}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* View proof link */}
          {tx.proofImageUrl && (
            <a href={tx.proofImageUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary-500 hover:text-primary-600 font-bold">
              <Eye size={13} /> View Payment Proof Screenshot
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Balance Flow Chart — only COMPLETED transactions
   that actually changed the user's balance
───────────────────────────────────────────── */
function BalanceChart({ txs }: { txs: Tx[] }) {
  // Step 1: Keep only COMPLETED transactions that actually move money
  const effective = [...txs]
    .filter(tx => tx.status === "COMPLETED" && (isCredit(tx.type) || isDebit(tx.type)))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (effective.length < 2) return null;

  // Step 2: Build running balance array starting from $0
  let running = 0;
  const dataPoints: { balance: number; date: Date; label: string }[] = [
    { balance: 0, date: new Date(effective[0].createdAt), label: "" }, // baseline origin
  ];

  for (const tx of effective) {
    if (isCredit(tx.type))  running += tx.amount;
    else if (isDebit(tx.type)) running = Math.max(0, running - tx.amount);
    dataPoints.push({
      balance: running,
      date: new Date(tx.createdAt),
      label: new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  const values = dataPoints.map(p => p.balance);
  const maxVal = Math.max(...values, 1);
  const currentBalance = values[values.length - 1];
  const netChange = currentBalance; // starts from 0 baseline
  const changeSign = netChange >= 0 ? "+" : "";

  // Step 3: SVG layout
  const W = 560, H = 90, PAD_LEFT = 0, PAD_RIGHT = 0;
  const innerW = W - PAD_LEFT - PAD_RIGHT;

  const toX = (i: number) => PAD_LEFT + (i / (dataPoints.length - 1)) * innerW;
  const toY = (v: number) => H - (v / maxVal) * H;

  const coords = dataPoints.map((p, i) => `${toX(i).toFixed(1)},${toY(p.balance).toFixed(1)}`).join(" ");

  // Pick ~4 evenly-spaced label positions for X-axis
  const labelStep = Math.max(1, Math.floor(dataPoints.length / 4));
  const xLabels = dataPoints
    .map((p, i) => ({ ...p, i }))
    .filter((_, i) => i === 0 || i === dataPoints.length - 1 || i % labelStep === 0)
    .slice(0, 5);

  // Y-axis labels at 0%, 50%, 100%
  const yLabels = [
    { pct: 1,   val: maxVal },
    { pct: 0.5, val: maxVal * 0.5 },
    { pct: 0,   val: 0 },
  ];

  const fmt$ = (n: number) =>
    n >= 1000 ? "$" + (n / 1000).toFixed(1) + "k" : "$" + n.toFixed(0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Balance Flow</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Based on {effective.length} completed transactions
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Current Balance</p>
            <p className="text-sm font-black text-gray-900 dark:text-white">
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Net Change</p>
            <p className={`text-sm font-black ${netChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {changeSign}${Math.abs(netChange).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex gap-3">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-[9px] text-gray-400 text-right pr-1 flex-shrink-0" style={{ height: H }}>
          {yLabels.map(y => (
            <span key={y.pct}>{fmt$(y.val)}</span>
          ))}
        </div>

        {/* SVG chart area */}
        <div className="flex-1 relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: H }}>
            <defs>
              <linearGradient id="bf-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ef4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {yLabels.map(y => {
              const yPos = toY(y.val * maxVal).toFixed(1);
              return (
                <line
                  key={y.pct}
                  x1={PAD_LEFT} y1={yPos} x2={W - PAD_RIGHT} y2={yPos}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-100 dark:text-gray-700"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area fill */}
            <polygon
              points={`${PAD_LEFT},${H} ${coords} ${W - PAD_RIGHT},${H}`}
              fill="url(#bf-grad)"
            />

            {/* Line */}
            <polyline
              points={coords}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data point dots at each transaction */}
            {dataPoints.map((p, i) => (
              <circle
                key={i}
                cx={toX(i).toFixed(1)}
                cy={toY(p.balance).toFixed(1)}
                r="2.5"
                fill="#ef4444"
                className="opacity-70"
              />
            ))}

            {/* Current balance endpoint dot (larger) */}
            <circle
              cx={toX(dataPoints.length - 1).toFixed(1)}
              cy={toY(currentBalance).toFixed(1)}
              r="5"
              fill="#ef4444"
              stroke="white"
              strokeWidth="2"
            />
          </svg>

          {/* X-axis date labels */}
          <div className="relative mt-1" style={{ height: 14 }}>
            {xLabels.map(({ i, label }) => {
              if (!label) return null;
              const pctLeft = (i / (dataPoints.length - 1)) * 100;
              return (
                <span
                  key={i}
                  className="absolute text-[9px] text-gray-400 -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${pctLeft}%` }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Export CSV
───────────────────────────────────────────── */
function exportCSV(txs: Tx[], plans: TradePlan[], trades: LiveTrade[]) {
  const headers = ["Date", "Type", "Description", "Amount ($)", "Method", "Status", "ID"];
  const txRows = txs.map(tx => [
    new Date(tx.createdAt).toLocaleDateString(),
    isDebit(tx.type) ? "DEBIT" : isCredit(tx.type) ? "CREDIT" : "OTHER",
    txLabel(tx.type) + (tx.address ? ` · ${tx.address}` : ""),
    (isDebit(tx.type) ? "-" : "+") + tx.amount.toFixed(2),
    tx.method,
    tx.status,
    tx.id,
  ]);
  const planRows = plans.map(p => [
    new Date(p.createdAt).toLocaleDateString(),
    "INVESTMENT_PLAN",
    p.planName,
    "+" + p.capital.toFixed(2),
    p.paymentMethod || "BALANCE",
    p.status,
    p.id,
  ]);
  const tradeRows = trades.map(t => [
    new Date(t.openedAt).toLocaleDateString(),
    t.side + "_TRADE",
    `${t.name} (${t.pair})`,
    (t.pnl !== null ? (t.pnl >= 0 ? "+" : "") + t.pnl.toFixed(2) : "-" + t.amount.toFixed(2)),
    t.side,
    t.status,
    t.id,
  ]);

  const all = [headers, ...txRows, ...planRows, ...tradeRows];
  const csv = all.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tesla-capx-performance-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────
   Date range filter helper
───────────────────────────────────────────── */
function withinRange(dateStr: string, range: DateRange): boolean {
  if (range === "all") return true;
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  if (range === "today") return d >= now - 86_400_000;
  if (range === "week")  return d >= now - 7  * 86_400_000;
  if (range === "month") return d >= now - 30 * 86_400_000;
  return true;
}

const PAGE_SIZE = 10;

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function PerformanceHistoryPage() {
  const [txs,    setTxs]    = useState<Tx[]>([]);
  const [plans,  setPlans]  = useState<TradePlan[]>([]);
  const [trades, setTrades] = useState<LiveTrade[]>([]);

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [tab,        setTab]        = useState<TabType>("All");
  const [dateRange,  setDateRange]  = useState<DateRange>("all");
  const [search,     setSearch]     = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState<Tx | null>(null);

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const [txRes, planRes, tradeRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/plans"),
        fetch("/api/trade"),
      ]);
      const [txData, planData, tradeData] = await Promise.all([
        txRes.ok  ? txRes.json()  : [],
        planRes.ok  ? planRes.json()  : [],
        tradeRes.ok ? tradeRes.json() : [],
      ]);
      setTxs(Array.isArray(txData) ? txData : []);
      setPlans(Array.isArray(planData) ? planData : []);
      setTrades(Array.isArray(tradeData) ? tradeData : []);
    } catch {
      setError("Could not load performance history. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Real stats from actual investment plans ── */
  const activePlans    = useMemo(() => plans.filter(p => p.status === "ACTIVE"), [plans]);
  const completedPlans = useMemo(() => plans.filter(p => p.status === "COMPLETED"), [plans]);
  const wins           = useMemo(() => trades.filter(t => t.status === "WIN" || (t.pnl !== null && t.pnl > 0)).length, [trades]);
  const losses         = useMemo(() => trades.filter(t => t.status === "LOSS" || (t.pnl !== null && t.pnl < 0)).length, [trades]);
  const totalDeposited = useMemo(() => txs.filter(t => t.type === "DEPOSIT" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0), [txs]);
  const totalWithdrawn = useMemo(() => txs.filter(t => t.type === "WITHDRAWAL" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0), [txs]);
  const totalProfit    = useMemo(() => txs.filter(t => t.type === "PROFIT" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0), [txs]);
  const totalVolume    = useMemo(() => txs.filter(t => t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0), [txs]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return txs.filter(tx => {
      const matchTab =
        tab === "All"         ? true :
        tab === "Deposits"    ? (tx.type === "DEPOSIT" || tx.type === "DEPOSIT_APPROVED") :
        tab === "Withdrawals" ? tx.type === "WITHDRAWAL" :
        tab === "Investments" ? ["INVESTMENT", "PLAN_REFUND", "PLAN_APPROVED", "PLAN_REJECTED"].includes(tx.type) :
        false;

      const matchDate   = withinRange(tx.createdAt, dateRange);
      const matchSearch = !q ||
        txLabel(tx.type).toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q) ||
        String(tx.amount).includes(q) ||
        (tx.address ?? "").toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q);

      return matchTab && matchDate && matchSearch;
    });
  }, [txs, tab, dateRange, search]);

  /* Trades for the "Trades" tab */
  const filteredTrades = useMemo(() => {
    if (tab !== "Trades") return [];
    const q = search.toLowerCase();
    return trades.filter(t => {
      const matchDate = withinRange(t.openedAt, dateRange);
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.pair.toLowerCase().includes(q) ||
        t.side.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q);
      return matchDate && matchSearch;
    });
  }, [trades, tab, dateRange, search]);

  /* Pagination */
  const totalItems = tab === "Trades" ? filteredTrades.length : filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pagedTxs   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagedTrades = filteredTrades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  const handleTabChange = (t: TabType) => { setTab(t); setPage(1); };
  const handleSearch    = (v: string) => { setSearch(v); setPage(1); };
  const handleRange     = (r: DateRange) => { setDateRange(r); setPage(1); };

  const TABS: { id: TabType; label: string; count: number }[] = [
    { id: "All",         label: "All",         count: txs.length },
    { id: "Investments", label: "Investments", count: txs.filter(t => ["INVESTMENT","PLAN_REFUND","PLAN_APPROVED","PLAN_REJECTED"].includes(t.type)).length },
    { id: "Deposits",    label: "Deposits",    count: txs.filter(t => t.type === "DEPOSIT" || t.type === "DEPOSIT_APPROVED").length },
    { id: "Withdrawals", label: "Withdrawals", count: txs.filter(t => t.type === "WITHDRAWAL").length },
    { id: "Trades",      label: "Live Trades", count: trades.length },
  ];

  const DATE_OPTIONS: { id: DateRange; label: string }[] = [
    { id: "all",   label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week",  label: "This Week" },
    { id: "month", label: "This Month" },
  ];

  const emptyMessage: Record<TabType, string> = {
    All:         "No activity recorded yet.",
    Investments: "No investment transactions found.",
    Deposits:    "No deposits recorded yet.",
    Withdrawals: "No withdrawals recorded yet.",
    Trades:      "No live trades placed yet.",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Transaction Detail Modal */}
      {selected && <TxDetailModal tx={selected} onClose={() => setSelected(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Home size={11} />
        <Link href="/dashboard" className="hover:text-primary-500 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-gray-600 dark:text-gray-300 font-semibold">Performance History</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">Performance History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all your investments, deposits, withdrawals and live trades</p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <button
              onClick={() => exportCSV(txs, plans, trades)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Deposited",   value: "$" + totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: <ArrowDownCircle size={16} className="text-green-500" />,  bg: "bg-green-50 dark:bg-green-900/20"  },
            { label: "Total Withdrawn",   value: "$" + totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: <ArrowUpCircle size={16} className="text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-900/20" },
            { label: "Active Plans",      value: `${activePlans.length} active · ${completedPlans.length} done`, icon: <TrendingUp size={16} className="text-primary-500" />, bg: "bg-red-50 dark:bg-red-900/20"    },
            { label: "Live Trade W/L",    value: `${wins}W / ${losses}L`, icon: <Activity size={16} className="text-purple-500" />,  bg: "bg-purple-50 dark:bg-purple-900/20" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">{s.label}</p>
                <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balance chart */}
      {!loading && !error && txs.filter(t => t.status === "COMPLETED").length > 1 && (
        <BalanceChart txs={txs} />
      )}

      {/* Main card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Top bar: title + search + filter */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white">Activity Log</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">{totalItems} records {dateRange !== "all" ? `· ${DATE_OPTIONS.find(d => d.id === dateRange)?.label}` : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-primary-400 w-36 sm:w-48 transition-colors"
                />
                {search && (
                  <button onClick={() => handleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={11} />
                  </button>
                )}
              </div>
              {/* Date filter toggle */}
              <button
                onClick={() => setShowFilter(f => !f)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border rounded-xl transition-colors ${showFilter ? "bg-primary-500 border-primary-500 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-500"}`}
              >
                <Filter size={12} /> Filter <ChevronDown size={11} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Date range pills (collapsible) */}
          {showFilter && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              {DATE_OPTIONS.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleRange(d.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${dateRange === d.id ? "bg-primary-500 text-white shadow-sm" : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${tab === t.id ? "bg-primary-500 text-white shadow-sm shadow-primary-500/20" : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"}`}
              >
                {t.label}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-primary-500" />
            <p className="text-sm text-gray-400">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center p-6">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button onClick={() => fetchAll()} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <BarChart2 size={26} className="text-gray-400" />
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">Nothing here yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">{emptyMessage[tab]}</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/30">
              <span className="w-10" />
              <span>Details</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
              <span className="w-20 text-right">ID</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {tab === "Trades" ? (
                pagedTrades.map(trade => {
                  const pnlColor = trade.pnl === null ? "" : trade.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500";
                  return (
                    <div key={trade.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <TradeIcon side={trade.side} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {trade.side} · {trade.name}
                          <span className="ml-2 text-[10px] font-mono text-gray-400">{trade.pair}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={9} />
                          {new Date(trade.openedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          &nbsp;·&nbsp;
                          <span className="font-semibold">{trade.leverage}x leverage</span>
                          {trade.closedAt && <>&nbsp;·&nbsp;closed {new Date(trade.closedAt).toLocaleDateString()}</>}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-black ${pnlColor || "text-gray-900 dark:text-white"}`}>
                          {trade.pnl !== null ? (trade.pnl >= 0 ? "+" : "") + "$" + Math.abs(trade.pnl).toFixed(2) : "-$" + trade.amount.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-400">${trade.amount.toLocaleString()} invested</p>
                      </div>
                      <div className="flex-shrink-0"><StatusBadge status={trade.status} /></div>
                      <div className="hidden sm:block text-[10px] font-mono text-gray-300 dark:text-gray-600 flex-shrink-0 w-20 text-right">
                        {trade.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  );
                })
              ) : (
                pagedTxs.map(tx => {
                  const credit = isCredit(tx.type);
                  const debit  = isDebit(tx.type);
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelected(tx)}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer group"
                    >
                      <TxIcon type={tx.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {txLabel(tx.type)}
                          {tx.address ? <span className="text-gray-400 font-normal"> · {tx.address}</span> : ""}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 flex-wrap">
                          <Calendar size={9} />
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          &nbsp;·&nbsp;
                          <MethodBadge method={tx.method} />
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-black ${credit ? "text-green-600 dark:text-green-400" : debit ? "text-primary-500" : "text-gray-900 dark:text-white"}`}>
                          {credit ? "+" : debit ? "-" : ""}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex-shrink-0"><StatusBadge status={tx.status} /></div>
                      <div className="hidden sm:block text-[10px] font-mono text-gray-300 dark:text-gray-600 group-hover:text-gray-400 flex-shrink-0 w-20 text-right">
                        {tx.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400">
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${page === p ? "bg-primary-500 text-white shadow-sm" : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-xs text-gray-400">…{totalPages}</span>}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 transition-colors"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom summary */}
      {!loading && !error && txs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Activity size={18} className="text-primary-500" />,  bg: "bg-red-50 dark:bg-red-900/20",    label: "Total Volume (Completed)", value: "$" + totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
            { icon: <TrendingUp size={18} className="text-green-500" />,  bg: "bg-green-50 dark:bg-green-900/20",   label: "Total Profit Credited",   value: "$" + totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
            { icon: <TrendingDown size={18} className="text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-900/20", label: "Total Withdrawn",       value: "$" + totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">{s.label}</p>
                <p className="text-base font-black text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
