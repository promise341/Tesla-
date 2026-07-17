import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createInsufficientBalanceError } from "@/app/lib/balanceUtils";

/**
 * Middleware helper for validating user balance before transactions
 * Returns standardized insufficient balance errors
 */

export interface BalanceCheckOptions {
  userId: string;
  requiredAmount: number;
  operation?: string;
  includeUserData?: boolean;
}

export interface BalanceCheckResult {
  success: boolean;
  user?: {
    id: string;
    balance: number;
    email: string;
    name: string | null;
  };
  response?: NextResponse;
}

/**
 * Check if user has sufficient balance for a transaction
 * Returns user data if sufficient, or error response if insufficient
 */
export async function checkSufficientBalance(
  options: BalanceCheckOptions
): Promise<BalanceCheckResult> {
  const { userId, requiredAmount, operation = 'transaction', includeUserData = true } = options;

  // Fetch user with balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      balance: true, 
      email: true, 
      name: true 
    }
  });

  if (!user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    };
  }

  // Check balance
  if (user.balance < requiredAmount) {
    const errorResponse = createInsufficientBalanceError(
      user.balance,
      requiredAmount,
      operation
    );
    
    return {
      success: false,
      user: includeUserData ? user : undefined,
      response: NextResponse.json(errorResponse, { status: 400 })
    };
  }

  // Sufficient balance
  return {
    success: true,
    user
  };
}

/**
 * Validate and deduct balance atomically for a transaction
 * Returns Prisma transaction operations to include in your $transaction call
 */
export function createBalanceDeduction(
  userId: string,
  amount: number,
  transactionType: string,
  transactionDetails: string
) {
  return [
    // Deduct balance
    prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } }
    }),
    // Create transaction record
    prisma.transaction.create({
      data: {
        userId,
        type: transactionType,
        amount,
        method: "BALANCE",
        address: transactionDetails,
        status: "COMPLETED"
      }
    })
  ];
}
