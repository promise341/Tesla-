import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "ultra-secure-admin-secret-2024";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required", verified: false }, { status: 401 });
    }

    // Verify user is admin in database
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, email: true, name: true, id: true },
    });

    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied", verified: false }, { status: 403 });
    }

    // Check for secure admin session token
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin-security-token')?.value;

    if (!adminToken) {
      return NextResponse.json({ 
        error: "Security verification required", 
        verified: false,
        requiresSecurityCheck: true 
      }, { status: 403 });
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(adminToken, ADMIN_JWT_SECRET) as any;
      
      // Check if token is for the current user
      if (decoded.email !== session.user.email || decoded.role !== 'ADMIN') {
        return NextResponse.json({ 
          error: "Invalid security token", 
          verified: false,
          requiresSecurityCheck: true 
        }, { status: 403 });
      }

      // Check if token is still valid (not expired)
      if (decoded.expiresAt && Date.now() > decoded.expiresAt) {
        return NextResponse.json({ 
          error: "Security session expired", 
          verified: false,
          requiresSecurityCheck: true 
        }, { status: 403 });
      }

      return NextResponse.json({ 
        success: true,
        verified: true,
        adminUser: {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        },
        sessionExpiresAt: decoded.expiresAt
      });

    } catch (jwtError) {
      console.log(`[SECURITY] Invalid admin JWT token for: ${session.user.email}`);
      return NextResponse.json({ 
        error: "Invalid security token", 
        verified: false,
        requiresSecurityCheck: true 
      }, { status: 403 });
    }

  } catch (error) {
    console.error("Error verifying admin session:", error);
    return NextResponse.json(
      { error: "Security verification failed", verified: false }, 
      { status: 500 }
    );
  }
}