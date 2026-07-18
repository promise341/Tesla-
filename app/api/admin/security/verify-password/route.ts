import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const ADMIN_MASTER_PASSWORD =
  process.env.ADMIN_MASTER_PASSWORD || "TeslaCapX@Admin2024!";

export async function POST(request: Request) {
  try {
    // 1. Must be logged in via NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check the master password — NO database call needed here
    //    (the layout already confirmed the user is ADMIN via /api/admin/verify)
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = password.trim() === ADMIN_MASTER_PASSWORD.trim();

    if (!isValid) {
      console.log(`[SECURITY] Wrong admin password attempt by: ${session.user.email}`);
      return NextResponse.json(
        { success: false, error: "Invalid admin password. Try again." },
        { status: 401 }
      );
    }

    console.log(`[SECURITY] Admin password verified for: ${session.user.email}`);
    return NextResponse.json({
      success: true,
      message: "Password verified — proceed to mathematical challenge",
    });
  } catch (error) {
    console.error("verify-password error:", error);
    return NextResponse.json(
      { error: "Server error during password verification" },
      { status: 500 }
    );
  }
}