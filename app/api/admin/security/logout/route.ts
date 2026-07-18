import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
      // Log admin logout
      console.log(`[SECURITY] Admin secure logout: ${session.user.email}`);
      
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Admin Secure Logout',
          targetType: 'security',
          targetId: session.user.email,
          targetInfo: 'Admin session terminated',
          details: `Admin user ${session.user.email} performed secure logout`
        })
      }).catch(() => {});
    }

    // Clear admin security session cookie
    const response = NextResponse.json({ success: true, message: "Secure logout successful" });
    
    response.cookies.set('admin-security-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
      path: '/'    // Must match the path the cookie was set with
    });

    return response;

  } catch (error) {
    console.error("Error during admin logout:", error);
    return NextResponse.json(
      { error: "Logout failed" }, 
      { status: 500 }
    );
  }
}