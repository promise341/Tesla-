"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react";

interface PendingInvestment {
  id: string;
  planName: string;
  capital: number;
  rate: number;
  paymentMethod: string;
  paymentProofUrl: string;
  userWalletAddress: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

export default function InvestmentPaymentsPage() {
  const [investments, setInvestments] = useState<PendingInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewProof, setViewProof] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingInvestments();
  }, []);

  async function fetchPendingInvestments() {
    try {
      const response = await fetch("/api/admin/investment-payments");
      if (response.ok) {
        const data = await response.json();
        setInvestments(data.investments || []);
      }
    } catch (error) {
      console.error("Error fetching pending investments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(investmentId: string) {
    if (!confirm("Approve this investment payment?")) return;

    setActionLoading(investmentId);
    try {
      const response = await fetch("/api/admin/investment-payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investmentId }),
      });

      if (response.ok) {
        alert("Investment payment approved! Plan activated.");
        await fetchPendingInvestments();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to approve"}`);
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(investmentId: string) {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    setActionLoading(investmentId);
    try {
      const response = await fetch("/api/admin/investment-payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investmentId, reason }),
      });

      if (response.ok) {
        alert("Investment payment rejected.");
        await fetchPendingInvestments();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || "Failed to reject"}`);
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pending Investment Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve cryptocurrency investment purchases
          </p>
        </div>

        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg mt-4 sm:mt-0">
          <Clock className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-600">
            {investments.length} Pending Review
          </span>
        </div>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No pending investment payments
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((investment) => (
            <div
              key={investment.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Investment Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                      <User size={20} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {investment.user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {investment.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Investment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <TrendingUp size={16} className="text-primary-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Plan
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {investment.planName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign
                        size={16}
                        className="text-green-500 mt-1"
                      />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Amount
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${investment.capital.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-1">
                        <span className="text-xs font-bold text-blue-600">
                          {investment.paymentMethod === "USDT-ETH" ||
                          investment.paymentMethod === "USDT-TRX"
                            ? "₮"
                            : investment.paymentMethod === "BTC"
                            ? "₿"
                            : investment.paymentMethod === "ETH"
                            ? "Ξ"
                            : investment.paymentMethod === "BNB"
                            ? "◆"
                            : "◎"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Payment Method
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {investment.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Submitted
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {new Date(
                            investment.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Wallet */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      User's Wallet (for refunds):
                    </p>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-300 break-all">
                      {investment.userWalletAddress}
                    </code>
                  </div>

                  {/* ROI Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Return Rate:
                    </span>
                    <span className="font-bold text-primary-500">
                      {investment.rate}% Daily
                    </span>
                  </div>
                </div>

                {/* Right: Payment Proof */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Payment Proof
                    </p>
                    <div
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-500 transition-colors"
                      onClick={() => setViewProof(investment.paymentProofUrl)}
                    >
                      <Image
                        src={investment.paymentProofUrl}
                        alt="Payment Proof"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                        <Eye size={32} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(investment.id)}
                      disabled={actionLoading === investment.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors"
                    >
                      {actionLoading === investment.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(investment.id)}
                      disabled={actionLoading === investment.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors"
                    >
                      {actionLoading === investment.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <XCircle size={16} />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proof Viewer Modal */}
      {viewProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setViewProof(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={viewProof}
              alt="Payment Proof"
              width={1200}
              height={1200}
              className="rounded-lg object-contain max-h-[90vh]"
            />
            <button
              onClick={() => setViewProof(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-800 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
