import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "ultra-secure-admin-secret-2024";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, email: true, name: true, id: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create admin session token (bypass security verification for testing)
    const adminSessionToken = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: 'ADMIN',
        securityVerified: true,
        issuedAt: Date.now(),
        expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      },
      ADMIN_JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log(`[ADMIN BYPASS] Admin session created for: ${session.user.email}`);

    // Set secure admin session cookie
    const response = NextResponse.json({ 
      success: true,
      message: "Admin session created (security bypassed for testing)",
      redirect: "/admin"
    });

    response.cookies.set('admin-security-token', adminSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      path: '/admin'
    });

    return response;

  } catch (error) {
    console.error("Error creating admin bypass session:", error);
    return NextResponse.json(
      { error: "Failed to create admin session" }, 
      { status: 500 }
    );
  }
}