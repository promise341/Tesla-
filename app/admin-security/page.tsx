"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminSecurityVerification from "../admin/components/AdminSecurityVerification";

export default function AdminSecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('[ADMIN SECURITY] Page loaded, session status:', status);
    console.log('[ADMIN SECURITY] Session data:', session);
    
    if (status === "unauthenticated") {
      console.log('[ADMIN SECURITY] Not authenticated, redirecting to login');
      router.push("/login");
    }
  }, [session, status, router]);

  const handleSecurityVerified = () => {
    console.log('[ADMIN SECURITY] Security verification successful, redirecting to admin dashboard');
    router.push("/admin");
  };

  const handleSecurityFailed = () => {
    console.log('[ADMIN SECURITY] Security verification failed, redirecting to dashboard');
    router.push("/dashboard");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show the security verification component directly
  return (
    <div>
      <AdminSecurityVerification
        onVerified={handleSecurityVerified}
        onFailed={handleSecurityFailed}
      />
    </div>
  );
}