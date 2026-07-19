"use client";

import { useState, useEffect } from "react";
import AlertToast from "@/components/AlertToast";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import LanguageSelector from "./LanguageSelector";
import NotificationBell from "./components/NotificationBell";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Car,
  CreditCard,
  Gift,
  BarChart2,
  Wallet,
  ChevronDown,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Zap,
  LogOut,
  Menu,
  X,
  CircleDot,
  User as UserIcon,
  ReceiptText,
  HelpCircle,
  PlusCircle,
  MinusCircle,
  LineChart,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Account Statement", href: "/dashboard/account", icon: FileText },
  {
    label: "Investments",
    icon: TrendingUp,
    children: [
      { label: "All Plans", href: "/dashboard/buy-plan" },
      { label: "Stock Market", href: "/dashboard/stock-plans" },
      { label: "Cryptocurrency", href: "/dashboard/crypto-plans" },
      { label: "Real Estate", href: "/dashboard/real-estate-plans" },
      { label: "My Portfolio", href: "/dashboard/investments" },
      { label: "Performance History", href: "/dashboard/trading-history" },
    ],
  },
  {
    label: "Car Inventory",
    icon: Car,
    children: [
      { label: "Browse Cars", href: "/dashboard/inventory" },
      { label: "My Orders", href: "/dashboard/inventory/orders" },
    ],
  },
  {
    label: "VIP Cards",
    icon: CreditCard,
    children: [
      { label: "Browse Cards",    href: "/dashboard/vip" },
      { label: "My Memberships",  href: "/dashboard/vip/my-memberships" },
    ],
  },
  {
    label: "Giveaways",
    icon: Gift,
    children: [
      { label: "Browse Giveaways", href: "/dashboard/giveaways" },
      { label: "My Entries",       href: "/dashboard/giveaways/my-entries" },
    ],
  },
  {
    label: "Trading",
    icon: BarChart2,
    children: [
      { label: "Live Markets", href: "/dashboard/trading" },
      { label: "Copy Trading", href: "/dashboard/copy/dashboard" },
      { label: "AI Trading Bots", href: "/dashboard/bot-trading" },
    ],
  },
  {
    label: "Wallet & Finance",
    icon: Wallet,
    children: [
      { label: "Overview",          href: "/dashboard/wallet" },
      { label: "Deposit",           href: "/dashboard/wallet/deposit" },
      { label: "Withdraw",          href: "/dashboard/wallet/withdraw" },
      { label: "Internal Transfer", href: "/dashboard/wallet/transfer" },
      { label: "Transactions",      href: "/dashboard/wallet/transactions" },
    ],
  },
  {
    label: "Account",
    icon: UserIcon,
    children: [
      { label: "Profile Settings",  href: "/dashboard/account-settings" },
      { label: "Verify Identity",   href: "/dashboard/verify-account",  badge: "Required" },
      { label: "Referral Program",  href: "/dashboard/referral" },
      { label: "Support Center",    href: "/dashboard/support" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [btc] = useState("$63,900");
  const [eth] = useState("$1,790");
  const [userBalance, setUserBalance] = useState("$0.00");
  const [userAvatar,  setUserAvatar]  = useState<string | null>(null);
  const [liveName,    setLiveName]    = useState("");
  const [hasSubscribedToGeneral, setHasSubscribedToGeneral] = useState(false);
  const [kycStatus,   setKycStatus]   = useState("UNVERIFIED");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Fetch real balance + avatar + name whenever route changes
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        // Check if user is suspended
        if (data?.suspended) {
          alert(data.message || "Your account has been suspended. Please contact support.");
          signOut({ callbackUrl: '/login?message=signedout' });
          return;
        }
        
        if (data?.balance !== undefined) {
          const fmt = "$" + Number(data.balance).toLocaleString(undefined, { minimumFractionDigits: 2 });
          setUserBalance(fmt);
        }
        if (data?.avatar) setUserAvatar(data.avatar);
        else setUserAvatar(null);
        if (data?.name) setLiveName(data.name);
        if (data?.kycStatus) setKycStatus(data.kycStatus);
      })
      .catch(() => {});

    // Fetch active plans to see if user has subscribed to any general/all plans
    fetch("/api/plans")
      .then((r) => r.json())
      .then((plans) => {
        if (Array.isArray(plans)) {
          // User unlocks advanced sections once they have ANY active plan
          const subbed = plans.some((p) => p.status === "ACTIVE" || p.status === "COMPLETED");
          setHasSubscribedToGeneral(subbed);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Close mobile sidebar on route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Support updating user states via custom window events
  useEffect(() => {
    function handleSync() {
      fetch("/api/user/me")
        .then((r) => r.json())
        .then((data) => {
          if (data?.balance !== undefined) {
            setUserBalance("$" + Number(data.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }));
          }
          if (data?.avatar) setUserAvatar(data.avatar);
          else setUserAvatar(null);
          if (data?.name) setLiveName(data.name);
          if (data?.kycStatus) setKycStatus(data.kycStatus);
        })
        .catch(() => {});
    }
    window.addEventListener("balance-updated", handleSync);
    window.addEventListener("avatar-updated", handleSync);
    window.addEventListener("kyc-updated", handleSync);
    return () => {
      window.removeEventListener("balance-updated", handleSync);
      window.removeEventListener("avatar-updated", handleSync);
      window.removeEventListener("kyc-updated", handleSync);
    };
  }, []);

  // Auto-expand the menu group that contains the current path
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const active = item.children.some(
          (c) => pathname === c.href || (pathname ?? "").startsWith(c.href + "/")
        );
        if (active) setOpenMenus((prev) => Array.from(new Set([...prev, item.label])));
      }
    });
  }, [pathname]);

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  function handleSignOut() {
    setUserMenuOpen(false);
    try { localStorage.removeItem("_demo_loggedin"); } catch {}
    signOut({ callbackUrl: "/login?message=signedout" });
  }

  // Use live name from API (reflects any name changes), fall back to session
  const userName    = liveName || session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (children: { href: string }[]) =>
    children.some((c) => pathname === c.href || (pathname ?? "").startsWith(c.href + "/"));

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <img src="/images/Tesla.jpg" alt="Logo" className="h-8 w-auto rounded-md" />
          <span className="text-lg font-black tracking-widest text-gray-900 dark:text-white">
            TESLA<span className="text-primary-500">-CAPX</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 transition-colors"
          title="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Live Market indicator */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Live Market</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const open = openMenus.includes(item.label);
            const groupActive = isGroupActive(item.children);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors mb-0.5 ${
                    groupActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </div>
                  {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {open && (
                  <div className="ml-8 mb-1 space-y-0.5">
                    {item.children
                      .filter((child) => {
                        if (["/dashboard/stock-plans", "/dashboard/crypto-plans", "/dashboard/real-estate-plans"].includes(child.href)) {
                          return hasSubscribedToGeneral;
                        }
                        return true;
                      })
                      .map((child) => {
                        let badgeText = child.badge;
                        let badgeColor = "bg-primary-500 text-white";
                        if (child.href === "/dashboard/verify-account") {
                          if (kycStatus === "VERIFIED") {
                            badgeText = "Verified";
                            badgeColor = "bg-green-500 text-white";
                          } else if (kycStatus === "PENDING") {
                            badgeText = "Pending";
                            badgeColor = "bg-yellow-500 text-gray-900";
                          } else if (kycStatus === "REJECTED") {
                            badgeText = "Rejected";
                            badgeColor = "bg-red-500 text-white";
                          } else {
                            badgeText = "Required";
                            badgeColor = "bg-red-650 text-white animate-pulse";
                          }
                        }

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              isActive(child.href)
                                ? "bg-primary-500 text-white"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            <span>{child.label}</span>
                            {badgeText && (
                              <span className={`ml-2 px-1.5 py-0.5 text-[9px] font-black rounded-full leading-none ${badgeColor}`}>
                                {badgeText}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors mb-0.5 ${
                isActive(item.href!)
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {isActive(item.href!) && <CircleDot size={8} className="ml-auto text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* Language Selector */}
      <LanguageSelector />

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3 flex items-center justify-between gap-4">

          {/* Left: mobile menu + live prices */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
              title="Open menu"
            >
              <Menu size={20} className="text-gray-600 dark:text-gray-300" />
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-gray-500 dark:text-gray-400">LIVE</span>
              <span className="ml-2 text-gray-700 dark:text-gray-200">
                BTC: <span className="text-primary-500">{btc}</span>
              </span>
              <span className="ml-3 text-gray-700 dark:text-gray-200">
                ETH: <span className="text-primary-500">{eth}</span>
              </span>
            </div>
          </div>

          {/* Center: Account Balance pill */}
          <div className="hidden sm:flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Balance</span>
            <span className="text-lg font-black text-gray-900 dark:text-white leading-tight">
              {userBalance}
            </span>
          </div>

          {/* Right: Quick Trade, notifications, theme, avatar */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/wallet/deposit"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <Zap size={13} /> Quick Trade
            </Link>

            {/* Notifications — real live bell */}
            <div className="relative">
              <NotificationBell />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun size={18} className="text-gray-300" /> : <Moon size={18} className="text-gray-600" />}
            </button>

            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden">
                  {userAvatar
                    ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    : userInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{userName}</p>
                  <p className="text-[10px] text-gray-400">Trading Account</p>
                </div>
                <ChevronDown size={14} className="hidden sm:block text-gray-400" />
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* User info header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-black text-base flex-shrink-0 overflow-hidden">
                        {userAvatar
                          ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                          : userInitial}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{userBalance}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/dashboard/account-settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <UserIcon size={16} className="text-gray-400" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/dashboard/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ReceiptText size={16} className="text-gray-400" />
                        Account History
                      </Link>
                      <Link
                        href="/dashboard/support"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <HelpCircle size={16} className="text-gray-400" />
                        Support Center
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AlertToast />
          {children}
        </main>
      </div>
    </div>
  );
}
