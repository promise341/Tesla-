import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function verifyAdminSecurity(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify user is ADMIN in the database — this is the security
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, email: true },
    });

    if (adminUser?.role !== "ADMIN") {
      console.log(`[SECURITY] Non-admin attempted API access: ${session.user.email}`);
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Admin role confirmed — allow through
    return null;

  } catch (error) {
    console.error("[SECURITY] Admin security verification error:", error);
    return NextResponse.json(
      { error: "Security verification failed" },
      { status: 500 }
    );
  }
}
