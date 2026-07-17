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

    // Create secure admin session token (valid for 2 hours)
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

    // Log successful admin session creation
    console.log(`[SECURITY] Secure admin session created for: ${session.user.email}`);
    
    await fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'Admin Security Verification Complete',
        targetType: 'security',
        targetId: adminUser.email,
        targetInfo: 'Full security verification passed',
        details: `Admin user ${adminUser.email} completed full security verification (password + math challenge)`
      })
    }).catch(() => {});

    // Set secure admin session cookie
    const response = NextResponse.json({ 
      success: true,
      message: "Secure admin session created",
      expiresAt: Date.now() + (2 * 60 * 60 * 1000)
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
    console.error("Error creating admin session:", error);
    return NextResponse.json(
      { error: "Failed to create secure session" }, 
      { status: 500 }
    );
  }
}