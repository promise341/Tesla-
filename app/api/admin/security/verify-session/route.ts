import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || "ultra-secure-admin-secret-2024";

export async function GET() {
  try {
    // Must be logged in via NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required", verified: false },
        { status: 401 }
      );
    }

    // Check for the admin security cookie — NO database call needed
    const cookieStore = cookies();
    const adminToken = cookieStore.get("admin-security-token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        {
          error: "Security verification required",
          verified: false,
          requiresSecurityCheck: true,
        },
        { status: 403 }
      );
    }

    // Verify and decode the JWT
    try {
      const decoded = jwt.verify(adminToken, ADMIN_JWT_SECRET) as {
        email: string;
        role: string;
        expiresAt: number;
        securityVerified: boolean;
      };

      // Token must belong to the current logged-in user
      if (
        decoded.email !== session.user.email ||
        decoded.role !== "ADMIN" ||
        !decoded.securityVerified
      ) {
        return NextResponse.json(
          {
            error: "Invalid security token",
            verified: false,
            requiresSecurityCheck: true,
          },
          { status: 403 }
        );
      }

      // Check custom expiresAt field
      if (decoded.expiresAt && Date.now() > decoded.expiresAt) {
        return NextResponse.json(
          {
            error: "Security session expired",
            verified: false,
            requiresSecurityCheck: true,
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
        sessionExpiresAt: decoded.expiresAt,
      });
    } catch {
      // JWT invalid / tampered / expired
      return NextResponse.json(
        {
          error: "Invalid security token",
          verified: false,
          requiresSecurityCheck: true,
        },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("verify-session error:", error);
    return NextResponse.json(
      { error: "Security verification failed", verified: false },
      { status: 500 }
    );
  }
}