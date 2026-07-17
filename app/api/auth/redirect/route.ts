import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('[AUTH REDIRECT] Session check:', {
      hasSession: !!session,
      email: session?.user?.email,
      timestamp: new Date().toISOString()
    });
    
    if (!session?.user?.email) {
      console.log('[AUTH REDIRECT] No session found, redirecting to login');
      return NextResponse.json({ 
        redirect: "/login",
        message: "Not authenticated" 
      });
    }

    // Check user role in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        role: true, 
        email: true,
        name: true 
      },
    });

    if (!user) {
      return NextResponse.json({ 
        redirect: "/login",
        message: "User not found" 
      });
    }

    // Check if user is suspended
    if (user.role === 'SUSPENDED') {
      return NextResponse.json({ 
        redirect: "/login?error=suspended",
        message: "Account suspended" 
      });
    }

    // Redirect based on role
    if (user.role === 'ADMIN') {
      console.log(`[AUTH REDIRECT] Admin detected: ${user.email} → /admin (direct)`);
      return NextResponse.json({ 
        redirect: "/admin",
        role: "admin",
        message: `Admin login successful: ${user.name || user.email}. Redirecting to admin dashboard.` 
      });
    } else {
      console.log(`[AUTH REDIRECT] User login redirect: ${user.email} → /dashboard`);
      return NextResponse.json({ 
        redirect: "/dashboard",
        role: "user", 
        message: `Welcome ${user.name || user.email}` 
      });
    }

  } catch (error) {
    console.error("Error in auth redirect:", error);
    return NextResponse.json({ 
      redirect: "/dashboard",
      message: "Redirect error, defaulting to dashboard" 
    });
  }
}