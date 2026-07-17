"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ActivitySquare,
  Search,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
  DollarSign,
  Gift,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

type Tx = {
  id: string;
  type: string;
  amount: number;
  method: string;
  address: string | null;
  status: string;
  createdAt: string;
};

type Tab = "DEPOSIT" | "WITHDRAWAL" | "OTHER";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "DEPOSIT",    label: "Deposits",    icon: <ArrowDownCircle size={15} /> },
  { id: "WITHDRAWAL", label: "Withdrawals", icon: <ArrowUpCircle size={15} /> },
  { id: "OTHER",      label: "Others",      icon: <ActivitySquare size={15} /> },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    PENDING:   { label: "Pending",   className: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800", icon: <Clock size={11} /> },
    COMPLETED: { label: "Completed", className: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",   icon: <CheckCircle2 size={11} /> },
    REJECTED:  { label: "Rejected",  className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",               icon: <XCircle size={11} /> },
  };
  const s = map[status] ?? map["PENDING"];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.className}`}>
      {s.icon} {s.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    BTC:        "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
    ETH:        "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800",
    USDT:       "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    BNB:        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    SOLANA:     "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
    SOL:        "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
    BALANCE:    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    PLAN:       "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
    BOT:        "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    COPY_TRADE: "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-800",
    REFERRAL:   "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800",
    ADMIN:      "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  };
  const cls = colors[method] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-250 dark:border-gray-750";
  const label = method === "COPY_TRADE" ? "Copy Trade" : method;
  return <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${cls}`}>{label}</span>;
}

function TxIcon({ type }: { type: string }) {
  const isIncoming = ["DEPOSIT", "PROFIT", "ADMIN_CREDIT", "DEPOSIT_APPROVED", "PLAN_REFUND"].includes(type);
  const isOutgoing = ["WITHDRAWAL", "CAR_PURCHASE", "VIP_PURCHASE", "INVESTMENT"].includes(type);
  const isRejected = type.endsWith("REJECTED");

  if (isRejected) {
    return (
      <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0 animate-pulse">
        <XCircle size={18} className="text-red-500" />
      </div>
    );
  }

  if (isIncoming) {
    return (
      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
        <ArrowDownCircle size={18} className="text-green-500" />
      </div>
    );
  }

  if (isOutgoing) {
    if (type.includes("CAR")) {
      return (
        <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={18} className="text-primary-500" />
        </div>
      );
    }
    if (type.includes("VIP")) {
      return (
        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-purple-500" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
        <ArrowUpCircle size={18} className="text-primary-500" />
      </div>
    );
  }

  // Fallback / status approvals
  if (type.includes("APPROVED") || type.includes("ACTIVATED")) {
    return (
      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={18} className="text-green-500" />
      </div>
    );
  }

  if (type.includes("SUBMITTED")) {
    return (
      <div className="w-9 h-9 rounded-full bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center flex-shrink-0">
        <Clock size={18} className="text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
      <ActivitySquare size={18} className="text-blue-500" />
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " at " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatTxType(type: string) {
  const map: Record<string, string> = {
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    INVESTMENT: "Investment Subscription",
    VIP_PURCHASE: "VIP Membership Purchase",
    VIP_ACTIVATED: "VIP Membership Activated",
    VIP_PURCHASE_SUBMITTED: "VIP Application Submitted",
    VIP_APPROVED: "VIP Membership Approved",
    VIP_REJECTED: "VIP Membership Rejected",
    VIP_CANCELLED: "VIP Request Cancelled",
    CAR_PURCHASE: "Vehicle Order Purchase",
    ORDER_SUBMITTED: "Vehicle Order Submitted",
    ORDER_APPROVED: "Vehicle Order Approved",
    CAR_ORDER_APPROVED: "Vehicle Order Approved",
    CAR_ORDER_REJECTED: "Vehicle Order Rejected",
    PROFIT: "Referral Bonus/Profit",
    ADMIN_CREDIT: "Admin Credit Adjustment",
    DEPOSIT_APPROVED: "Deposit Approved",
    DEPOSIT_REJECTED: "Deposit Rejected",
    PLAN_APPROVED: "Investment Plan Approved",
    PLAN_REJECTED: "Investment Plan Rejected",
    REAL_ESTATE_APPROVED: "Real Estate Request Approved",
    REAL_ESTATE_REJECTED: "Real Estate Request Rejected",
    PAYMENT_PROOF_SUBMITTED: "Payment Proof Uploaded",
    PLAN_REFUND: "Plan Cancelled – Capital Refunded",
  };
  return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function AccountStatementPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("DEPOSIT");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) setTxs(await res.json());
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const isOther = (t: Tx) => t.type !== "DEPOSIT" && t.type !== "WITHDRAWAL";
    return txs.filter((t) => {
      const matchTab =
        activeTab === "DEPOSIT"    ? t.type === "DEPOSIT" :
        activeTab === "WITHDRAWAL" ? t.type === "WITHDRAWAL" :
        isOther(t);
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.method.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        String(t.amount).includes(q) ||
        (t.address ?? "").toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [txs, activeTab, search]);

  // Summary counts
  const totalDeposits   = txs.filter((t) => t.type === "DEPOSIT").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = txs.filter((t) => t.type === "WITHDRAWAL").reduce((s, t) => s + t.amount, 0);
  const pendingCount    = txs.filter((t) => t.status === "PENDING").length;

  const tabLabel: Record<Tab, string> = {
    DEPOSIT: "Deposit History",
    WITHDRAWAL: "Withdrawal History",
    OTHER: "Other Transactions",
  };
  const tabSub: Record<Tab, string> = {
    DEPOSIT: "Track your deposit transactions",
    WITHDRAWAL: "Track your withdrawal transactions",
    OTHER: "Investments, bots, and copy trades",
  };
  const searchPlaceholder: Record<Tab, string> = {
    DEPOSIT: "Search deposits...",
    WITHDRAWAL: "Search withdrawals...",
    OTHER: "Search transactions...",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
          <ActivitySquare size={24} className="text-primary-500" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor all your financial activities</p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Deposits", value: `$${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <ArrowDownCircle size={18} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Total Withdrawals", value: `$${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <ArrowUpCircle size={18} className="text-primary-500" />, bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "Pending", value: `${pendingCount} transaction${pendingCount !== 1 ? "s" : ""}`, icon: <Clock size={18} className="text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-900/20" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
              <p className="text-base font-extrabold text-gray-900 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-100 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="ml-auto p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Section header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4">
          <div>
            <h2 className="font-extrabold text-gray-900 dark:text-white">{tabLabel[activeTab]}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tabSub[activeTab]}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl w-full sm:w-56">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder[activeTab]}
              className="flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-3">
              <AlertTriangle size={22} className="text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No {activeTab.toLowerCase()} transactions found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? `No results for "${search}"` : "Transactions will appear here once you start trading"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["AMOUNT", "PAYMENT MODE", "STATUS", "DATE"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    {/* Amount */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <TxIcon type={tx.type} />
                        <div>
                          <p className="font-extrabold text-gray-900 dark:text-white">
                            ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatTxType(tx.type)}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Payment mode */}
                    <td className="px-5 py-4">
                      <MethodBadge method={tx.method} />
                      {tx.address && tx.address !== "WALLET_CONNECT" && tx.address !== tx.method && (
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[140px] truncate">{tx.address}</p>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-700 text-xs text-gray-400 text-right">
              Showing {filtered.length} of {txs.length} transaction{txs.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
