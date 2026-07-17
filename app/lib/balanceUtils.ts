/**
 * Balance validation utilities for withdrawals, purchases, and transfers
 * Provides comprehensive balance checking with detailed error messages
 */

export interface BalanceValidation {
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  shortfall?: number;
  currentBalance?: number;
  requiredAmount?: number;
}

export interface InsufficientBalanceError {
  error: string;
  message: string;
  insufficientBalance: true;
  currentBalance: number;
  requiredAmount: number;
  shortfall: number;
  redirectUrl: string;
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
}

/**
 * Create a standardized insufficient balance error response
 */
export function createInsufficientBalanceError(
  currentBalance: number,
  requiredAmount: number,
  operation: string = 'transaction'
): InsufficientBalanceError {
  const shortfall = requiredAmount - currentBalance;
  
  return {
    error: "Insufficient balance",
    message: `You need ${formatCurrency(requiredAmount)} for this ${operation}, but your current balance is ${formatCurrency(currentBalance)}. Please deposit ${formatCurrency(shortfall)} or more to complete this ${operation}.`,
    insufficientBalance: true,
    currentBalance,
    requiredAmount,
    shortfall,
    redirectUrl: getInsufficientBalanceRedirectUrl(operation, requiredAmount, shortfall)
  };
}

/**
 * Validate any transaction amount against user balance
 */
export function validateTransactionAmount(
  amount: number,
  userBalance: number,
  minAmount: number = 0,
  operation: string = 'transaction'
): BalanceValidation {
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
      message: `Minimum ${operation} amount is ${formatCurrency(minAmount)}`,
      severity: 'error'
    };
  }

  // Check if user has sufficient balance
  if (amount > userBalance) {
    const shortfall = amount - userBalance;
    return {
      isValid: false,
      message: `Insufficient balance. You need ${formatCurrency(shortfall)} more. Your current balance is ${formatCurrency(userBalance)}`,
      severity: 'error',
      shortfall,
      currentBalance: userBalance,
      requiredAmount: amount
    };
  }

  // Check if amount would leave very low balance (warning)
  const remainingBalance = userBalance - amount;
  if (remainingBalance < 10 && remainingBalance >= 0) {
    return {
      isValid: true,
      message: `Warning: This will leave you with only ${formatCurrency(remainingBalance)} remaining`,
      severity: 'warning'
    };
  }

  // All good
  return {
    isValid: true,
    message: `Available after ${operation}: ${formatCurrency(remainingBalance)}`,
    severity: 'success'
  };
}

/**
 * Validate withdrawal amount against user balance
 */
export function validateWithdrawalAmount(
  amount: number,
  userBalance: number,
  minAmount: number = 10
): BalanceValidation {
  return validateTransactionAmount(amount, userBalance, minAmount, 'withdrawal');
}

/**
 * Validate purchase amount against user balance
 */
export function validatePurchaseAmount(
  amount: number,
  userBalance: number,
  minAmount: number = 0
): BalanceValidation {
  return validateTransactionAmount(amount, userBalance, minAmount, 'purchase');
}

/**
 * Check if user has insufficient balance for any operation
 */
export function hasInsufficientBalance(
  userBalance: number,
  requiredAmount: number
): boolean {
  return userBalance < requiredAmount;
}

/**
 * Check if user has insufficient balance for minimum operation
 */
export function hasInsufficientBalanceForWithdrawal(
  userBalance: number,
  minAmount: number = 10
): boolean {
  return userBalance < minAmount;
}

/**
 * Get redirect URL for insufficient balance with context
 */
export function getInsufficientBalanceRedirectUrl(
  operation: string = 'transaction',
  requiredAmount?: number,
  shortfall?: number
): string {
  const params = new URLSearchParams({
    reason: 'insufficient_balance',
    operation: operation
  });
  
  if (requiredAmount) {
    params.set('required', requiredAmount.toFixed(2));
  }
  
  if (shortfall) {
    params.set('shortfall', shortfall.toFixed(2));
  }
  
  return `/dashboard/wallet/deposit?${params.toString()}`;
}