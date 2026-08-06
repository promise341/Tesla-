import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

async function checkAdmin(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return user?.role === "ADMIN";
}

// POST — verify/unverify a user
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId, isVerified } = await request.json();
    if (!userId || typeof isVerified !== "boolean") {
      return NextResponse.json({ error: "userId and isVerified required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
      },
    });

    // Send notification to user
    await prisma.notification.create({
      data: {
        userId,
        type: isVerified ? "ACCOUNT_VERIFIED" : "ACCOUNT_STATUS",
        title: isVerified ? "Account Verified" : "Verification Removed",
        message: isVerified
          ? "Congratulations! Your account has been verified by an administrator. You now have a verified badge on your profile."
          : "Your account verification status has been updated.",
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${isVerified ? "verified" : "unverified"} successfully`,
    });
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}
