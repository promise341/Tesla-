"use client";

import { AlertCircle, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";

interface InsufficientBalanceAlertProps {
  currentBalance: number;
  requiredAmount: number;
  operation?: string;
  showDepositButton?: boolean;
  className?: string;
}

/**
 * Reusable alert component for displaying insufficient balance errors
 * Shows current balance, required amount, and shortfall with deposit button
 */
export function InsufficientBalanceAlert({
  currentBalance,
  requiredAmount,
  operation = "this transaction",
  showDepositButton = true,
  className = "",
}: InsufficientBalanceAlertProps) {
  const shortfall = requiredAmount - currentBalance;
  
  const formatCurrency = (amount: number) => {
    return "$" + amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle size={20} className="text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400 mb-2">
            Insufficient Balance
          </h3>
          <div className="space-y-2 text-xs text-red-600 dark:text-red-300">
            <div className="flex items-center justify-between">
              <span>Required for {operation}:</span>
              <span className="font-bold">{formatCurrency(requiredAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Your current balance:</span>
              <span className="font-bold">{formatCurrency(currentBalance)}</span>
            </div>
            <div className="pt-2 border-t border-red-200 dark:border-red-800 flex items-center justify-between">
              <span className="font-extrabold">Amount needed:</span>
              <span className="font-extrabold text-base">{formatCurrency(shortfall)}</span>
            </div>
          </div>
          {showDepositButton && (
            <Link
              href={`/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(operation)}&required=${requiredAmount.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <DollarSign size={14} />
              Deposit Now
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default InsufficientBalanceAlert;
