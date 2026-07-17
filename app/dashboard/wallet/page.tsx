"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowDownCircle, ArrowUpCircle, History, Wallet,
  RefreshCw, Loader2, ArrowRightLeft, TrendingUp, TrendingDown,
  ArrowRight, Clock, CheckCircle2, AlertCircle, X,
} from "lucide-react";

interface Tx {
  id: string;
  type: string;
  amount: number;
  method: string;
  address: string | null;
  status: string;
  createdAt: string;
}

function fmt(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WalletOverviewPage() {
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [meRes, txRes] = await Promise.all([
        fetch("/api/user/me"),
        fetch("/api/transactions"),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        if (d?.balance !== undefined) setBalance(Number(d.balance));
      }
      if (txRes.ok) {
        const d = await txRes.json();
        setTxs(Array.isArray(d) ? d : []);
      }
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculations
  const completedDeposits = txs
    .filter(t => t.type === "DEPOSIT" && t.status === "COMPLETED")
    .reduce((s, t) => s + t.amount, 0);

  const completedWithdrawals = txs
    .filter(t => t.type === "WITHDRAWAL" && t.status === "COMPLETED")
    .reduce((s, t) => s + t.amount, 0);

  const pendingRequests = txs.filter(t => t.status === "PENDING").length;

  const recentTxs = txs.slice(0, 3);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
            <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-4">Transaction Receipt</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Date & Time</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {new Date(selectedTx.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Type</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Method</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedTx.method}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Status</span>
                <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  selectedTx.status === "COMPLETED"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : selectedTx.status === "REJECTED"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                }`}>{selectedTx.status}</span>
              </div>
              {selectedTx.address && (
                <div className="flex justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400">Details</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 text-right break-all max-w-[200px]">{selectedTx.address}</span>
                </div>
              )}
            </div>
            <div className="text-center py-2">
              <p className="text-xs text-gray-400 mb-1">Amount</p>
              <p className={`text-2xl font-black ${selectedTx.type === "WITHDRAWAL" ? "text-orange-500" : "text-green-600 dark:text-green-400"}`}>
                {selectedTx.type === "WITHDRAWAL" ? "-" : "+"} {fmt(selectedTx.amount)}
              </p>
            </div>
            <button onClick={() => setSelectedTx(null)} className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">Wallet & Finance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your balances, deposits, withdrawals, and transfers</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <p className="text-sm text-gray-400">Loading wallet data…</p>
        </div>
      ) : (
        <>
          {/* Active Balance Card & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Balance card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between" style={{ minHeight: 180 }}>
              {/* Background watermark pattern */}
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <Wallet size={160} />
              </div>
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Available Balance</span>
                <Wallet size={20} className="text-white/60" />
              </div>
              <div className="my-4 z-10">
                <p className="text-3xl lg:text-4xl font-black">{fmt(balance)}</p>
              </div>
              <div className="flex items-center gap-3 z-10 pt-2">
                <Link href="/dashboard/wallet/deposit" className="flex-1 py-2 bg-white hover:bg-gray-50 text-primary-600 font-extrabold text-xs rounded-xl text-center shadow-md shadow-black/10 transition-colors">
                  Deposit
                </Link>
                <Link href="/dashboard/wallet/withdraw" className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs rounded-xl text-center transition-colors">
                  Withdraw
                </Link>
              </div>
            </div>

            {/* Quick stats side panel */}
            <div className="grid grid-rows-3 gap-3">
              {[
                { label: "Total Deposited", val: fmt(completedDeposits), color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
                { label: "Total Withdrawn", val: fmt(completedWithdrawals), color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
                { label: "Pending Requests", val: pendingRequests.toString(), color: pendingRequests > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-500", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-semibold text-gray-400">{s.label}</span>
                  <span className={`text-sm font-black ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Action Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Deposit Funds",   href: "/dashboard/wallet/deposit",      icon: <ArrowDownCircle size={18} className="text-green-500" />,  desc: "Add cash" },
              { label: "Withdraw Funds",  href: "/dashboard/wallet/withdraw",     icon: <ArrowUpCircle size={18} className="text-primary-500" />,  desc: "To your address" },
              { label: "Send Funds",      href: "/dashboard/wallet/transfer",     icon: <ArrowRightLeft size={18} className="text-orange-500" />,  desc: "Internal transfer" },
              { label: "Transactions",    href: "/dashboard/wallet/transactions",  icon: <History size={18} className="text-blue-500" />,           desc: "History logs" },
            ].map(c => (
              <Link key={c.label} href={c.href}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2 hover:shadow-md hover:border-primary-400 dark:hover:border-primary-600 transition-all shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900/60 flex items-center justify-center">{c.icon}</div>
                <div>
                  <p className="font-extrabold text-xs text-gray-900 dark:text-white leading-tight">{c.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-1.5"><History size={16} className="text-gray-400" /> Recent Transactions</h2>
              <Link href="/dashboard/wallet/transactions" className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {recentTxs.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center gap-2">
                <Clock size={24} className="text-gray-300" />
                <p className="text-xs text-gray-400 font-semibold">No recent transactions</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentTxs.map(t => {
                  const isSent = t.type === "WITHDRAWAL";
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTx(t)}
                      className="w-full text-left flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSent ? "bg-orange-50 dark:bg-orange-950/20" : "bg-green-50 dark:bg-green-950/20"
                      }`}>
                        {isSent ? <TrendingDown size={14} className="text-orange-500" /> : <TrendingUp size={14} className="text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{t.type} · {t.method}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-black ${isSent ? "text-orange-500" : "text-green-600 dark:text-green-400"}`}>
                          {isSent ? "-" : "+"} {fmt(t.amount)}
                        </p>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                          t.status === "COMPLETED"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : t.status === "REJECTED"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                        }`}>{t.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
