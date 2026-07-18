"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Shield,
  LogOut,
  Menu,
  X,
  Building2,
  CreditCard,
  TrendingUp,
  Car,
  Users,
  ClipboardList,
  ChevronRight,
  Bell,
  Zap,
  Activity,
} from "lucide-react";
import AdminSecurityVerification from "./components/AdminSecurityVerification";

const adminNav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Payment Proofs", href: "/admin/payment-proofs", icon: CheckCircle2 },
  { label: "Pending Withdrawals", href: "/admin/withdrawals", icon: TrendingUp },
  { label: "KYC Verification", href: "/admin/kyc", icon: Shield },
  { label: "Investment Payments", href: "/admin/investment-payments", icon: Activity },
  { label: "VIP Purchases", href: "/admin/vip-purchases", icon: CreditCard },
  { label: "Car Orders", href: "/admin/car-orders", icon: Car },
  { label: "Real Estate", href: "/admin/real-estate-requests", icon: Building2 },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Transaction Logs", href: "/admin/transactions", icon: ClipboardList },
  { label: "Admin Logs", href: "/admin/logs", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notAdmin, setNotAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [requiresSecurityCheck, setRequiresSecurityCheck] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user?.email) {
      verifyAdminAccess();
    }
  }, [session, status]);

  // Countdown refresh: re-verify session near expiry
  useEffect(() => {
    if (!sessionExpiresAt) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const msLeft = sessionExpiresAt - Date.now();
    if (msLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecurityVerified(false);
        setRequiresSecurityCheck(true);
      }, msLeft);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [sessionExpiresAt]);

  const verifyAdminAccess = async () => {
    try {
      // Step 1: Verify user has ADMIN role in DB
      // Only redirect to /dashboard if we CONFIRM they are not an admin
      let isAdminUser = false;
      try {
        const verifyRes = await fetch("/api/admin/verify");
        const verifyData = await verifyRes.json();
        isAdminUser = verifyData.isAdmin === true;
      } catch {
        // Network error on role check — show gate, don't redirect
        setIsAdmin(true);
        setSecurityVerified(false);
        setRequiresSecurityCheck(true);
        setLoading(false);
        return;
      }

      if (!isAdminUser) {
        // Don't redirect — show a proper "not admin" screen with sign-out button
        setNotAdmin(true);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Step 2: Check math/security session cookie — isolated so errors
      // show the gate instead of bouncing the admin away
      try {
        const sessionRes = await fetch("/api/admin/security/verify-session");
        const sessionData = await sessionRes.json();

        if (sessionData.verified === true) {
          setSecurityVerified(true);
          setRequiresSecurityCheck(false);
          if (sessionData.sessionExpiresAt) {
            setSessionExpiresAt(sessionData.sessionExpiresAt);
          }
        } else {
          // 403 / no token / expired → show the math security gate
          setSecurityVerified(false);
          setRequiresSecurityCheck(true);
        }
      } catch {
        // Any error checking the session → default to showing the gate
        setSecurityVerified(false);
        setRequiresSecurityCheck(true);
      }
    } catch (error) {
      console.error("Unexpected error in verifyAdminAccess:", error);
      setNotAdmin(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending items count for badge
  useEffect(() => {
    if (!securityVerified) return;
    const fetchPending = async () => {
      try {
        const [d, w, k] = await Promise.all([
          fetch("/api/admin/deposits/approve").then(r => r.ok ? r.json() : { count: 0 }),
          fetch("/api/admin/withdrawals/approve").then(r => r.ok ? r.json() : { count: 0 }),
          fetch("/api/admin/kyc/pending").then(r => r.ok ? r.json() : { count: 0 }),
        ]);
        setPendingCount((d.count ?? 0) + (w.count ?? 0) + (k.count ?? 0));
      } catch { /* ignore */ }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [securityVerified]);

  const handleSecurityVerified = () => {
    // Directly grant access — do NOT call verifyAdminAccess() again.
    // Re-running it would hit the DB and potentially reset verified state if DB is flaky.
    setSecurityVerified(true);
    setRequiresSecurityCheck(false);
    setIsAdmin(true);
    setLoading(false);
  };

  const handleSecurityFailed = () => {
    // Show access denied rather than routing away (which can cause login redirect loops)
    setNotAdmin(true);
    setLoading(false);
  };

  const isActive = (item: typeof adminNav[0]) => {
    if (!pathname) return false;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-red-900/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <Shield className="absolute inset-0 m-auto w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">
            Verifying Admin Access
          </p>
        </div>
      </div>
    );
  }

  // ─── Security Verification Gate ──────────────────────────
  if (isAdmin && (requiresSecurityCheck || !securityVerified)) {
    return (
      <AdminSecurityVerification
        onVerified={handleSecurityVerified}
        onFailed={handleSecurityFailed}
      />
    );
  }

  // ─── Not Authorized Screen ────────────────────────────────
  if (notAdmin) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div
            className="bg-[#111] rounded-2xl border border-red-900/40 p-8 space-y-6"
            style={{ boxShadow: "0 0 60px rgba(220,38,38,0.1)" }}
          >
            <div className="h-1 -mt-8 -mx-8 mb-8 bg-gradient-to-r from-red-900 via-red-600 to-red-900 rounded-t-2xl" />
            <div className="w-16 h-16 bg-red-950/60 border border-red-800/40 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Access Denied</h2>
              <p className="text-gray-500 text-sm mt-2">
                The account <span className="text-gray-300 font-medium">{session?.user?.email}</span> does not have admin privileges.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Please sign out and log in with <span className="text-red-400 font-mono">admin@teslacapx.com</span>
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center justify-center gap-2 py-3 px-5
                  bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800
                  text-white text-sm font-bold rounded-xl transition-all duration-200
                  shadow-lg shadow-red-900/50 border border-red-700/40"
              >
                <LogOut size={16} />
                Sign Out &amp; Switch Account
              </button>
              <Link
                href="/dashboard"
                className="block w-full py-2.5 px-5 rounded-xl border border-white/10
                  text-gray-400 hover:text-white text-sm text-center transition-colors"
              >
                Go to User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || !securityVerified) return null;

  // ─── Main Admin Layout ────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* ── Mobile Overlay ─────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:relative z-40 h-full flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-72"}
          bg-[#111111] border-r border-red-900/30
        `}
        style={{ boxShadow: "4px 0 30px rgba(220, 38, 38, 0.08)" }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-red-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/50">
                <Shield size={18} className="text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#111] animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">CAPX ADMIN</h1>
              <p className="text-[10px] text-red-400 font-medium tracking-widest">SECURE PANEL</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pending Badge Banner */}
        {pendingCount > 0 && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center gap-2">
            <Bell size={13} className="text-red-400 animate-pulse" />
            <span className="text-xs text-red-300 font-medium">
              {pendingCount} item{pendingCount !== 1 ? "s" : ""} need attention
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-red-900/40">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${active
                    ? "bg-gradient-to-r from-red-700/30 to-red-900/10 text-white border border-red-700/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-500 rounded-full" />
                )}
                <Icon
                  size={16}
                  className={`flex-shrink-0 transition-colors ${active ? "text-red-400" : "text-gray-500 group-hover:text-red-400"}`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {active && <ChevronRight size={14} className="text-red-500 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Session Footer */}
        <div className="p-4 border-t border-red-900/30 space-y-3">
          {sessionExpiresAt && (
            <div className="px-3 py-2 rounded-lg bg-yellow-950/40 border border-yellow-800/30 flex items-center gap-2">
              <Zap size={12} className="text-yellow-500" />
              <span className="text-[11px] text-yellow-400">
                Session: {new Date(sessionExpiresAt).toLocaleTimeString()}
              </span>
            </div>
          )}

          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Logged in as</p>
            <p className="text-xs text-gray-200 font-medium truncate">{session?.user?.email}</p>
          </div>

          <button
            onClick={() => {
              fetch("/api/admin/security/logout", { method: "POST" }).finally(() => {
                window.location.href = "/api/auth/signout";
              });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
              bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800
              text-white text-sm font-semibold rounded-xl transition-all duration-200
              shadow-lg shadow-red-900/40 hover:shadow-red-700/40"
          >
            <LogOut size={15} />
            Secure Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#111111] border-b border-red-900/30 px-4 md:px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <span className="text-gray-500">Admin</span>
              <ChevronRight size={14} className="text-gray-600" />
              <span className="text-white font-medium">
                {adminNav.find(n => isActive(n))?.label ?? "Panel"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-950/40 border border-green-800/30">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] text-green-400 font-medium">Live</span>
            </div>

            {/* Pending Alerts */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-800/40">
                <Bell size={14} className="text-red-400" />
                <span className="text-[11px] text-red-400 font-semibold">{pendingCount} Pending</span>
              </div>
            )}

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-red-900/40">
              {session?.user?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#0a0a0a]">
          <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
