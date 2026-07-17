"use client";

import { useState, useEffect } from "react";
import {
  Building2, User, DollarSign, Calendar, Eye, 
  CheckCircle2, XCircle, Loader2, AlertCircle, Clock
} from "lucide-react";

interface RealEstateRequest {
  id: string;
  userId: string;
  planName: string;
  paymentMethod: string;
  paymentProofUrl: string;
  userWalletAddress: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
}

export default function RealEstateRequestsPage() {
  const [requests, setRequests] = useState<RealEstateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [viewProof, setViewProof] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/admin/real-estate-requests");
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(requestId: string, action: "approve" | "reject") {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;

    setActionLoading(requestId);
    setError("");

    try {
      const res = await fetch("/api/admin/real-estate-requests/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Remove request from list
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Building2 size={22} className="text-primary-500" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
            Real Estate Access Requests
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Review and approve user requests for real estate plan access
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-500" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{requests.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Needs Review</p>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{requests.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-blue-500" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Requests</p>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{requests.length}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Pending Requests</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All real estate access requests have been processed
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Request Info */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                        <Building2 size={16} className="text-primary-500" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 dark:text-white">{request.planName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Real Estate Plan</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <User size={12} className="text-gray-400" />
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">User</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{request.user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{request.user.email}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign size={12} className="text-gray-400" />
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Payment</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{request.paymentMethod}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cryptocurrency</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar size={12} className="text-gray-400" />
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Wallet Address</p>
                    </div>
                    <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono text-gray-900 dark:text-white break-all">
                      {request.userWalletAddress}
                    </code>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={12} className="text-gray-400" />
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Submitted</p>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right: Payment Proof */}
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Payment Proof</p>
                  <div className="relative group">
                    <img
                      src={request.paymentProofUrl}
                      alt="Payment proof"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
                      onClick={() => setViewProof(request.paymentProofUrl)}
                    />
                    <button
                      onClick={() => setViewProof(request.paymentProofUrl)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
                    >
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Eye size={18} />
                        View Full Size
                      </div>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => handleAction(request.id, "reject")}
                      disabled={actionLoading === request.id}
                      className="flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                    >
                      {actionLoading === request.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <XCircle size={16} />
                          Reject
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(request.id, "approve")}
                      disabled={actionLoading === request.id}
                      className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                    >
                      {actionLoading === request.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Approve
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

      {/* Proof Modal */}
      {viewProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setViewProof(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={viewProof}
              alt="Payment proof"
              className="max-w-full max-h-[90vh] rounded-xl"
            />
            <button
              onClick={() => setViewProof(null)}
              className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
