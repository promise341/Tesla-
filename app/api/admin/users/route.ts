import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

async function checkAdmin(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === "ADMIN";
}

// GET — list all users with wallet addresses
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        phone: true,
        country: true,
        createdAt: true,
        balance: true,
        totalProfit: true,
        totalWithdraw: true,
        kycStatus: true,
        role: true,
        depositAddresses: {
          select: { currency: true, address: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            method: true,
            userWalletAddress: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const processedUsers = users.map((user) => {
      const deposits = user.transactions.filter((t) => t.type === "DEPOSIT");
      const withdrawals = user.transactions.filter((t) => t.type === "WITHDRAWAL");
      const rawWallets = user.transactions
        .filter((t) => t.type === "WITHDRAWAL" && t.userWalletAddress)
        .map((t) => t.userWalletAddress as string);
      const withdrawalWallets = rawWallets.filter((val, idx, self) => self.indexOf(val) === idx);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        phone: user.phone,
        country: user.country,
        createdAt: user.createdAt,
        role: user.role,
        isActive: user.role !== "SUSPENDED",
        kycStatus: user.kycStatus?.toLowerCase() || "unverified",
        totalBalance: user.balance || 0,
        totalProfit: user.totalProfit || 0,
        totalDeposits: deposits.reduce((s, t) => s + t.amount, 0),
        totalWithdrawals: withdrawals.reduce((s, t) => s + t.amount, 0),
        transactionCount: user.transactions.length,
        withdrawalWallets,
        depositAddresses: user.depositAddresses,
        recentTransactions: user.transactions.slice(0, 10),
      };
    });

    return NextResponse.json({ success: true, users: processedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// PUT — update user role / suspend / activate
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId, isActive, role } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    let newRole: string;
    if (role) {
      newRole = role;
    } else if (typeof isActive === "boolean") {
      newRole = isActive ? "USER" : "SUSPENDED";
    } else {
      return NextResponse.json({ error: "Provide isActive or role" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
    return NextResponse.json({ success: true, message: `User role set to ${newRole}` });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// PATCH — manual balance credit / debit
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId, amount, note } = await request.json();
    if (!userId || typeof amount !== "number") {
      return NextResponse.json({ error: "userId and numeric amount required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true, email: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newBalance = Math.max(0, (user.balance || 0) + amount);

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { balance: newBalance } }),
      prisma.transaction.create({
        data: {
          userId,
          type: amount >= 0 ? "DEPOSIT" : "WITHDRAWAL",
          amount: Math.abs(amount),
          method: "ADMIN_MANUAL",
          status: "COMPLETED",
          address: note || `Admin manual ${amount >= 0 ? "credit" : "debit"}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: amount >= 0 ? "PAYMENT_RECEIVED" : "WITHDRAWAL_APPROVED",
          title: amount >= 0 ? "Balance Credited" : "Balance Adjusted",
          message: amount >= 0
            ? `$${amount.toFixed(2)} has been credited to your account.${note ? " Note: " + note : ""}`
            : `$${Math.abs(amount).toFixed(2)} has been deducted from your account.${note ? " Note: " + note : ""}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Balance ${amount >= 0 ? "credited" : "debited"} successfully`,
      previousBalance: user.balance,
      newBalance,
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}