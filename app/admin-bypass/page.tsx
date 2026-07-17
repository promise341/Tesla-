"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, Zap } from "lucide-react";

export default function AdminBypassPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleBypassSecurity = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/admin/bypass-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("✅ Admin session created! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        setMessage(`❌ Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Bypass error:', error);
      setMessage("❌ Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Access Bypass
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Testing admin dashboard access
            </p>
          </div>

          {/* Session Info */}
          {session?.user && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Authenticated User
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Email:</strong> {session.user.email}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Name:</strong> {session.user.name || 'Not set'}
              </p>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">{message}</p>
            </div>
          )}

          {/* Bypass Button */}
          <button
            onClick={handleBypassSecurity}
            disabled={loading || !session?.user}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Creating Admin Session...' : 'Bypass Security & Access Admin Dashboard'}
          </button>

          {!session?.user && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                ⚠️ Please login first before using this bypass
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-md">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Instructions:</strong><br />
              1. Login with admin credentials first<br />
              2. Click the bypass button above<br />
              3. You'll be redirected to admin dashboard<br />
              4. This bypasses the AdminSecurityVerification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}