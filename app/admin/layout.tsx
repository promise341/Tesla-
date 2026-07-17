"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  XCircle,
  Shield,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import AdminSecurityVerification from "./components/AdminSecurityVerification";

const adminNav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Real Estate Requests", href: "/admin/real-estate-requests", icon: Building2 },
  { label: "Payment Proofs", href: "/admin/payment-proofs", icon: CheckCircle2 },
  { label: "Pending Withdrawals", href: "/admin/withdrawals", icon: CheckCircle2 },
  { label: "User Management", href: "/admin/users", icon: Shield },
  { label: "KYC Verification", href: "/admin/kyc", icon: Shield },
  { label: "Transaction Logs", href: "/admin/transactions", icon: FileText },
  { label: "Admin Logs", href: "/admin/logs", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [requiresSecurityCheck, setRequiresSecurityCheck] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.email) {
      // Simple admin verification without security check
      verifyAdminAccess();
    }
  }, [session, status, router]);

  const verifyAdminAccess = async () => {
    try {
      const response = await fetch("/api/admin/verify");
      const data = await response.json();
      
      if (data.isAdmin) {
        setIsAdmin(true);
        setSecurityVerified(true); // Bypass security verification
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error('Error verifying admin access:', error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityVerified = () => {
    setSecurityVerified(true);
    setRequiresSecurityCheck(false);
    // Refresh session info
    verifyAdminAccess();
  };

  const handleSecurityFailed = () => {
    router.push("/dashboard");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show security verification if required
  if (isAdmin && (requiresSecurityCheck || !securityVerified)) {
    return (
      <AdminSecurityVerification
        onVerified={handleSecurityVerified}
        onFailed={handleSecurityFailed}
      />
    );
  }

  // If not admin at all, don't render anything (router will redirect)
  if (!isAdmin || !securityVerified) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0 md:w-64"
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield size={24} className="text-primary-500" />
            Admin Panel
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          {/* Security Session Timer */}
          {sessionExpiresAt && (
            <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-600 rounded text-xs text-yellow-400">
              <div className="flex items-center gap-1 mb-1">
                <Shield size={12} />
                <span>Security Session</span>
              </div>
              <div>
                Expires: {new Date(sessionExpiresAt).toLocaleTimeString()}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-400 mb-3">
            Logged in as: <strong>{session?.user?.email}</strong>
          </div>
          <button
            onClick={() => {
              // Clear admin security session
              fetch('/api/admin/security/logout', { method: 'POST' })
                .finally(() => {
                  window.location.href = "/api/auth/signout";
                });
            }}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Secure Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between md:hidden">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
