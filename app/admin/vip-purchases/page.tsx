"use client";

import { useState, useEffect } from "react";
import { Crown, Clock, CheckCircle2, XCircle, Eye, Loader2, AlertCircle, User, Wallet, Image as ImageIcon } from "lucide-react";

interface VIPPurchase {
  id: string;
  userId: string;
  cardName: string;
  price: number;
  duration: string;
  paymentMethod: string;
  proofUrl: string;
  status: string;
  payStatus: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminVIPPurchasesPage() {
  const [purchases, setPurchases] = useState<VIPPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selectedPurchase, setSelectedPurchase] = useState<VIPPurchase | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPurchases();
  }, [filter]);

  async function fetchPurchases() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vip-purchases?status=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch purchases");
      const data = await res.json();
      setPurchases(data.purchases || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(purchaseId: string) {
    if (!confirm("Approve this VIP card purchase? User will be notified instantly.")) return;
    
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vip-purchases/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, action: "APPROVE" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");
      
      alert("VIP purchase approved! User notified.");
      setSelectedPurchase(null);
      fetchPurchases();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(purchaseId: string) {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vip-purchases/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, action: "REJECT", reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject");
      
      alert("Purchase rejected. User notified.");
      setSelectedPurchase(null);
      fetchPurchases();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const stats = {
    pending: purchases.filter(p => p.status === "PENDING").length,
    approved: purchases.filter(p => p.status === "APPROVED").length,
    rejected: purchases.filter(p => p.status === "REJECTED").length,
    totalValue: purchases.filter(p => p.status === "APPROVED").reduce((sum, p) => sum + p.price, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">VIP Card Purchases</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and approve VIP membership purchases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "yellow" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "green" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "red" },
          { label: "Total Revenue", value: `$${stats.totalValue.toLocaleString()}`, icon: Crown, color: "blue" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <stat.icon size={16} className={`text-${stat.color}-500`} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === status
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Purchases Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <Crown size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No purchases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Card</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-gray-900 dark:text-white">{purchase.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{purchase.user?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{purchase.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{purchase.cardName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{purchase.duration}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">${purchase.price.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{purchase.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        purchase.status === "PENDING" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                        purchase.status === "APPROVED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedPurchase(purchase)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Purchase Details</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: {selectedPurchase.id}</p>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={16} className="text-primary-500" />
                  <h3 className="font-extrabold text-gray-900 dark:text-white">Customer Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  {[
                    { label: "Name", value: selectedPurchase.user?.name || "Unknown" },
                    { label: "Email", value: selectedPurchase.user?.email || "Unknown" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Crown size={16} className="text-primary-500" />
                    <h3 className="font-extrabold text-gray-900 dark:text-white">Card Details</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Card Name</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPurchase.cardName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPurchase.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Price</p>
                      <p className="text-lg font-black text-primary-500">${selectedPurchase.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet size={16} className="text-primary-500" />
                    <h3 className="font-extrabold text-gray-900 dark:text-white">Payment Details</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPurchase.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={16} className="text-primary-500" />
                  <h3 className="font-extrabold text-gray-900 dark:text-white">Payment Proof</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <img
                    src={selectedPurchase.proofUrl}
                    alt="Payment proof"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              {selectedPurchase.status === "PENDING" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedPurchase.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Approve Purchase
                  </button>
                  <button
                    onClick={() => handleReject(selectedPurchase.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    Reject Purchase
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
