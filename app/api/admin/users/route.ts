import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { verifyAdminSecurity } from "../middleware/security";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Check admin security first
  const securityCheck = await verifyAdminSecurity(request);
  if (securityCheck) return securityCheck;

  const session = await getServerSession(authOptions);
  const adminUser = await prisma.user.findUnique({
    where: { email: session!.user!.email },
    select: { role: true },
  });

  try {
    // Fetch all users with their transaction data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        balance: true,
        kycStatus: true,
        role: true,
        transactions: {
          select: {
            amount: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process user data
    const processedUsers = users.map(user => {
      const completedTransactions = user.transactions.filter(t => t.status === 'COMPLETED');
      const deposits = completedTransactions.filter(t => t.type === 'DEPOSIT');
      const withdrawals = completedTransactions.filter(t => t.type === 'WITHDRAWAL');

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        isActive: user.role !== 'SUSPENDED',
        emailVerified: true, // Default since we don't have this field
        kycStatus: user.kycStatus?.toLowerCase() || 'pending',
        totalBalance: user.balance || 0,
        totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
      };
    });

    return NextResponse.json({ 
      success: true, 
      users: processedUsers 
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Check admin security first
  const securityCheck = await verifyAdminSecurity(request);
  if (securityCheck) return securityCheck;

  const session = await getServerSession(authOptions);
  const adminUser = await prisma.user.findUnique({
    where: { email: session!.user!.email },
    select: { role: true },
  });

  try {
    const { userId, isActive } = await request.json();

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid parameters" }, 
        { status: 400 }
      );
    }

    // Update user role based on active status
    await prisma.user.update({
      where: { id: userId },
      data: { role: isActive ? 'USER' : 'SUSPENDED' }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" }, 
      { status: 500 }
    );
  }
}