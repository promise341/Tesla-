"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, Trophy, ArrowRight, Zap } from "lucide-react";

export default function AdminVerifiedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Start countdown and redirect to admin dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Force a full page reload to the admin dashboard to ensure clean state
          window.location.href = '/admin';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 border-2 border-green-400">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-24 w-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <Trophy className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              🎉 Security Verification Complete!
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Ultra-strong admin authentication successful
            </p>
          </div>

          {/* Admin Welcome */}
          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center justify-center">
                  <Shield className="h-6 w-6 mr-2" />
                  Welcome Administrator
                </h2>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>{session?.user?.name || "Administrator"}</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {session?.user?.email}
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 mt-2">
                    <Zap className="h-3 w-3 mr-1" />
                    FULL ADMIN ACCESS GRANTED
                  </div>
                </div>
              </div>
            </div>

            {/* Security Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Security Verification Complete
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Master Password ✓
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Math Challenge ✓
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  JWT Session ✓
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  2-Hour Access ✓
                </div>
              </div>
            </div>

            {/* Redirect Notice */}
            <div className="text-center">
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Redirecting to Admin Dashboard...
                </p>
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <ArrowRight className="h-6 w-6" />
                  <span>{countdown}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                <div 
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                ></div>
              </div>

              {/* Manual Continue */}
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full flex items-center justify-center py-4 px-6 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg"
              >
                <Shield className="h-5 w-5 mr-2" />
                Enter Admin Dashboard Now
              </button>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Or wait for automatic redirect...
              </p>
            </div>
          </div>

          {/* Admin Powers Notice */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-xs text-yellow-700 dark:text-yellow-400">
              <p className="font-medium mb-2">🔥 Admin Dashboard Access:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Approve/Reject deposits & withdrawals</li>
                <li>Activate/Deactivate user accounts</li>
                <li>Review KYC documents</li>
                <li>Monitor transactions & system logs</li>
                <li>Manage platform statistics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}