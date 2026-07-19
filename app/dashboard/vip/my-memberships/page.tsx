"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2, Clock, XCircle, RefreshCw, Loader2,
  AlertCircle, PlusCircle, CreditCard, Calendar,
  Shield, Star, Gem, Crown, Rocket, X, Zap, Ban,
  Search, Download, FileText, ExternalLink, Info, Check, ShieldCheck
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Membership {
  id: string;
  cardName: string;
  price: number;
  duration: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  payStatus: "PAYMENT_PENDING" | "APPROVED" | "PAID";
  paymentMethod: string;
  proofUrl: string;
  createdAt: string;
  expiresAt: string | null;
}

type TabType = "ALL" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmt(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function statusStyle(status: string) {
  if (status === "ACTIVE")     return { bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-600 dark:text-green-400",   icon: <CheckCircle2 size={11} />, label: "Active" };
  if (status === "EXPIRED")    return { bg: "bg-gray-100 dark:bg-gray-700",        text: "text-gray-500 dark:text-gray-400",     icon: <Clock size={11} />,       label: "Expired" };
  if (status === "CANCELLED")  return { bg: "bg-red-150 dark:bg-red-950/20",       text: "text-red-500",                         icon: <XCircle size={11} />,     label: "Cancelled" };
  return                        { bg: "bg-yellow-100 dark:bg-yellow-900/30",        text: "text-yellow-600 dark:text-yellow-400", icon: <Clock size={11} />,       label: "Pending" };
}

function payStyle(payStatus: string) {
  if (payStatus === "PAID" || payStatus === "APPROVED") return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", label: "Paid" };
  return                     { bg: "bg-orange-100 dark:bg-orange-900/30",     text: "text-orange-600 dark:text-orange-400", label: "Payment Pending" };
}

function cardGradient(cardName: string) {
  const n = cardName.toLowerCase();
  if (n.includes("silver"))   return "bg-gradient-to-br from-gray-300 to-gray-500";
  if (n.includes("gold"))     return "bg-gradient-to-br from-yellow-300 to-yellow-600";
  if (n.includes("platinum")) return "bg-gradient-to-br from-slate-300 to-slate-600";
  if (n.includes("diamond"))  return "bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500";
  if (n.includes("black"))    return "bg-gradient-to-br from-gray-800 to-gray-950";
  if (n.includes("elite"))    return "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500";
  return "bg-gradient-to-br from-primary-400 to-primary-700";
}

function cardLabel(cardName: string) {
  const n = cardName.toLowerCase();
  if (n.includes("silver"))   return { text: "SILVER",       color: "text-gray-700" };
  if (n.includes("gold"))     return { text: "GOLD",         color: "text-yellow-800" };
  if (n.includes("platinum")) return { text: "Platinum",     color: "text-slate-700" };
  if (n.includes("diamond"))  return { text: "DIAMOND",      color: "text-white" };
  if (n.includes("black"))    return { text: "BLACK",        color: "text-white" };
  if (n.includes("elite"))    return { text: "ELITE",        color: "text-white" };
  return                       { text: "VIP",                color: "text-white" };
}

function cardIcon(cardName: string) {
  const n = cardName.toLowerCase();
  if (n.includes("silver"))   return <Shield size={16} className="text-gray-400" />;
  if (n.includes("gold"))     return <Star size={16} className="text-yellow-500" />;
  if (n.includes("platinum")) return <Gem size={16} className="text-slate-400" />;
  if (n.includes("diamond"))  return <Gem size={16} className="text-blue-400" />;
  if (n.includes("black"))    return <Crown size={16} className="text-gray-300" />;
  if (n.includes("elite"))    return <Rocket size={16} className="text-purple-400" />;
  return <Zap size={16} className="text-primary-500" />;
}

function getCardId(cardName: string) {
  const n = cardName.toLowerCase();
  if (n.includes("silver"))   return "silver";
  if (n.includes("gold"))     return "gold";
  if (n.includes("platinum")) return "platinum";
  if (n.includes("diamond"))  return "diamond";
  if (n.includes("black"))    return "black";
  if (n.includes("elite"))    return "elite";
  return "silver";
}

function getDaysLeft(expiresAt: string | null) {
  if (!expiresAt) return null;
  const diffTime = new Date(expiresAt).getTime() - new Date().getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
export default function MyMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [refreshing,  setRefreshing]  = useState(false);
  const [detailItem,  setDetailItem]  = useState<Membership | null>(null);
  const [activeTab,   setActiveTab]   = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Cancellation Modal State
  const [cancelTarget, setCancelTarget] = useState<Membership | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchMemberships = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vip/memberships");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMemberships(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load your memberships. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMemberships(); }, [fetchMemberships]);

  // Cancel Membership logic
  async function handleCancelVIP(membershipId: string) {
    setCancelling(true);
    setCancelError("");
    try {
      const res = await fetch("/api/vip/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel membership request");
      
      // Update state
      setMemberships(prev => prev.map(m => m.id === membershipId ? { ...m, status: "CANCELLED" } : m));
      setCancelTarget(null);
      if (detailItem?.id === membershipId) {
        setDetailItem(prev => prev ? { ...prev, status: "CANCELLED" } : null);
      }
    } catch (err: any) {
      setCancelError(err.message || "An unexpected error occurred.");
    } finally {
      setCancelling(false);
    }
  }

  // Export CSV logic
  function handleExportCSV() {
    const headers = ["Order ID", "Card Tier", "Price ($)", "Duration", "Status", "Payment", "Payment Mode", "Ordered Date", "Expiration Date"];
    const rows = memberships.map(m => [
      m.id.toUpperCase(),
      m.cardName,
      m.price.toFixed(2),
      m.duration,
      m.status,
      m.payStatus,
      m.paymentMethod,
      new Date(m.createdAt).toLocaleDateString(),
      m.expiresAt ? new Date(m.expiresAt).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tesla-capx-vip-memberships-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }

  // Print VIP Statement / Receipt Invoice
  function handlePrintInvoice(m: Membership) {
    const printContent = `
      <html>
        <head>
          <title>VIP Invoice - #${m.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #a855f7; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; color: #a855f7; }
            .invoice-details { margin-bottom: 30px; line-height: 1.6; }
            .card { border: 1px solid #ddd; padding: 20px; border-radius: 12px; margin-bottom: 30px; background-color: #fafafa; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total { font-size: 20px; font-weight: bold; text-align: right; }
            .footer { border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #777; text-align: center; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TESLAXIPO VIP CARD INVOICE</div>
            <p>Date Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="invoice-details">
            <p><strong>Membership Order ID:</strong> ${m.id.toUpperCase()}</p>
            <p><strong>Tier Status:</strong> ${m.status}</p>
            <p><strong>Ordered Date:</strong> ${new Date(m.createdAt).toLocaleString()}</p>
            <p><strong>Expiration Date:</strong> ${m.expiresAt ? new Date(m.expiresAt).toLocaleDateString() : "Lifetime Access"}</p>
          </div>
          <div class="card">
            <h3>VIP Membership Tier Overview</h3>
            <p><strong>Card Tier:</strong> ${m.cardName}</p>
            <p><strong>Subscription Duration:</strong> ${m.duration}</p>
            <p><strong>Payment Status:</strong> ${m.payStatus === "PAID" || m.payStatus === "APPROVED" ? "APPROVED / PAID" : "PENDING"}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>VIP Benefit Tier</th>
                <th>Validation Term</th>
                <th style="text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${m.cardName} (Smart Investor Privileges)</td>
                <td>${m.duration} term access</td>
                <td style="text-align: right;">$${m.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total Charged Amount: $${m.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div class="footer">
            Thank you for unlocking VIP status. If you have any inquiries, contact vip@teslaxipo.com.
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

  /* ── Derived counts ── */
  const active    = memberships.filter((m) => m.status === "ACTIVE").length;
  const pending   = memberships.filter((m) => m.status === "PENDING").length;
  const expired   = memberships.filter((m) => m.status === "EXPIRED").length;
  const cancelled = memberships.filter((m) => m.status === "CANCELLED").length;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return memberships.filter(m => {
      const matchSearch = !q || m.cardName.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
      const matchTab = activeTab === "ALL" || m.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [memberships, searchQuery, activeTab]);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "ALL",       label: "All Cards", count: memberships.length },
    { id: "ACTIVE",    label: "Active",    count: active },
    { id: "PENDING",   label: "Pending",   count: pending },
    { id: "EXPIRED",   label: "Expired",   count: expired },
    { id: "CANCELLED", label: "Cancelled", count: cancelled },
  ];

  return (
    <>
      {/* Cancellation Confirmation Dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelTarget(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-red-100 dark:border-red-950/20 w-full max-w-md p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Cancel VIP Order?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Are you sure you want to cancel your order request for the <span className="font-extrabold text-gray-900 dark:text-white">{cancelTarget.cardName}</span>?
              {cancelTarget.paymentMethod === "BALANCE" && " This will instantly refund the total purchase amount back to your account balance."}
            </p>

            {cancelError && (
              <p className="text-xs text-red-500 font-semibold mb-4">{cancelError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleCancelVIP(cancelTarget.id)}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-500 hover:bg-red-650 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5"
              >
                {cancelling ? <><Loader2 size={13} className="animate-spin" /> Processing...</> : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Slide Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-250 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35">
              <div className="flex items-center gap-3">
                <Crown className="text-primary-500" size={24} />
                <div>
                  <h2 className="font-extrabold text-gray-900 dark:text-white text-base">Membership Summary</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Invoice ID: #{detailItem.id.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Card design preview */}
              <div className={`w-full h-32 rounded-2xl flex items-center justify-center ${cardGradient(detailItem.cardName)} shadow-lg relative overflow-hidden`}>
                <span className={`text-3xl font-black tracking-widest ${cardLabel(detailItem.cardName).color}`}>
                  {cardLabel(detailItem.cardName).text}
                </span>
                <div className="absolute top-2 right-2">{cardIcon(detailItem.cardName)}</div>
              </div>

              {/* Specs table */}
              <div className="space-y-3">
                {[
                  { label: "VIP Tier", value: detailItem.cardName },
                  { label: "Price Paid", value: fmt(detailItem.price) },
                  { label: "Duration term", value: detailItem.duration },
                  { label: "Payment Mode", value: detailItem.paymentMethod === "BALANCE" ? "Account Balance" : `Crypto (${detailItem.paymentMethod})` },
                  { label: "Purchase Date", value: new Date(detailItem.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" }) },
                  { label: "Expiration Date", value: detailItem.expiresAt ? new Date(detailItem.expiresAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Lifetime VIP Access" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs border-b border-gray-50 dark:border-gray-700/60 pb-2 last:border-0">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Status pills */}
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border dark:border-gray-750">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Approval Status</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${statusStyle(detailItem.status).bg} ${statusStyle(detailItem.status).text}`}>
                    {statusStyle(detailItem.status).icon} {statusStyle(detailItem.status).label}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${payStyle(detailItem.payStatus).bg} ${payStyle(detailItem.payStatus).text}`}>
                    {payStyle(detailItem.payStatus).label}
                  </span>
                </div>
              </div>

              {/* Crypto proof if uploaded */}
              {detailItem.paymentMethod !== "BALANCE" && detailItem.proofUrl && (
                <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-150 dark:border-gray-750/70 flex items-center gap-3">
                  <img src={detailItem.proofUrl} alt="Transfer proof preview" className="w-12 h-12 object-cover rounded-lg border border-gray-250" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 font-bold">Uploaded Crypto Receipt</p>
                    <a href={detailItem.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary-500 font-bold mt-0.5">
                      Open Image <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35">
              {(detailItem.status === "ACTIVE" || detailItem.payStatus === "PAID" || detailItem.payStatus === "APPROVED") && (
                <button
                  onClick={() => handlePrintInvoice(detailItem)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-650 text-gray-750 dark:text-gray-200 text-xs font-bold rounded-xl transition-colors"
                >
                  <FileText size={13} /> Print Invoice
                </button>
              )}
              {detailItem.status === "PENDING" && (
                <button
                  onClick={() => { setCancelTarget(detailItem); setDetailItem(null); }}
                  className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 text-xs font-bold rounded-xl transition-colors"
                >
                  <Ban size={13} /> Cancel Order
                </button>
              )}
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">My VIP Memberships</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your VIP card subscriptions and access privileges.</p>
          </div>
          <div className="flex items-center gap-2">
            {memberships.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-gray-650 dark:text-gray-300 border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <Download size={14} /> Export CSV
              </button>
            )}
            <button
              onClick={() => fetchMemberships(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
            <Link
              href="/dashboard/vip"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
            >
              <PlusCircle size={14} /> Browse Cards
            </Link>
          </div>
        </div>

        {/* Stats card counts */}
        {memberships.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Total Memberships", value: memberships.length, icon: <CreditCard size={16} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/10" },
              { label: "Active Subscriptions", value: active, icon: <CheckCircle2 size={16} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-900/10" },
              { label: "Pending Processing", value: pending, icon: <Clock size={16} className="text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-900/10" },
              { label: "Expired Tiers", value: expired, icon: <XCircle size={16} className="text-gray-400" />, bg: "bg-gray-100 dark:bg-gray-700/50" },
              { label: "Cancelled Orders", value: cancelled, icon: <Ban size={16} className="text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-900/10" },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight mt-0.5">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">Purchase Log</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">{filtered.length} records matching</p>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Card Name or ID..."
                  className="pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-750 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-primary-400 w-48 sm:w-64 transition-colors"
                />
              </div>
            </div>

            {/* Filter tab buttons */}
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

          {/* List display */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-sm text-gray-400">Loading your memberships...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
              <AlertCircle size={32} className="text-red-400 mb-4" />
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button onClick={() => fetchMemberships()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
                <CreditCard size={28} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">No Memberships Found</h3>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6">
                {memberships.length === 0 ? "You don't have any VIP memberships yet. Subscribe to unlock premium benefits." : "No membership logs match your search queries."}
              </p>
              <Link
                href="/dashboard/vip"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
              >
                <PlusCircle size={14} /> Browse Cards
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Header tags for desktop view */}
              <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                <span className="w-20" />
                <span>Card Information</span>
                <span className="text-right">Price Paid</span>
                <span className="text-center">Status Tiers</span>
                <span className="w-24 text-right">Action</span>
              </div>

              {filtered.map(m => {
                const s = statusStyle(m.status);
                const p = payStyle(m.payStatus);
                const lbl = cardLabel(m.cardName);
                const cardId = getCardId(m.cardName);
                const daysLeft = getDaysLeft(m.expiresAt);
                const isPendingPayment = m.status === "PENDING" && m.payStatus === "PAYMENT_PENDING";

                return (
                  <div
                    key={m.id}
                    onClick={() => setDetailItem(m)}
                    className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-750/30 transition-colors cursor-pointer group"
                  >
                    {/* Thumbnail banner */}
                    <div className={`w-20 h-14 rounded-xl flex-shrink-0 flex items-center justify-center ${cardGradient(m.cardName)} shadow-sm group-hover:scale-105 transition-transform`}>
                      <span className={`text-xs font-black tracking-widest ${lbl.color} text-center px-1`}>{lbl.text}</span>
                    </div>

                    {/* Middle Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                          {m.cardName}
                        </p>
                        {cardIcon(m.cardName)}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap font-semibold">
                        <Calendar size={10} />
                        {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        &nbsp;·&nbsp;
                        <span className="text-blue-500 uppercase">{m.duration} validity</span>
                        
                        {/* Countdown warnings */}
                        {m.status === "ACTIVE" && daysLeft !== null && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            daysLeft <= 5 ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-green-500/20 text-green-500"
                          }`}>
                            {daysLeft === 0 ? "Expires today" : `Expires in ${daysLeft}d`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price Paid */}
                    <div className="md:text-right flex md:flex-col justify-between items-center md:items-end gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden font-semibold">Price</span>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(m.price)}</p>
                    </div>

                    {/* Status Tiers badges */}
                    <div className="flex md:justify-center items-center justify-between gap-1 flex-wrap">
                      <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden font-semibold">Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
                          {p.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:justify-end justify-between items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden">Action</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Direct Invoice for paid/active items */}
                        {(m.status === "ACTIVE" || m.payStatus === "PAID" || m.payStatus === "APPROVED") && (
                          <button
                            onClick={() => handlePrintInvoice(m)}
                            title="Print Invoice"
                            className="p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <FileText size={15} />
                          </button>
                        )}

                        {/* Access Benefits for active members */}
                        {m.status === "ACTIVE" && (
                          <Link
                            href="/dashboard/trading"
                            className="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-[10px] font-extrabold rounded-lg transition-colors"
                          >
                            Access Perks
                          </Link>
                        )}

                        {/* Complete Payment/Upload Proof for pending payments */}
                        {isPendingPayment && (
                          <Link
                            href={`/dashboard/vip/${cardId}/purchase`}
                            className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-extrabold rounded-lg transition-colors shadow-sm shadow-orange-500/20"
                          >
                            Pay Now
                          </Link>
                        )}

                        {/* Renew Membership for expired or soon-to-expire */}
                        {(m.status === "EXPIRED" || (m.status === "ACTIVE" && daysLeft !== null && daysLeft <= 5)) && (
                          <Link
                            href={`/dashboard/vip/${cardId}/purchase`}
                            className="px-2.5 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-extrabold rounded-lg transition-colors"
                          >
                            Renew
                          </Link>
                        )}

                        {/* Cancel Pending Orders */}
                        {m.status === "PENDING" && (
                          <button
                            onClick={() => setCancelTarget(m)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Ban size={10} /> Cancel
                          </button>
                        )}

                        <button
                          onClick={() => setDetailItem(m)}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] text-gray-655 dark:text-gray-300 font-bold rounded-lg border border-gray-200 dark:border-gray-655 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
