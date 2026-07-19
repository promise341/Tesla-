"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Car, Clock, CheckCircle2, XCircle, Loader2, ArrowLeft,
  Package, Search, RefreshCw, Download, FileText, Ban,
  ChevronRight, MapPin, Phone, Building2, User, HelpCircle,
  AlertTriangle, CreditCard, ExternalLink, Calendar,
  ShieldCheck, Truck, CheckCircle, Info, ChevronDown
} from "lucide-react";

interface Order {
  id: string;
  carId: string;
  carName: string;
  price: number;
  paymentMethod: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  proofUrl: string;
  walletAddress: string;
  createdAt: string;
}

type TabType = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export default function MyCarOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  
  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelOrderConfirm, setCancelOrderConfirm] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/orders/my-orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Cancel order execution
  async function handleCancelOrder(orderId: string) {
    setCancelling(true);
    setCancelError("");
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel order");
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
      setCancelOrderConfirm(null);
      // If modal is open, update its state
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: "CANCELLED" } : null);
      }
    } catch (err: any) {
      setCancelError(err.message || "Something went wrong.");
    } finally {
      setCancelling(false);
    }
  }

  // Export orders to CSV
  function handleExportCSV() {
    const headers = ["Order ID", "Car Name", "Price ($)", "Payment Mode", "Status", "Delivery Street", "City", "Country", "Date Ordered"];
    const rows = orders.map(o => [
      o.id.toUpperCase(),
      o.carName,
      o.price.toFixed(2),
      o.paymentMethod,
      o.status,
      o.street,
      o.city,
      o.country,
      new Date(o.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tesla-capx-car-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }

  // Print single invoice
  function handlePrintInvoice(order: Order) {
    const printContent = `
      <html>
        <head>
          <title>Invoice - Order #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; color: #ef4444; }
            .invoice-details { margin-bottom: 30px; line-height: 1.6; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total { font-size: 20px; font-weight: bold; text-align: right; }
            .footer { border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #777; text-align: center; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TESLA CAPX INVOICE</div>
            <p>Order Date: ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div class="invoice-details">
            <p><strong>Order ID:</strong> ${order.id.toUpperCase()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <div class="grid">
            <div class="card">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> ${order.fullName}</p>
              <p><strong>Email:</strong> ${order.email}</p>
              <p><strong>Phone:</strong> ${order.phone || "N/A"}</p>
            </div>
            <div class="card">
              <h3>Delivery Address</h3>
              <p>${order.street}</p>
              <p>${order.city}, ${order.state || ""} ${order.postalCode || ""}</p>
              <p>${order.country}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Payment Mode</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.carName} (Tesla Curated Vehicle Order)</td>
                <td>${order.paymentMethod === "BALANCE" ? "Account Balance (Instant)" : `Crypto (${order.paymentMethod})`}</td>
                <td style="text-align: right;">$${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total Paid: $${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div class="footer">
            Thank you for purchasing with Teslaxipo. For support, contact orders@teslaxipo.com.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  }

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = 
        o.carName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTab = activeTab === "ALL" || o.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [orders, searchQuery, activeTab]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "PENDING").length,
      approved: orders.filter(o => o.status === "APPROVED").length,
      rejected: orders.filter(o => o.status === "REJECTED").length,
      cancelled: orders.filter(o => o.status === "CANCELLED").length,
    };
  }, [orders]);

  const tabs: { id: TabType; label: string; count: number; color: string }[] = [
    { id: "ALL", label: "All Orders", count: stats.total, color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" },
    { id: "PENDING", label: "Pending Review", count: stats.pending, color: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600" },
    { id: "APPROVED", label: "Approved / Shipped", count: stats.approved, color: "bg-green-50 dark:bg-green-950/20 text-green-600" },
    { id: "REJECTED", label: "Rejected", count: stats.rejected, color: "bg-red-50 dark:bg-red-950/20 text-red-600" },
    { id: "CANCELLED", label: "Cancelled", count: stats.cancelled, color: "bg-orange-50 dark:bg-orange-950/20 text-orange-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Invoice Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35">
              <div className="flex items-center gap-3">
                <Car className="text-primary-500" size={24} />
                <div>
                  <h2 className="font-extrabold text-gray-900 dark:text-white text-base">Order Details</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Invoice ID: #{selectedOrder.id.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Order Status & Progress bar for Approved orders */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-150 dark:border-gray-750">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Status</p>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">{selectedOrder.status}</h4>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.status === "PENDING" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                    selectedOrder.status === "APPROVED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    selectedOrder.status === "REJECTED" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                  }`}>
                    {selectedOrder.status === "PENDING" && <Clock size={12} />}
                    {selectedOrder.status === "APPROVED" && <CheckCircle2 size={12} />}
                    {selectedOrder.status === "REJECTED" && <XCircle size={12} />}
                    {selectedOrder.status === "CANCELLED" && <Ban size={12} />}
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Progress bar timeline for Approved */}
                {selectedOrder.status === "APPROVED" && (
                  <div className="space-y-4 pt-2">
                    <div className="relative">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0" />
                      <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-primary-500 -translate-y-1/2 z-0" />
                      <div className="flex justify-between relative z-10">
                        <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-primary-500/20"><CheckCircle size={14} /></div>
                        <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-primary-500/20"><ShieldCheck size={14} /></div>
                        <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-primary-500/20"><Truck size={14} /></div>
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 flex items-center justify-center text-xs font-bold"><Clock size={12} /></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>Order Placed</span>
                      <span>Approved</span>
                      <span>In Transit</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid: Delivery Info vs Financial summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Delivery Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-gray-700">
                    <MapPin size={13} className="text-primary-500" /> Delivery Address
                  </h3>
                  <div className="space-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <p className="flex items-center gap-2"><User size={13} className="text-gray-400" /> {selectedOrder.fullName}</p>
                    <p className="flex items-center gap-2"><Phone size={13} className="text-gray-400" /> {selectedOrder.phone || "N/A"}</p>
                    {selectedOrder.company && <p className="flex items-center gap-2"><Building2 size={13} className="text-gray-400" /> {selectedOrder.company}</p>}
                    <div className="pt-1.5 border-t dark:border-gray-700/60 mt-1.5 space-y-1">
                      <p>{selectedOrder.street}</p>
                      <p>{selectedOrder.city}, {selectedOrder.state || ""} {selectedOrder.postalCode || ""}</p>
                      <p className="font-extrabold text-gray-900 dark:text-white">{selectedOrder.country}</p>
                    </div>
                  </div>
                </div>

                {/* Financial invoice details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-gray-700">
                    <CreditCard size={13} className="text-primary-500" /> Purchase Statement
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Curated Item</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedOrder.carName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Mode</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {selectedOrder.paymentMethod === "BALANCE" ? "Account Balance (Instant)" : `Crypto (${selectedOrder.paymentMethod})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Date</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {new Date(selectedOrder.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <div className="pt-2 border-t dark:border-gray-700 flex justify-between text-sm font-black">
                      <span className="text-gray-900 dark:text-white font-extrabold">Paid Amount</span>
                      <span className="text-primary-500">${selectedOrder.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* View uploaded proof if applicable */}
              {selectedOrder.paymentMethod !== "BALANCE" && selectedOrder.proofUrl && (
                <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={13} className="text-primary-500" /> Uploaded Payment Proof
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-150 dark:border-gray-750/70">
                    <img src={selectedOrder.proofUrl} alt="Receipt proof preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" />
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Payment Proof Receipt Screenshot</p>
                      <p className="text-[10px] text-gray-400 font-mono break-all">{selectedOrder.walletAddress}</p>
                    </div>
                    <a href={selectedOrder.proofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-bold self-end sm:self-auto pb-1 sm:pb-0">
                      View Original <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

            </div>

            {/* Footer actions */}
            <div className="flex gap-3 justify-end p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35">
              {selectedOrder.status === "APPROVED" && (
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors"
                >
                  <FileText size={14} /> Download PDF Invoice
                </button>
              )}
              {selectedOrder.status === "PENDING" && (
                <button
                  onClick={() => { setCancelOrderConfirm(selectedOrder); setSelectedOrder(null); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-900/30 text-orange-600 font-bold text-xs rounded-xl transition-colors"
                >
                  <Ban size={14} /> Cancel Order
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelOrderConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelOrderConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-orange-100 dark:border-orange-950/40 w-full max-w-md p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mx-auto mb-4 border border-orange-100 dark:border-orange-900/30">
              <AlertTriangle size={32} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Cancel Car Order?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Are you sure you want to cancel your order for a <span className="font-extrabold text-gray-900 dark:text-white">{cancelOrderConfirm.carName}</span>?
              {cancelOrderConfirm.paymentMethod === "BALANCE" && " This will instantly refund the total purchase amount back into your account balance."}
            </p>

            {cancelError && (
              <p className="text-xs text-red-500 font-semibold mb-4">{cancelError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCancelOrderConfirm(null)}
                disabled={cancelling}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleCancelOrder(cancelOrderConfirm.id)}
                disabled={cancelling}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
              >
                {cancelling ? <><Loader2 size={13} className="animate-spin" /> Processing...</> : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-950 dark:text-white">My Car Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your vehicle orders, shipping invoice and delivery status</p>
        </div>
        
        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Statistics dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, bg: "bg-blue-50 dark:bg-blue-900/10", color: "text-blue-500" },
          { label: "Pending Verification", value: stats.pending, icon: Clock, bg: "bg-yellow-50 dark:bg-yellow-950/10", color: "text-yellow-500" },
          { label: "Approved / Processing", value: stats.approved, icon: CheckCircle2, bg: "bg-green-50 dark:bg-green-900/10", color: "text-green-500" },
          { label: "Rejected Requests", value: stats.rejected, icon: XCircle, bg: "bg-red-50 dark:bg-red-900/10", color: "text-red-500" },
          { label: "Cancelled Orders", value: stats.cancelled, icon: Ban, bg: "bg-orange-50 dark:bg-orange-900/10", color: "text-orange-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}><s.icon size={18} className={s.color} /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-black text-gray-900 dark:text-white leading-tight mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs & Search log bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">Purchase History</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">{filteredOrders.length} records matching</p>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Car or Order ID..."
                className="pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-750 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-primary-400 w-48 sm:w-64 transition-colors"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === t.id
                    ? "bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/20"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
                }`}
              >
                {t.label}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-primary-500" />
            <p className="text-xs text-gray-400">Retrieving order database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-14 h-14 rounded-full bg-gray-150 dark:bg-gray-750 flex items-center justify-center mx-auto mb-4">
              <Car size={26} className="text-gray-400" />
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">No Orders Found</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              {orders.length === 0 ? "You haven't placed any car orders yet." : "No orders match your search criteria."}
            </p>
            <Link
              href="/dashboard/inventory"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-500/20"
            >
              Browse Inventory
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Headers for desktop */}
            <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
              <span className="w-10" />
              <span>Order Details</span>
              <span className="text-right">Price</span>
              <span className="text-center">Status</span>
              <span className="w-24 text-right">Action</span>
            </div>

            {/* List */}
            {filteredOrders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-750/30 transition-colors cursor-pointer group"
              >
                {/* Visual Icon */}
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Car size={18} className="text-primary-500" />
                </div>

                {/* Title & metadata */}
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate flex items-center gap-2">
                    {order.carName}
                    <span className="text-[10px] text-gray-400 font-mono font-normal bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-150 dark:border-gray-650">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1 flex-wrap">
                    <Calendar size={10} />
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    &nbsp;·&nbsp;
                    <span className="font-semibold text-gray-500 uppercase">{order.paymentMethod}</span>
                  </p>
                </div>

                {/* Price */}
                <div className="md:text-right flex md:flex-col justify-between items-center md:items-end gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden">Price</span>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    ${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex md:justify-center items-center justify-between gap-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                    order.status === "PENDING" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                    order.status === "APPROVED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    order.status === "REJECTED" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                    "bg-orange-100 dark:bg-orange-900/30 text-orange-750 dark:text-orange-400"
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Action dropdown or quick detail trigger */}
                <div className="flex md:justify-end justify-between items-center gap-2" onClick={e => e.stopPropagation()}>
                  <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden">Action</span>
                  <div className="flex gap-1.5">
                    {order.status === "APPROVED" && (
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        title="Print invoice receipt"
                        className="p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => setCancelOrderConfirm(order)}
                        title="Cancel Order request"
                        className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Ban size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] text-gray-600 dark:text-gray-300 font-bold rounded-lg border border-gray-200 dark:border-gray-650 transition-colors flex items-center gap-1"
                    >
                      Details <ChevronRight size={10} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Free Shipping Promo */}
      <div className="bg-primary-500 text-white rounded-3xl p-6 shadow-lg shadow-primary-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Truck size={22} className="text-white" /></div>
          <div>
            <h4 className="font-extrabold text-base">Tesla Priority Worldwide Shipping Included</h4>
            <p className="text-xs text-white/80 mt-0.5">Your vehicle is securely transported and tracked directly to your home delivery address.</p>
          </div>
        </div>
        <Link href="/dashboard/inventory" className="px-5 py-2.5 bg-white text-primary-500 hover:bg-gray-50 text-xs font-black rounded-xl transition-colors shadow">
          Explore Inventory
        </Link>
      </div>

    </div>
  );
}
