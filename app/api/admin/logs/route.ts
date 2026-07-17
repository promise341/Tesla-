import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Since we don't have a dedicated logs table, generate mock admin activity logs
    // In a real system, you would have an audit_logs table
    const mockLogs = [
      {
        id: "log-1",
        adminEmail: session.user.email,
        adminName: "Admin User",
        action: "User Deactivated",
        targetType: "user" as const,
        targetId: "user-123",
        targetInfo: "john.doe@example.com",
        details: "User account deactivated due to policy violation",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        ipAddress: "192.168.1.100"
      },
      {
        id: "log-2", 
        adminEmail: session.user.email,
        adminName: "Admin User",
        action: "Deposit Approved",
        targetType: "deposit" as const,
        targetId: "dep-456",
        targetInfo: "$500 BTC deposit",
        details: "Approved Bitcoin deposit after proof verification",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        ipAddress: "192.168.1.100"
      },
      {
        id: "log-3",
        adminEmail: session.user.email,
        adminName: "Admin User", 
        action: "KYC Rejected",
        targetType: "kyc" as const,
        targetId: "kyc-789",
        targetInfo: "jane.smith@example.com ID verification",
        details: "KYC document rejected - document quality insufficient",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        ipAddress: "192.168.1.100"
      },
      {
        id: "log-4",
        adminEmail: session.user.email,
        adminName: "Admin User",
        action: "User Activated",
        targetType: "user" as const,
        targetId: "user-321",
        targetInfo: "mike.wilson@example.com",
        details: "User account reactivated after appeal review",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        ipAddress: "192.168.1.100"
      },
      {
        id: "log-5",
        adminEmail: session.user.email,
        adminName: "Admin User",
        action: "Withdrawal Approved",
        targetType: "withdrawal" as const,
        targetId: "with-654",
        targetInfo: "$1000 ETH withdrawal",
        details: "Approved Ethereum withdrawal to verified wallet",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        ipAddress: "192.168.1.100"
      },
      {
        id: "log-6",
        adminEmail: session.user.email,
        adminName: "Admin User",
        action: "Admin Panel Access",
        targetType: "user" as const,
        targetId: session.user.email || "",
        targetInfo: "Admin dashboard access",
        details: "Accessed admin dashboard and viewed user statistics",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        ipAddress: "192.168.1.100"
      }
    ];

    return NextResponse.json({
      success: true,
      logs: mockLogs
    });

  } catch (error) {
    console.error("Error fetching admin logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin logs" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, name: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { action, targetType, targetId, targetInfo, details } = await request.json();

    // In a real system, you would save this to an audit_logs table
    // For now, we'll just return success since it's logged in the client
    const logEntry = {
      id: `log-${Date.now()}`,
      adminEmail: session.user.email,
      adminName: adminUser.name || "Admin User",
      action,
      targetType,
      targetId,
      targetInfo,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100" // In real system, get from request headers
    };

    return NextResponse.json({
      success: true,
      log: logEntry
    });

  } catch (error) {
    console.error("Error creating admin log:", error);
    return NextResponse.json(
      { error: "Failed to create admin log" }, 
      { status: 500 }
    );
  }
}