import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// SECURE ADMIN PASSWORD - Change this to your desired password
const ADMIN_MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || "TeslaCapX@Admin2024!";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify user is admin in database
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, email: true, name: true },
    });

    if (adminUser?.role !== "ADMIN") {
      // Log unauthorized access attempt
      console.log(`[SECURITY] Unauthorized admin access attempt by: ${session.user.email}`);
      
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Unauthorized Admin Access Attempt',
          targetType: 'security',
          targetId: session.user.email,
          targetInfo: 'Failed admin panel access',
          details: `User ${session.user.email} attempted to access admin panel without admin role`
        })
      }).catch(() => {});

      return NextResponse.json({ error: "Access denied - Admin privileges required" }, { status: 403 });
    }

    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Check against master admin password
    const isValidPassword = password === ADMIN_MASTER_PASSWORD;

    if (!isValidPassword) {
      // Log failed password attempt
      console.log(`[SECURITY] Failed admin password attempt by: ${session.user.email}`);
      
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Failed Admin Password Verification',
          targetType: 'security',
          targetId: session.user.email,
          targetInfo: 'Invalid admin password',
          details: `Admin user ${session.user.email} provided incorrect master password`
        })
      }).catch(() => {});

      return NextResponse.json({ 
        error: "Invalid admin password" 
      }, { status: 401 });
    }

    // Log successful password verification
    console.log(`[SECURITY] Admin password verified for: ${session.user.email}`);
    
    await fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'Admin Password Verified',
        targetType: 'security',
        targetId: session.user.email,
        targetInfo: 'Password verification successful',
        details: `Admin user ${session.user.email} successfully verified master password`
      })
    }).catch(() => {});

    return NextResponse.json({ 
      success: true,
      message: "Password verified - proceed to mathematical challenge"
    });

  } catch (error) {
    console.error("Error verifying admin password:", error);
    return NextResponse.json(
      { error: "Security verification failed" }, 
      { status: 500 }
    );
  }
}