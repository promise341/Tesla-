import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
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

    const { documentId, action, rejectionReason } = await request.json();

    if (!documentId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid parameters" }, 
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" }, 
        { status: 400 }
      );
    }

    // Extract userId from documentId (format: userId-doctype)
    const userId = documentId.split('-')[0];
    
    // Update user KYC status
    await prisma.user.update({
      where: { id: userId },
      data: { 
        kycStatus: action === 'approve' ? 'VERIFIED' : 'REJECTED'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Document ${action}d successfully`
    });

  } catch (error) {
    console.error("Error reviewing KYC document:", error);
    return NextResponse.json(
      { error: "Failed to review document" }, 
      { status: 500 }
    );
  }
}