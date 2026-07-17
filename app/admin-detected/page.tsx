"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, ArrowRight, Clock } from "lucide-react";

export default function AdminDetectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.email) {
      verifyAdminAndRedirect();
    }
  }, [session, status]);

  const verifyAdminAndRedirect = async () => {
    try {
      const response = await fetch("/api/admin/verify");
      const data = await response.json();
      
      if (!data.isAdmin) {
        // Not an admin, redirect to regular dashboard
        router.push("/dashboard");
        return;
      }

      // Admin detected, show info and start countdown
      setAdminInfo({
        email: session?.user?.email,
        name: session?.user?.name || "Administrator",
        role: "ADMIN",
        detectedAt: new Date().toLocaleString()
      });

      // Start countdown and redirect to security verification
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/admin-security");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error verifying admin status:', error);
      router.push("/dashboard");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!adminInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-green-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-8 border-2 border-green-500">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
              🎉 Admin Detected Successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Administrator credentials verified
            </p>
          </div>

          {/* Admin Information */}
          <div className="space-y-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Admin Information
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="font-medium text-green-700 dark:text-green-300">{adminInfo.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium text-green-700 dark:text-green-300">{adminInfo.email}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="font-bold text-green-700 dark:text-green-300">ADMINISTRATOR</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Detected:</span>
                  <span className="font-medium text-green-700 dark:text-green-300">{adminInfo.detectedAt}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                <ArrowRight className="h-4 w-4 mr-2" />
                Next: Security Verification
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You will now proceed to the ultra-strong security verification system.
              </p>
            </div>
          </div>

          {/* Countdown and Progress */}
          <div className="text-center">
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                <span>Redirecting in {countdown} seconds...</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>

            {/* Manual Continue Button */}
            <button
              onClick={() => router.push("/admin-security")}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <Shield className="h-4 w-4 mr-2" />
              Continue to Security Verification
            </button>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Or wait for automatic redirect...
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="text-xs text-yellow-700 dark:text-yellow-400">
              <p className="font-medium mb-1">🔒 Enhanced Security Protocol</p>
              <p>
                As an administrator, you must complete additional security verification 
                including master password and mathematical challenge before accessing the admin dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}