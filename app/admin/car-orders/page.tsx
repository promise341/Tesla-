"use client";

import { useState, useEffect } from "react";
import { Car, Clock, CheckCircle2, XCircle, Eye, Loader2, AlertCircle, User, MapPin, Wallet, Image as ImageIcon } from "lucide-react";

interface CarOrder {
  id: string;
  userId: string;
  carId: string;
  carName: string;
  price: number;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  walletAddress: string;
  proofUrl: string;
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminCarOrdersPage() {
  const [orders, setOrders] = useState<CarOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selectedOrder, setSelectedOrder] = useState<CarOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/car-orders?status=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(orderId: string) {
    if (!confirm("Approve this car order? User will receive an instant invoice notification.")) return;
    
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/car-orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "APPROVE" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");
      
      alert("Order approved! User notified with invoice.");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(orderId: string) {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/car-orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "REJECT", reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject");
      
      alert("Order rejected. User notified.");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const stats = {
    pending: orders.filter(o => o.status === "PENDING").length,
    approved: orders.filter(o => o.status === "APPROVED").length,
    rejected: orders.filter(o => o.status === "REJECTED").length,
    totalValue: orders.filter(o => o.status === "APPROVED").reduce((sum, o) => sum + o.price, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Car Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and approve customer car orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Orders", value: stats.pending, icon: Clock, color: "yellow" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "green" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "red" },
          { label: "Total Revenue", value: `$${stats.totalValue.toLocaleString()}`, icon: Car, color: "blue" },
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

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Car size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Car</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-gray-900 dark:text-white">{order.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.carName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">${order.price.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{order.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        order.status === "PENDING" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                        order.status === "APPROVED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Order Details</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
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
                    { label: "Full Name", value: selectedOrder.fullName },
                    { label: "Email", value: selectedOrder.email },
                    { label: "Phone", value: selectedOrder.phone || "N/A" },
                    { label: "Company", value: selectedOrder.company || "N/A" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-primary-500" />
                  <h3 className="font-extrabold text-gray-900 dark:text-white">Billing Address</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.street}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedOrder.city}{selectedOrder.state ? `, ${selectedOrder.state}` : ""} {selectedOrder.postalCode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.country}</p>
                </div>
              </div>

              {/* Car & Payment Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Car size={16} className="text-primary-500" />
                    <h3 className="font-extrabold text-gray-900 dark:text-white">Car Details</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Vehicle</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.carName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Price</p>
                      <p className="text-lg font-black text-primary-500">${selectedOrder.price.toLocaleString()}</p>
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
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Customer Wallet</p>
                      <p className="text-xs font-mono text-gray-900 dark:text-white break-all bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {selectedOrder.walletAddress}
                      </p>
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
                    src={selectedOrder.proofUrl}
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
              {selectedOrder.status === "PENDING" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Approve Order
                  </button>
                  <button
                    onClick={() => handleReject(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    Reject Order
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
