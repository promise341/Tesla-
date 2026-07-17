"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface BalanceData {
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface BalanceValidation {
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface UseBalanceReturn extends BalanceData {
  refreshBalance: () => Promise<void>;
  validateAmount: (amount: number, minAmount?: number) => BalanceValidation;
  formatBalance: (amount?: number) => string;
  hasInsufficientBalance: (amount: number) => boolean;
  getAvailableBalance: () => number;
}

/**
 * Custom hook for managing user balance with validation utilities
 * Automatically fetches balance on mount and route changes
 * Provides validation methods for withdrawals and transfers
 */
export function useBalance(): UseBalanceReturn {
  const pathname = usePathname();
  const [balanceData, setBalanceData] = useState<BalanceData>({
    balance: 0,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  // Fetch balance from API
  const fetchBalance = useCallback(async () => {
    try {
      setBalanceData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch("/api/user/me");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const userData = await response.json();
      
      // Handle suspended account
      if (userData?.suspended) {
        throw new Error(userData.message || "Account suspended");
      }
      
      const balance = Number(userData?.balance) || 0;
      
      setBalanceData({
        balance,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
      
      return balance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch balance";
      setBalanceData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Auto-fetch balance on mount and route changes
  useEffect(() => {
    fetchBalance().catch(() => {
      // Error already handled in fetchBalance
    });
  }, [fetchBalance, pathname]);

  // Refresh balance manually
  const refreshBalance = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  // Format balance as currency
  const formatBalance = useCallback((amount?: number): string => {
    const value = amount !== undefined ? amount : balanceData.balance;
    return "$" + value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  }, [balanceData.balance]);

  // Check if user has insufficient balance
  const hasInsufficientBalance = useCallback((amount: number): boolean => {
    return amount > balanceData.balance;
  }, [balanceData.balance]);

  // Get available balance
  const getAvailableBalance = useCallback((): number => {
    return balanceData.balance;
  }, [balanceData.balance]);

  // Validate withdrawal/transfer amount
  const validateAmount = useCallback((
    amount: number, 
    minAmount: number = 0
  ): BalanceValidation => {
    // Check if amount is valid number
    if (isNaN(amount) || amount <= 0) {
      return {
        isValid: false,
        message: "Please enter a valid amount greater than $0",
        severity: 'error'
      };
    }

    // Check minimum amount
    if (amount < minAmount) {
      return {
        isValid: false,
        message: `Minimum amount is ${formatBalance(minAmount)}`,
        severity: 'error'
      };
    }

    // Check if user has sufficient balance
    if (amount > balanceData.balance) {
      const shortfall = amount - balanceData.balance;
      return {
        isValid: false,
        message: `Insufficient balance. You need ${formatBalance(shortfall)} more. Current balance: ${formatBalance()}`,
        severity: 'error'
      };
    }

    // Check if amount would leave very low balance (warning)
    const remainingBalance = balanceData.balance - amount;
    if (remainingBalance < 10 && remainingBalance > 0) {
      return {
        isValid: true,
        message: `This will leave you with only ${formatBalance(remainingBalance)} remaining`,
        severity: 'warning'
      };
    }

    // All good
    return {
      isValid: true,
      message: `Available after transaction: ${formatBalance(remainingBalance)}`,
      severity: 'info'
    };
  }, [balanceData.balance, formatBalance]);

  return {
    balance: balanceData.balance,
    loading: balanceData.loading,
    error: balanceData.error,
    lastUpdated: balanceData.lastUpdated,
    refreshBalance,
    validateAmount,
    formatBalance,
    hasInsufficientBalance,
    getAvailableBalance,
  };
}

export default useBalance;