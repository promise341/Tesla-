"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, Shield, DollarSign, Wallet, Copy,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  CreditCard, X, Plus, Minus, Bell, RefreshCw,
  Eye, TrendingUp, Globe, Phone
} from "lucide-react";

interface DepositAddress { currency: string; address: string; createdAt: string; }
interface RecentTx { id: string; type: string; amount: number; status: string; method: string; createdAt: string; }

interface AdminUser {
  id: string;
  email: string;
  name: string;
  username: string;
  phone: string;
  country: string;
  createdAt: string;
  role: string;
  isActive: boolean;
  kycStatus: string;
  totalBalance: number;
  totalProfit: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  withdrawalWallets: string[];
  depositAddresses: DepositAddress[];
  recentTransactions: RecentTx[];
}

type Toast = { id: number; message: string; type: "success" | "error" };

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "kyc_pending" | "admin">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Credit modal
  const [creditModal, setCreditModal] = useState<{ user: AdminUser } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    });
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch { addToast("Failed to load users", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (user: AdminUser) => {
    const newActive = !user.isActive;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isActive: newActive }),
      });
      if (res.ok) {
        addToast(`${user.name} ${newActive ? "activated" : "suspended"}`, "success");
        fetchUsers();
      } else addToast("Failed to update user", "error");
    } catch { addToast("Network error", "error"); }
  };

  const setRole = async (user: AdminUser, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role }),
      });
      if (res.ok) {
        addToast(`${user.name} role set to ${role}`, "success");
        fetchUsers();
      } else addToast("Failed to update role", "error");
    } catch { addToast("Network error", "error"); }
  };

  const handleCredit = async () => {
    if (!creditModal) return;
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount === 0) return addToast("Enter a valid amount", "error");
    setCreditLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: creditModal.user.id, amount, note: creditNote }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Balance ${amount >= 0 ? "credited" : "debited"} — New balance: $${data.newBalance?.toFixed(2)}`, "success");
        setCreditModal(null);
        setCreditAmount("");
        setCreditNote("");
        fetchUsers();
      } else addToast(data.error || "Failed", "error");
    } catch { addToast("Network error", "error"); }
    finally { setCreditLoading(false); }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "active") return u.isActive;
    if (filter === "suspended") return !u.isActive;
    if (filter === "kyc_pending") return u.kycStatus === "pending" || u.kycStatus === "unverified";
    if (filter === "admin") return u.role === "ADMIN";
    return true;
  });

  const kycColor = (s: string) =>
    s === "verified" ? "text-green-400 bg-green-950/40 border-green-800/40" :
    s === "pending" ? "text-yellow-400 bg-yellow-950/40 border-yellow-800/40" :
    s === "rejected" ? "text-red-400 bg-red-950/40 border-red-800/40" :
    "text-gray-400 bg-gray-800/40 border-gray-700/40";

  const roleColor = (r: string) =>
    r === "ADMIN" ? "text-red-400 bg-red-950/40 border-red-800/40" :
    r === "SUSPENDED" ? "text-orange-400 bg-orange-950/40 border-orange-800/40" :
    "text-blue-400 bg-blue-950/40 border-blue-800/40";

  return (
    <div className="space-y-5">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium
            ${t.type === "success" ? "bg-green-950 border-green-700 text-green-300" : "bg-red-950 border-red-700 text-red-300"}`}>
            {t.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-red-500" /> User Management
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} total users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#111] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-800/60"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "active", "suspended", "kyc_pending", "admin"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${filter === f ? "bg-red-900/30 border-red-700/50 text-red-300" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}>
              {f === "kyc_pending" ? "KYC Pending" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-600">No users found</div>
          )}
          {filtered.map((user) => {
            const expanded = expandedId === user.id;
            return (
              <div key={user.id} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden transition-all">
                {/* Main Row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.username && <p className="text-xs text-gray-600">@{user.username}</p>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">Balance</p>
                      <p className="text-white font-bold">${user.totalBalance.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Deposited</p>
                      <p className="text-green-400 font-semibold">${user.totalDeposits.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Withdrawn</p>
                      <p className="text-yellow-400 font-semibold">${user.totalWithdrawals.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${roleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${kycColor(user.kycStatus)}`}>
                      KYC: {user.kycStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCreditModal({ user })}
                      className="p-2 rounded-lg bg-green-950/40 border border-green-800/30 text-green-400 hover:bg-green-900/40 transition-colors" title="Credit/Debit Balance">
                      <DollarSign size={14} />
                    </button>
                    <button onClick={() => toggleStatus(user)}
                      className={`p-2 rounded-lg border transition-colors ${user.isActive ? "bg-orange-950/40 border-orange-800/30 text-orange-400 hover:bg-orange-900/40" : "bg-green-950/40 border-green-800/30 text-green-400 hover:bg-green-900/40"}`}
                      title={user.isActive ? "Suspend User" : "Activate User"}>
                      {user.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button onClick={() => setExpandedId(expanded ? null : user.id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded && (
                  <div className="border-t border-white/8 p-4 space-y-4 bg-black/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      {/* User Info */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye size={11} /> Profile
                        </h3>
                        <div className="space-y-1.5 text-xs">
                          {user.phone && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Phone size={11} className="text-gray-600" /> {user.phone}
                            </div>
                          )}
                          {user.country && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Globe size={11} className="text-gray-600" /> {user.country}
                            </div>
                          )}
                          <div className="text-gray-500">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            Transactions: {user.transactionCount}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            Profit: <span className="text-green-400">${user.totalProfit.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Role Change */}
                        <div className="pt-2">
                          <p className="text-xs text-gray-600 mb-1">Change Role:</p>
                          <div className="flex gap-1.5">
                            {["USER", "ADMIN", "SUSPENDED"].map((r) => (
                              <button key={r} onClick={() => setRole(user, r)}
                                disabled={user.role === r}
                                className={`text-[10px] px-2 py-1 rounded-lg border transition-all font-medium ${
                                  user.role === r ? "opacity-40 cursor-not-allowed" : "hover:opacity-80"
                                } ${roleColor(r)}`}>
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Withdrawal Wallet Addresses */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Wallet size={11} className="text-red-500" /> Withdrawal Wallets
                        </h3>
                        {user.withdrawalWallets.length === 0 ? (
                          <p className="text-xs text-gray-600 italic">No withdrawal address on file</p>
                        ) : (
                          <div className="space-y-1.5">
                            {user.withdrawalWallets.map((addr, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/8">
                                <code className="text-[10px] text-yellow-300 flex-1 truncate">{addr}</code>
                                <button onClick={() => copyToClipboard(addr)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                                  {copiedText === addr ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Connected Deposit Addresses */}
                        {user.depositAddresses.length > 0 && (
                          <>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                              <CreditCard size={11} className="text-blue-500" /> Deposit Addresses
                            </h3>
                            <div className="space-y-1.5">
                              {user.depositAddresses.map((da, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/8">
                                  <span className="text-[10px] font-bold text-blue-400 flex-shrink-0">{da.currency}</span>
                                  <code className="text-[10px] text-gray-300 flex-1 truncate">{da.address}</code>
                                  <button onClick={() => copyToClipboard(da.address)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                                    {copiedText === da.address ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Recent Transactions */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp size={11} /> Recent Transactions
                        </h3>
                        {user.recentTransactions.length === 0 ? (
                          <p className="text-xs text-gray-600 italic">No transactions yet</p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {user.recentTransactions.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/6">
                                <div>
                                  <p className="text-[10px] text-gray-300 font-medium">{tx.type} · {tx.method}</p>
                                  <p className="text-[10px] text-gray-600">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs font-bold ${tx.type === "DEPOSIT" ? "text-green-400" : "text-yellow-400"}`}>
                                    {tx.type === "DEPOSIT" ? "+" : "-"}${tx.amount.toFixed(2)}
                                  </p>
                                  <p className={`text-[10px] ${tx.status === "COMPLETED" || tx.status === "APPROVED" ? "text-green-500" : tx.status === "PENDING" ? "text-yellow-500" : "text-red-500"}`}>
                                    {tx.status}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Credit / Debit Modal */}
      {creditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-red-900/40 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-red-900 via-red-600 to-red-900 rounded-t-2xl" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign size={18} className="text-green-400" /> Credit / Debit Balance
                </h2>
                <button onClick={() => setCreditModal(null)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <p className="text-sm font-medium text-white">{creditModal.user.name}</p>
                <p className="text-xs text-gray-500">{creditModal.user.email}</p>
                <p className="text-xs text-gray-400 mt-1">Current balance: <span className="text-white font-bold">${creditModal.user.totalBalance.toFixed(2)}</span></p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Amount (use negative to debit)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="e.g. 500 or -100"
                      className="w-full pl-7 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-800/60"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[100, 500, 1000, -100, -500].map((v) => (
                      <button key={v} onClick={() => setCreditAmount(String(v))}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${v > 0 ? "border-green-800/40 text-green-400 bg-green-950/30 hover:bg-green-900/40" : "border-red-800/40 text-red-400 bg-red-950/30 hover:bg-red-900/40"}`}>
                        {v > 0 ? `+$${v}` : `-$${Math.abs(v)}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Note (optional)</label>
                  <input
                    type="text"
                    value={creditNote}
                    onChange={(e) => setCreditNote(e.target.value)}
                    placeholder="Reason for adjustment"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-800/60"
                  />
                </div>

                {creditAmount && !isNaN(parseFloat(creditAmount)) && (
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/8 text-xs text-gray-400">
                    New balance will be: <span className="text-white font-bold">${Math.max(0, creditModal.user.totalBalance + parseFloat(creditAmount)).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setCreditModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
                  <button onClick={handleCredit} disabled={creditLoading || !creditAmount}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {creditLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : parseFloat(creditAmount || "0") >= 0 ? <Plus size={14} /> : <Minus size={14} />}
                    {creditLoading ? "Processing…" : "Apply"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}