"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBalance } from "@/app/hooks/useBalance";
import { AlertCircle, Loader2, DollarSign, ArrowRight } from "lucide-react";

interface BalanceCheckerProps {
  requiredAmount: number;
  operation?: string;
  minAmount?: number;
  onBalanceCheck?: (hasSufficient: boolean, currentBalance: number) => void;
  redirectOnInsufficient?: boolean;
  showAlert?: boolean;
  children?: React.ReactNode;
}

/**
 * Component that checks if user has sufficient balance
 * Can automatically redirect to deposit page or show warning
 */
export function BalanceChecker({
  requiredAmount,
  operation = 'transaction',
  minAmount = 0,
  onBalanceCheck,
  redirectOnInsufficient = false,
  showAlert = true,
  children
}: BalanceCheckerProps) {
  const router = useRouter();
  const { balance, loading, validateAmount, formatBalance } = useBalance();
  const [hasSufficientBalance, setHasSufficientBalance] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      const validation = validateAmount(requiredAmount, minAmount);
      const isSufficient = validation.isValid;
      setHasSufficientBalance(isSufficient);
      
      // Callback
      if (onBalanceCheck) {
        onBalanceCheck(isSufficient, balance);
      }

      // Auto-redirect if insufficient and enabled
      if (!isSufficient && redirectOnInsufficient) {
        const shortfall = requiredAmount - balance;
        router.push(
          `/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(operation)}&required=${requiredAmount.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`
        );
      }
    }
  }, [balance, loading, requiredAmount, minAmount, operation, redirectOnInsufficient, onBalanceCheck, router, validateAmount]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <Loader2 size={16} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Checking balance...</span>
      </div>
    );
  }

  // Insufficient balance alert
  if (!hasSufficientBalance && showAlert) {
    const shortfall = requiredAmount - balance;
    
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400 mb-2">
              Insufficient Balance
            </h3>
            <div className="space-y-2 text-xs text-red-600 dark:text-red-300 mb-3">
              <div className="flex items-center justify-between">
                <span>Required for {operation}:</span>
                <span className="font-bold">{formatBalance(requiredAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Your current balance:</span>
                <span className="font-bold">{formatBalance(balance)}</span>
              </div>
              <div className="pt-2 border-t border-red-200 dark:border-red-800 flex items-center justify-between">
                <span className="font-extrabold">Amount needed:</span>
                <span className="font-extrabold text-base">{formatBalance(shortfall)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                router.push(
                  `/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(operation)}&required=${requiredAmount.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`
                );
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <DollarSign size={14} />
              Deposit Funds
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Sufficient balance - render children if any
  return <>{children}</>;
}

export default BalanceChecker;
