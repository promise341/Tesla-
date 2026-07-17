"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, RefreshCw, Loader2, TrendingUp, ArrowUpCircle,
  ArrowDownCircle, Search, SlidersHorizontal, ChevronDown, X,
  Clock, CheckCircle2, AlertCircle, FileText, Download,
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

function statusStyle(s: string) {
  if (s === "COMPLETED") return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
  if (s === "REJECTED")  return "bg-red-100 dark:bg-red-900/30 text-red-500";
  return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
}

export default function TransactionsPage() {
  const [txs, setTxs]           = useState<Tx[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRef]    = useState(false);
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  async function load(silent = false) {
    if (silent) setRef(true); else setLoading(true);
    try {
      const r = await fetch("/api/transactions");
      if (r.ok) {
        const d = await r.json();
        setTxs(Array.isArray(d) ? d : []);
      }
    } catch {}
    finally { setLoading(false); setRef(false); }
  }

  useEffect(() => { load(); }, []);

  // Filtered List
  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      const matchSearch = !searchQuery || 
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.address && tx.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.method.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchType = typeFilter === "All" || tx.type === typeFilter;
      const matchStatus = statusFilter === "All" || tx.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [txs, searchQuery, typeFilter, statusFilter]);

  // Unique Types
  const TYPES = ["All", "DEPOSIT", "WITHDRAWAL", "PROFIT", "COPY_TRADE", "BOT_INVESTMENT", "VIP_MEMBERSHIP"];
  const STATUSES = ["All", "COMPLETED", "PENDING", "REJECTED"];

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-1.5"><FileText size={18} className="text-primary-500" /> Transaction Receipt</h3>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono break-all max-w-[200px] text-right">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="font-bold text-gray-900 dark:text-white">{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedTx.method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className={`font-black text-[9px] px-2.5 py-0.5 rounded-full ${statusStyle(selectedTx.status)}`}>{selectedTx.status}</span>
              </div>
              {selectedTx.address && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
                  <p className="text-gray-400 font-semibold">Notes / Wallet Destination</p>
                  <p className="text-gray-800 dark:text-gray-300 font-medium break-all">{selectedTx.address}</p>
                </div>
              )}
            </div>

            <div className="text-center py-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl mb-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Amount</p>
              <p className={`text-3xl font-black mt-1 ${selectedTx.type === "WITHDRAWAL" || selectedTx.type === "COPY_TRADE" || selectedTx.type === "BOT_INVESTMENT" ? "text-orange-500" : "text-green-500"}`}>
                {selectedTx.type === "WITHDRAWAL" || selectedTx.type === "COPY_TRADE" || selectedTx.type === "BOT_INVESTMENT" ? "-" : "+"} {fmt(selectedTx.amount)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download size={13} /> Print Invoice
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-sm text-gray-400">All your deposits, withdrawals, transfers, and profits</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500">
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-primary-500">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID, notes, reference or method..."
              className="flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>}
          </div>

          <button
            onClick={() => setShowFilters(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-primary-400 transition-colors"
          >
            <SlidersHorizontal size={13} /> Filters <ChevronDown size={11} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-750">
            {/* Type */}
            <div>
              <p className="text-[10px] font-black text-gray-400 mb-1.5 uppercase">Transaction Type</p>
              <div className="flex gap-1.5 flex-wrap">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      typeFilter === t
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[10px] font-black text-gray-400 mb-1.5 uppercase">Status</p>
              <div className="flex gap-1.5 flex-wrap">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      statusFilter === s
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3"><Loader2 size={28} className="animate-spin text-primary-500"/><p className="text-sm text-gray-400">Loading…</p></div>
        ) : filteredTxs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <ArrowDownCircle size={36} className="text-gray-300 mb-4"/>
            <p className="font-extrabold text-gray-900 dark:text-white mb-1">No Transactions Found</p>
            <p className="text-sm text-gray-400 mb-5">Try checking your filter choices or search keywords.</p>
            {(searchQuery || typeFilter !== "All" || statusFilter !== "All") && (
              <button
                onClick={() => { setSearchQuery(""); setTypeFilter("All"); setStatusFilter("All"); }}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 font-bold text-xs rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTxs.map(tx => {
              const isOutflow = tx.type === "WITHDRAWAL" || tx.type === "COPY_TRADE" || tx.type === "BOT_INVESTMENT";
              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isOutflow ? "bg-orange-50 dark:bg-orange-900/20" : "bg-green-50 dark:bg-green-950/20"}`}>
                    {isOutflow ? <ArrowUpCircle size={15} className="text-orange-500"/> : <ArrowDownCircle size={15} className="text-green-500"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{tx.type}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-[350px]">
                      {new Date(tx.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})} · {tx.method} {tx.address ? `(${tx.address})` : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-black ${isOutflow ? "text-orange-500" : "text-green-500"}`}>
                      {isOutflow ? "-" : "+"} {fmt(tx.amount)}
                    </p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${statusStyle(tx.status)}`}>{tx.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs font-bold text-gray-400">
        <Link href="/dashboard/wallet" className="inline-flex items-center gap-1.5 hover:text-primary-500 transition-colors">
          <ArrowLeft size={14}/> Back to Wallet
        </Link>
        <span>Showing {filteredTxs.length} of {txs.length} transactions</span>
      </div>
    </div>
  );
}
