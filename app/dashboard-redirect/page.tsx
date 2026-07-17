"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield, User, Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated, do smart redirect
    if (status === "authenticated") {
      smartRedirect();
    }
  }, [status, router]);

  const smartRedirect = async () => {
    try {
      const response = await fetch('/api/auth/redirect');
      const data = await response.json();
      
      console.log(`[DASHBOARD REDIRECT] Redirecting to: ${data.redirect}`);
      router.push(data.redirect);
    } catch (error) {
      console.error('Dashboard redirect error:', error);
      // Fallback to user dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {status === "loading" ? (
                <User className="w-6 h-6 text-primary-600" />
              ) : (
                <Shield className="w-6 h-6 text-primary-600" />
              )}
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {status === "loading" ? "Checking authentication..." : "Redirecting..."}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400">
          {status === "loading" 
            ? "Please wait while we verify your session"
            : "Taking you to the right dashboard based on your role"
          }
        </p>
        
        {status === "authenticated" && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            Welcome, {session?.user?.name || session?.user?.email}
          </div>
        )}
      </div>
    </div>
  );
}