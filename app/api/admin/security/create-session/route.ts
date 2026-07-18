import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import jwt from "jsonwebtoken";

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || "ultra-secure-admin-secret-2024";

export async function POST(request: Request) {
  try {
    // Must be logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body?.challengeSolved) {
      return NextResponse.json(
        { error: "Challenge not solved" },
        { status: 400 }
      );
    }

    const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours from now

    // Create signed JWT — NO database call needed
    const token = jwt.sign(
      {
        email: session.user.email,
        role: "ADMIN",
        securityVerified: true,
        issuedAt: Date.now(),
        expiresAt,
      },
      ADMIN_JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log(`[SECURITY] Admin session created for: ${session.user.email}`);

    const response = NextResponse.json({
      success: true,
      message: "Secure admin session created",
      expiresAt,
    });

    // Set the cookie accessible to all routes
    response.cookies.set("admin-security-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60, // seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("create-session error:", error);
    return NextResponse.json(
      { error: "Failed to create secure session" },
      { status: 500 }
    );
  }
}