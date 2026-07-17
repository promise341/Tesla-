"use client";

import { Clock, AlertCircle, DollarSign, TrendingUp, Percent } from "lucide-react";

interface PendingPlan {
  id: string;
  planName: string;
  capital: number;
  rate: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

function fmt(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function getCryptoIcon(method: string) {
  if (method === "BTC") return "₿";
  if (method === "ETH") return "Ξ";
  if (method === "BNB") return "◆";
  if (method === "SOLANA") return "◎";
  if (method === "USDT" || method === "USDT-ETH" || method === "USDT-TRX") return "₮";
  return "💰";
}

function getCryptoColor(method: string) {
  if (method === "BTC") return "bg-orange-500";
  if (method === "ETH") return "bg-blue-500";
  if (method === "BNB") return "bg-yellow-500";
  if (method === "SOLANA") return "bg-purple-500";
  if (method === "USDT" || method === "USDT-ETH" || method === "USDT-TRX") return "bg-green-500";
  return "bg-gray-500";
}

export default function PendingInvestmentCard({ plan }: { plan: PendingPlan }) {
  const dailyReturn = (plan.capital * plan.rate) / 100;
  const isPending = plan.paymentStatus === "PENDING";
  const isRejected = plan.paymentStatus === "REJECTED";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-700 shadow-sm overflow-hidden">
      {/* Top accent bar with animation */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-pulse" />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getCryptoColor(plan.paymentMethod || "")}`}>
              <span className="text-white text-xl font-bold">
                {getCryptoIcon(plan.paymentMethod || "")}
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                {plan.planName}
              </h3>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                {plan.paymentMethod || "Crypto"}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0 ${
              isRejected
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            {isRejected ? "REJECTED" : "PENDING APPROVAL"}
          </span>
        </div>

        {/* Pending Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Clock size={14} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                {isRejected
                  ? "Payment Rejected"
                  : "Awaiting Admin Verification"}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
                {isRejected
                  ? "Your payment proof was rejected. Please contact support or submit a new investment."
                  : `Your ${plan.paymentMethod} payment proof is being reviewed. This usually takes 2-4 hours. Your plan will activate once approved.`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
              <DollarSign size={9} /> Investment
            </p>
            <p className="text-sm font-black text-gray-900 dark:text-white">
              {fmt(plan.capital)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
              <Percent size={9} /> Daily Rate
            </p>
            <p className="text-sm font-black text-primary-500">{plan.rate}%</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
              <TrendingUp size={9} /> Will Earn Daily
            </p>
            <p className="text-sm font-black text-green-600 dark:text-green-400">
              {fmt(dailyReturn)}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-3">
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
              <Clock size={9} /> Status
            </p>
            <p className="text-sm font-black text-yellow-600 dark:text-yellow-400">
              {isRejected ? "Rejected" : "Pending"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
          <div className="text-[10px] text-gray-400">
            Submitted:{" "}
            {new Date(plan.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
            ID: <span className="font-mono">{plan.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
