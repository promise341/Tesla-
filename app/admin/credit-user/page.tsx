"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DollarSign, Search, Plus, Minus, UserCheck,
  TrendingUp, HelpCircle, History, Clock, FileText,
  User, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  username: string;
  totalBalance: number;
  kycStatus: string;
  role: string;
  isActive: boolean;
}

interface AdjustmentTx {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
  user: {
    name: string;
    email: string;
  };
  metadata: {
    walletAddress?: string; // stores the manual note/reason
  };
}

type Toast = { id: number; message: string; type: "success" | "error" };

export default function CreditDebitUserPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [mode, setMode] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // History of adjustments
  const [adjustments, setAdjustments] = useState<AdjustmentTx[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      addToast("Failed to load users", "error");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/transactions");
      if (res.ok) {
        const data = await res.json();
        // Filter transactions having method "ADMIN_MANUAL"
        const filtered = (data || []).filter(
          (t: any) => t.metadata?.cryptoType === "ADMIN_MANUAL"
        );
        setAdjustments(filtered);
      }
    } catch {
      addToast("Failed to load adjustment logs", "error");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, [fetchUsers, fetchHistory]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      addToast("Please select a user first", "error");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      addToast("Please enter a valid amount greater than 0", "error");
      return;
    }

    setLoading(true);
    // Positive for credit, negative for debit
    const finalAmount = mode === "credit" ? numAmount : -numAmount;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: finalAmount,
          note: note.trim() || `Admin manual ${mode}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(
          `Successfully ${mode === "credit" ? "credited" : "debited"} $${numAmount.toFixed(2)} to ${selectedUser.name}`,
          "success"
        );
        setAmount("");
        setNote("");
        setSelectedUser(null);
        // Refresh
        fetchUsers();
        fetchHistory();
      } else {
        addToast(data.error || "Failed to adjust balance", "error");
      }
    } catch {
      addToast("Network connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = searchQuery.trim() === "" 
    ? [] 
    : users.filter((u) => {
        const query = searchQuery.toLowerCase();
        return (
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.username?.toLowerCase().includes(query)
        );
      });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium transition-all duration-300 animate-slide-in
              ${t.type === "success" 
                ? "bg-green-950/90 border-green-800/80 text-green-300 shadow-green-900/10" 
                : "bg-red-950/90 border-red-800/80 text-red-300 shadow-red-900/10"
              }`}
          >
            {t.type === "success" ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="p-2 rounded-lg bg-red-900/30 border border-red-800/40 text-red-500">
            <DollarSign size={20} />
          </span>
          Credit / Debit User Balance
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Adjust user account balance manually. Changes take effect instantly and generate system transactions and notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: User Select and Adjustment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Frame */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 relative overflow-hidden"
               style={{ boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-900/40 via-red-600/20 to-red-900/40" />

            <form onSubmit={handleApply} className="space-y-6">
              {/* Step 1: Select User */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Step 1: Search &amp; Select User
                </label>
                
                {selectedUser ? (
                  /* Selected User Info Panel */
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-red-900/30 relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center text-white font-black text-sm">
                        {selectedUser.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedUser.name}</h4>
                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                        <p className="text-xs text-red-400 font-semibold mt-0.5">
                          Current Balance: ${selectedUser.totalBalance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchQuery("");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-all hover:bg-red-950/20 hover:border-red-900/30 hover:text-red-400"
                    >
                      Change User
                    </button>
                  </div>
                ) : (
                  /* User Search Input & Dropdown */
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by full name, email address, or @username..."
                        className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-800/60 transition-all font-medium placeholder-gray-600"
                      />
                    </div>

                    {/* Autocomplete Dropdown */}
                    {searchQuery.trim() !== "" && (
                      <div className="absolute left-0 w-full mt-2 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-white/5">
                        {usersLoading ? (
                          <div className="p-4 text-center text-xs text-gray-500">Loading users...</div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">No users found matching search query</div>
                        ) : (
                          filteredUsers.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setSearchQuery("");
                              }}
                              className="w-full text-left p-3.5 hover:bg-red-950/15 flex items-center justify-between transition-colors group"
                            >
                              <div className="min-w-0 pr-4">
                                <p className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                                  {u.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-gray-400 font-medium">Balance</p>
                                <p className="text-sm font-bold text-red-500 mt-0.5">${u.totalBalance.toFixed(2)}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Choose Operation (Credit / Debit) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Step 2: Choose Operation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("credit")}
                    className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all
                      ${mode === "credit"
                        ? "bg-green-950/30 border-green-700/60 text-green-400 shadow-lg shadow-green-900/10"
                        : "bg-black/20 border-white/5 text-gray-400 hover:text-white"
                      }`}
                  >
                    <Plus size={16} /> Credit User Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("debit")}
                    className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all
                      ${mode === "debit"
                        ? "bg-red-950/30 border-red-700/60 text-red-400 shadow-lg shadow-red-900/10"
                        : "bg-black/20 border-white/5 text-gray-400 hover:text-white"
                      }`}
                  >
                    <Minus size={16} /> Debit User Balance
                  </button>
                </div>
              </div>

              {/* Step 3: Enter Amount */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Step 3: Enter Adjustment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-base focus:outline-none focus:border-red-800/60 font-bold placeholder-gray-700"
                  />
                </div>

                {/* Preset Fast Selection Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[50, 100, 250, 500, 1000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/10 text-xs font-semibold transition-all"
                    >
                      ${val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Description / Reason */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Step 4: Adjustment Description / Reason
                </label>
                <input
                  type="text"
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Platform signup bonus, compensates failed investment, correction..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-800/60 transition-all placeholder-gray-600 font-medium"
                />
              </div>

              {/* Real-time Preview */}
              {selectedUser && amount && !isNaN(parseFloat(amount)) && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Previous Balance:</span>
                    <span>${selectedUser.totalBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Adjustment:</span>
                    <span className={mode === "credit" ? "text-green-400" : "text-red-400"}>
                      {mode === "credit" ? "+" : "-"}${parseFloat(amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  <div className="flex justify-between font-bold text-white">
                    <span>New Balance:</span>
                    <span className="text-red-500">
                      ${Math.max(0, selectedUser.totalBalance + (mode === "credit" ? parseFloat(amount) : -parseFloat(amount))).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedUser || !amount}
                className="w-full py-4 rounded-xl text-white text-sm font-bold transition-all bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 border border-red-700/30 hover:border-red-600/40 shadow-lg shadow-red-950/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === "credit" ? (
                  <>
                    <Plus size={16} /> Credit Balance
                  </>
                ) : (
                  <>
                    <Minus size={16} /> Debit Balance
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Summary details */}
        <div className="space-y-6">
          {/* Quick Info Board */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <User size={13} className="text-red-500" /> Selected User details
            </h3>
            
            {selectedUser ? (
              <div className="space-y-3.5 text-xs text-gray-400">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span>Name:</span>
                  <strong className="text-white">{selectedUser.name}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span>Email:</span>
                  <strong className="text-white truncate max-w-[150px]">{selectedUser.email}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span>Role:</span>
                  <span className="text-red-400 font-bold">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span>KYC Status:</span>
                  <span className={`font-semibold ${selectedUser.kycStatus === "verified" ? "text-green-400" : "text-yellow-500"}`}>
                    {selectedUser.kycStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Account Status:</span>
                  <span className={selectedUser.isActive ? "text-green-400" : "text-red-500"}>
                    {selectedUser.isActive ? "ACTIVE" : "SUSPENDED"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-600 italic">
                Select a user to inspect profile details here.
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={13} className="text-red-500" /> Operational Rules
            </h3>
            <ul className="text-xs text-gray-500 space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>Manual credits show up immediately as completed transactions.</li>
              <li>A custom push notification is sent to notify the user.</li>
              <li>Debit amounts cannot result in negative user balances (system auto-safeguard floors it to $0.00).</li>
              <li>All balance adjustments are logged and tracked in the Admin Audit logs.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Adjustments Log */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <History size={16} className="text-red-500" /> Recent Balance Adjustments Logs
        </h2>

        {historyLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : adjustments.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-600 italic">
            No manual adjustments recorded in transaction history yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-black/35 text-gray-400 border-b border-white/5">
                  <th className="p-3.5 font-bold uppercase tracking-wider">Date &amp; Time</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">User</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Adjustment</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Note / Description</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adjustments.map((tx) => {
                  const isCredit = tx.type === "DEPOSIT";
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(tx.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-white">{tx.user.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{tx.user.email}</p>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-black text-sm px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit
                          ${isCredit 
                            ? "text-green-400 bg-green-950/20 border border-green-900/30" 
                            : "text-red-400 bg-red-950/20 border border-red-900/30"
                          }`}
                        >
                          {isCredit ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
                          {isCredit ? "+" : "-"}${tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-300 font-medium max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-800/40 text-green-400 bg-green-950/40">
                          {tx.status}
                        </span>
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
