"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, AlertCircle, DollarSign, X, Bell } from "lucide-react";
import Image from "next/image";

interface ProofTransaction {
  id: string;
  type: "DEPOSIT" | "PLAN" | "VIP" | "CAR";
  userId: string;
  amount: number;
  method: string;
  proofImageUrl: string;
  userWalletAddress: string;
  createdAt: string;
  details: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
}

export default function PaymentProofsPage() {
  const [proofs, setProofs] = useState<ProofTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<ProofTransaction | null>(null);
  
  // Manual Credit Modal States
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  
  // Approval Modal States
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<"approve" | "reject">("approve");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [currentProofForApproval, setCurrentProofForApproval] = useState<ProofTransaction | null>(null);

  useEffect(() => {
    fetchProofs();
  }, []);

  async function fetchProofs() {
    try {
      const res = await fetch("/api/admin/proofs/approve");
      if (res.ok) {
        const data = await res.json();
        setProofs(data.proofs || []);
      }
    } catch (err) {
      console.error("Error fetching proofs:", err);
    } finally {
      setLoading(false);
    }
  }

  function openApprovalModal(proof: ProofTransaction, type: "approve" | "reject") {
    setCurrentProofForApproval(proof);
    setApprovalType(type);
    setApprovalMessage("");
    setShowApprovalModal(true);
  }

  async function handleApproval() {
    if (!currentProofForApproval) return;
    
    setProcessingId(currentProofForApproval.id);
    try {
      const res = await fetch("/api/admin/proofs/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentProofForApproval.id,
          type: currentProofForApproval.type,
          approved: approvalType === "approve",
          message: approvalMessage || undefined,
        }),
      });

      if (res.ok) {
        // Don't filter out - keep proofs visible after approval
        fetchProofs();
        setSelectedProof(null);
        setShowApprovalModal(false);
        setCurrentProofForApproval(null);
        setApprovalMessage("");
        
        // Beautiful success notification
        showNotification(
          approvalType === "approve" ? "✅ Payment approved successfully!" : "❌ Payment rejected",
          approvalType === "approve" ? "success" : "error"
        );
      } else {
        showNotification("❌ Error processing approval", "error");
      }
    } catch (err) {
      showNotification("❌ Error: " + String(err), "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleManualCredit() {
    if (!creditEmail || !creditAmount || !creditNote) {
      showNotification("❌ All fields are required", "error");
      return;
    }
    
    setProcessingId("credit");
    try {
      const res = await fetch("/api/admin/users/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: creditEmail,
          amount: parseFloat(creditAmount),
          message: creditNote,
        }),
      });

      if (res.ok) {
        setShowCreditModal(false);
        setCreditEmail("");
        setCreditAmount("");
        setCreditNote("");
        
        // Vibrating bell notification
        showNotification("✅ User credited successfully! 🔔", "success", true);
      } else {
        showNotification("❌ Failed to credit user", "error");
      }
    } catch (err) {
      showNotification("❌ Error: " + String(err), "error");
    } finally {
      setProcessingId(null);
    }
  }

  function showNotification(message: string, type: "success" | "error", vibrate = false) {
    // Create beautiful notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-2xl transform transition-all duration-500 ${
      type === "success" 
        ? "bg-green-500 text-white" 
        : "bg-red-500 text-white"
    } ${vibrate ? "animate-bounce" : ""}`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-lg">${message}</span>
        ${vibrate ? '<span class="text-2xl animate-pulse">🔔</span>' : ''}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Vibrate if supported and requested
    if (vibrate && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 4000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p>Loading payment proofs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Proofs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and verify all payment proofs (Deposits, Plans, VIP, Cars)
          </p>
        </div>
        <button
          onClick={() => setShowCreditModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <DollarSign size={20} />
          Manual Credit User
        </button>
      </div>

      {proofs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No pending payment proofs</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {proofs.map((proof) => (
                <button
                  key={proof.id}
                  onClick={() => setSelectedProof(proof)}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedProof?.id === proof.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">{proof.user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{proof.user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      proof.type === "DEPOSIT" ? "bg-green-100 text-green-700" :
                      proof.type === "PLAN" ? "bg-blue-100 text-blue-700" :
                      proof.type === "VIP" ? "bg-purple-100 text-purple-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {proof.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      proof.method === "BTC" ? "bg-orange-100 text-orange-700" :
                      proof.method === "ETH" ? "bg-blue-100 text-blue-700" :
                      proof.method === "USDT" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {proof.method}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                    {proof.details}
                  </p>
                  <p className="text-lg font-bold text-primary-500 mt-1">
                    ${proof.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(proof.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Proof Viewer */}
          {selectedProof && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedProof.user.name}
                    </h2>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mt-2 ${
                      selectedProof.type === "DEPOSIT" ? "bg-green-100 text-green-700" :
                      selectedProof.type === "PLAN" ? "bg-blue-100 text-blue-700" :
                      selectedProof.type === "VIP" ? "bg-purple-100 text-purple-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {selectedProof.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-500">
                      ${selectedProof.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{selectedProof.method}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    {selectedProof.details}
                  </p>
                </div>

                {/* User Details */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedProof.user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Address</p>
                    <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                      {selectedProof.userWalletAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedProof.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Proof Image */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Proof Screenshot
                  </p>
                  <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                    <Image
                      src={selectedProof.proofImageUrl}
                      alt="Payment Proof"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3">
                    ✓ Verification Checklist
                  </p>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      Transaction hash visible
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      Amount matches: ${selectedProof.amount.toFixed(2)}
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      Recipient address correct
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      Network confirmations visible
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openApprovalModal(selectedProof, "approve")}
                    disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <CheckCircle2 size={18} />
                    Approve & {selectedProof.type === "DEPOSIT" ? "Credit" : "Activate"}
                  </button>
                  <button
                    onClick={() => openApprovalModal(selectedProof, "reject")}
                    disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="text-green-500" />
                Manual Credit User
              </h3>
              <button
                onClick={() => {
                  setShowCreditModal(false);
                  setCreditEmail("");
                  setCreditAmount("");
                  setCreditNote("");
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">User Email</label>
                <input
                  type="email"
                  value={creditEmail}
                  onChange={(e) => setCreditEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message to User</label>
                <textarea
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="Reason for manual credit..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreditModal(false);
                    setCreditEmail("");
                    setCreditAmount("");
                    setCreditNote("");
                  }}
                  disabled={!!processingId}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualCredit}
                  disabled={!!processingId}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {processingId === "credit" ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <DollarSign size={16} />
                      Credit User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && currentProofForApproval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {approvalType === "approve" ? (
                  <CheckCircle2 className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}
                {approvalType === "approve" ? "Approve Payment" : "Reject Payment"}
              </h3>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setCurrentProofForApproval(null);
                  setApprovalMessage("");
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
              <p className="font-bold text-gray-900 dark:text-white">{currentProofForApproval.user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Amount: ${currentProofForApproval.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Type: {currentProofForApproval.type}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {approvalType === "approve" ? "Custom message for user (optional)" : "Rejection reason for user (optional)"}
                </label>
                <textarea
                  value={approvalMessage}
                  onChange={(e) => setApprovalMessage(e.target.value)}
                  placeholder={
                    approvalType === "approve"
                      ? "Enter a custom message to send to the user..."
                      : "Enter the reason for rejecting this payment..."
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setCurrentProofForApproval(null);
                    setApprovalMessage("");
                  }}
                  disabled={!!processingId}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  disabled={!!processingId}
                  className={`flex-1 px-4 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                    approvalType === "approve"
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  }`}
                >
                  {processingId === currentProofForApproval.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      {approvalType === "approve" ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {approvalType === "approve" ? "Approve" : "Reject"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">
              ✨ All Payment Types Supported
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              This page shows all payment proofs: deposits, investment plans, VIP purchases, and car orders. 
              Use beautiful modals to approve/reject with custom messages. Approved proofs remain visible and users get instant notifications with vibrating bell alerts! 🔔
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}