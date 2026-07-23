"use client";

import { useEffect, useState } from "react";
import { Activity, Search, TrendingUp, TrendingDown, CheckCircle2, XCircle, Trash2, Clock, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from "lucide-react";

interface AdminTrade {
  id: string;
  userId: string;
  pair: string;
  name: string;
  category: string;
  side: "BUY" | "SELL";
  leverage: number;
  entryPrice: number;
  amount: number;
  status: "OPEN" | "CLOSED";
  closePrice?: number;
  pnl?: number;
  pnlPct?: number;
  openedAt: string;
  closedAt?: string;
  user: {
    name: string;
    email: string;
    username: string;
    balance: number;
  };
}

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<AdminTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  async function fetchTrades() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trades");
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseOutcome(tradeId: string, outcome: "WIN" | "LOSS") {
    setProcessingId(tradeId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId, outcome }),
      });

      const data = await res.json();
      setProcessingId(null);

      if (res.ok) {
        setFeedback({ type: "success", text: data.message || `Trade marked as ${outcome}` });
        fetchTrades();
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to update trade" });
      }
    } catch (err) {
      setProcessingId(null);
      setFeedback({ type: "error", text: "Network error occurred." });
    }
  }

  async function handleDeleteTrade(tradeId: string) {
    if (!confirm("Are you sure you want to delete this trade record?")) return;

    setProcessingId(tradeId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/trades?tradeId=${tradeId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      setProcessingId(null);

      if (res.ok) {
        setFeedback({ type: "success", text: "Trade deleted successfully." });
        setTrades((prev) => prev.filter((t) => t.id !== tradeId));
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to delete trade." });
      }
    } catch (err) {
      setProcessingId(null);
      setFeedback({ type: "error", text: "Network error." });
    }
  }

  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.pair.toLowerCase().includes(search.toLowerCase()) ||
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.user.email.toLowerCase().includes(search.toLowerCase()) ||
      t.user.username.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openCount = trades.filter((t) => t.status === "OPEN").length;
  const closedCount = trades.filter((t) => t.status === "CLOSED").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Activity className="text-red-500" size={28} /> Live User Trades Control
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor and manage active trading positions across all users. Force close trades as Win or Loss.
          </p>
        </div>
        <button
          onClick={fetchTrades}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 font-bold text-xs rounded-xl transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Trades
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-semibold ${
          feedback.type === "success"
            ? "bg-green-950/60 border-green-800/50 text-green-300"
            : "bg-red-950/60 border-red-800/50 text-red-300"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Total Positions</div>
          <div className="text-2xl font-black text-white mt-1">{trades.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} /> Open Live Trades
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{openCount}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="text-xs font-extrabold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Closed Trades
          </div>
          <div className="text-2xl font-black text-green-400 mt-1">{closedCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email or asset pair..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(["ALL", "OPEN", "CLOSED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                statusFilter === st
                  ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-950"
                  : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {st} Positions
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-bold">Loading live trades...</div>
        ) : filteredTrades.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-bold">No trading positions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-4">Asset / Pair</th>
                  <th className="py-4 px-4">Side</th>
                  <th className="py-4 px-4">Margin Amount</th>
                  <th className="py-4 px-4">Entry Price</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">PnL Result</th>
                  <th className="py-4 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-semibold text-gray-200">
                {filteredTrades.map((trade) => {
                  const isOpen = trade.status === "OPEN";
                  const isBuy = trade.side === "BUY";
                  const pnlPositive = trade.pnl && trade.pnl >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-white">{trade.user.name}</div>
                        <div className="text-[11px] text-gray-400">@{trade.user.username} • {trade.user.email}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-extrabold text-white text-sm">{trade.pair}</div>
                        <div className="text-[11px] text-gray-400">{trade.category} • {trade.leverage}x Leverage</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${
                          isBuy ? "bg-green-950/80 text-green-400 border border-green-800/50" : "bg-red-950/80 text-red-400 border border-red-800/50"
                        }`}>
                          {isBuy ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {trade.side}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-white">
                        ${trade.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 font-mono text-gray-300">
                        ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                          isOpen ? "bg-amber-950/80 text-amber-400 border border-amber-800/50 animate-pulse" : "bg-gray-800 text-gray-400"
                        }`}>
                          {trade.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono">
                        {trade.pnl !== undefined && trade.pnl !== null ? (
                          <span className={`font-black ${pnlPositive ? "text-green-400" : "text-red-400"}`}>
                            {pnlPositive ? "+" : ""}${trade.pnl.toFixed(2)} ({trade.pnlPct}%)
                          </span>
                        ) : (
                          <span className="text-gray-500 font-bold">Live...</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOpen && (
                            <>
                              <button
                                disabled={processingId === trade.id}
                                onClick={() => handleCloseOutcome(trade.id, "WIN")}
                                className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-extrabold text-[11px] shadow-sm transition-all"
                              >
                                Force Win
                              </button>
                              <button
                                disabled={processingId === trade.id}
                                onClick={() => handleCloseOutcome(trade.id, "LOSS")}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] shadow-sm transition-all"
                              >
                                Force Loss
                              </button>
                            </>
                          )}
                          <button
                            disabled={processingId === trade.id}
                            onClick={() => handleDeleteTrade(trade.id)}
                            className="p-1.5 rounded-lg bg-gray-950 hover:bg-red-950/80 border border-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Trade Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
