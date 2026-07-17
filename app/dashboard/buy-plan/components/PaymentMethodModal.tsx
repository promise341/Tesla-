"use client";

import { DollarSign, Lock, CheckCircle2, AlertCircle, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Plan {
  name: string;
  roi: string;
  minAmount: number;
  maxAmount: number;
  rate: number;
  rateLabel: string;
  duration: number;
  durationUnit: string;
  category: string;
}

interface PaymentMethodModalProps {
  plan: Plan;
  amount: number;
  userBalance: number;
  onSelectBalance: () => void;
  onSelectCrypto: () => void;
  onClose: () => void;
}

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

export default function PaymentMethodModal({
  plan,
  amount,
  userBalance,
  onSelectBalance,
  onSelectCrypto,
  onClose,
}: PaymentMethodModalProps) {
  const router = useRouter();
  const hasEnoughBalance = userBalance >= amount;
  const remainingBalance = userBalance - amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <DollarSign size={20} className="text-primary-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white">
              Choose Payment Method
            </h3>
            <p className="text-xs text-gray-400">
              {plan.name} - {fmt(amount)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Option 1: Pay with Balance */}
          <button
            onClick={hasEnoughBalance ? onSelectBalance : () => {
              const shortfall = amount - userBalance;
              router.push(`/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(plan.name + " plan")}&required=${amount.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`);
            }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
              hasEnoughBalance
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-300"
                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:border-red-300"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasEnoughBalance ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  <DollarSign size={16} className={hasEnoughBalance ? "text-green-500" : "text-red-500"} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {hasEnoughBalance ? "Pay with Account Balance" : "Deposit Funds (Insufficient Balance)"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hasEnoughBalance ? "Instant activation • No waiting" : "Redirect to deposit page to add funds"}
                  </p>
                </div>
              </div>
              {hasEnoughBalance ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <ArrowRight size={18} className="text-red-500" />
              )}
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-gray-500 dark:text-gray-400">
                Current Balance:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {fmt(userBalance)}
              </span>
            </div>
            {hasEnoughBalance && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">
                  After Purchase:
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {fmt(remainingBalance)}
                </span>
              </div>
            )}
            {!hasEnoughBalance && (
              <div className="flex items-center gap-1 mt-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={12} />
                <span>
                  Insufficient balance (Need {fmt(amount - userBalance)} more. Click to Deposit)
                </span>
              </div>
            )}
          </button>

          {/* Option 2: Pay with Crypto */}
          <button
            onClick={onSelectCrypto}
            className="w-full text-left p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Pay with Cryptocurrency
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin approval required • 2-4 hours
                  </p>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p>✓ Supports: BTC, ETH, BNB, SOLANA, USDT</p>
              <p>✓ Upload payment proof after sending</p>
            </div>
          </button>
        </div>

        <div className="mt-5 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle
              size={14}
              className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Balance payments are instant. Crypto payments require admin
              verification before plan activation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
