"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // Clear demo mode
    try {
      localStorage.removeItem("_demo_loggedin");
    } catch {}
    
    // Sign out from NextAuth
    signOut({ redirect: true, callbackUrl: "/login?message=signedout" });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Signing you out...</p>
      </div>
    </div>
  );
}
