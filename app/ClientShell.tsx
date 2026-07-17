"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Menu, X, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname ? pathname.startsWith("/dashboard") : false;
  const isAdmin = pathname ? pathname.startsWith("/admin") : false;
  const [loggedIn, setLoggedIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Check session status by calling the API (avoids useSession outside SessionProvider)
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.email) {
          setLoggedIn(true);
          setUserEmail(data.user.email);
          setUserName(data.user.name || data.user.email.split("@")[0]);
        } else {
          setLoggedIn(false);
        }
      })
      .catch(() => setLoggedIn(false));
  }, [pathname]);

  async function handleSignIn() {
    try {
      if (loggedIn) {
        const response = await fetch('/api/auth/redirect');
        const data = await response.json();
        router.push(data.redirect);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  }

  async function handleSignOut() {
    try {
      await signOut({ redirect: false });
      setLoggedIn(false);
      setUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans antialiased transition-colors duration-300 min-h-screen flex flex-col">
      {/* Ticker Bar Marquee */}
      <div className="bg-gray-900 dark:bg-black border-b border-gray-800 overflow-hidden py-2 text-xs text-gray-400 select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8 px-4 items-center">
              <span>TSLA <strong className="text-green-400">$250.45 (+3.2%)</strong></span>
              <span>BTC/USDT <strong className="text-green-400">$60,230.12 (+1.4%)</strong></span>
              <span>ETH/USDT <strong className="text-red-400">$3,450.80 (-0.8%)</strong></span>
              <span>AAPL <strong className="text-green-400">$189.20 (+1.1%)</strong></span>
              <span>MSFT <strong className="text-red-400">$420.50 (-0.5%)</strong></span>
              <span>NVDA <strong className="text-green-400">$875.10 (+5.6%)</strong></span>
              <span>DOGE <strong className="text-green-400">$0.15 (+12.4%)</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Global Navigation Header (hidden on dashboard and admin) */}
      {!isDashboard && !isAdmin && (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-xl font-extrabold tracking-widest text-gray-900 dark:text-white flex items-center gap-2.5"
                >
                  <img
                    src="/images/Tesla.jpg"
                    alt="Tesla-CapX Logo"
                    className="h-8 w-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 animate-logo-bounce select-none"
                  />
                  <span>
                    TESLA-<span className="text-primary-500">CAPX</span>
                  </span>
                </Link>
              </div>

              {/* Desktop Menu */}
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Home</Link>
                <Link href="/cars" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">EV Inventory</Link>
                <Link href="/#plans" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Investment Plans</Link>
                <Link href="/#markets" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Markets</Link>
              </nav>

              {/* Header Actions */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  aria-label="Toggle Theme"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {!loggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors gap-1.5"
                    >
                      <LogIn size={16} /> Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-lg transition-colors gap-1.5 shadow-md shadow-primary-500/10"
                    >
                      <UserPlus size={16} /> Get Started
                    </Link>
                  </>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold">{userName}</span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                        </div>
                        <button
                          onClick={() => { handleSignIn(); setUserMenuOpen(false); }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          Go to Dashboard
                        </button>
                        <button
                          onClick={() => { handleSignOut(); }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown Panel */}
          {mobileOpen && (
            <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-2 pb-4 space-y-2">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-500">Home</Link>
              <Link href="/cars" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-500">EV Inventory</Link>
              <Link href="/#plans" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-500">Investment Plans</Link>
              <Link href="/#markets" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-500">Markets</Link>
              <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2 flex gap-4">
                {!loggedIn ? (
                  <>
                    <button onClick={() => { handleSignIn(); setMobileOpen(false); }} className="flex-1 text-center py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300">Sign In</button>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-primary-500 text-white rounded-lg text-sm font-bold">Get Started</Link>
                  </>
                ) : (
                  <>
                    <button onClick={() => { handleSignIn(); setMobileOpen(false); }} className="flex-1 text-center py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300">Dashboard</button>
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="flex-1 text-center py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold">Sign Out</button>
                  </>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      {/* Dynamic Page Content */}
      <main className="flex-grow">{children}</main>

      {/* Global Footer */}
      <footer className="bg-gray-950 text-gray-400 border-t border-gray-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/Tesla.jpg" alt="Tesla-CapX Logo" className="h-7 w-auto rounded-md border border-gray-800" />
                <h3 className="text-white font-bold text-lg">TESLA-CAPX</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Join thousands of investors utilizing precision-engineered automated algorithms, stocks management, and EV vehicle trading workflows.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-primary-500 transition-colors">Home</Link></li>
                <li><Link href="/cars" className="hover:text-primary-500 transition-colors">EV Inventory</Link></li>
                <li><Link href="/#plans" className="hover:text-primary-500 transition-colors">Plans</Link></li>
                <li><Link href="/login" className="hover:text-primary-500 transition-colors">Access Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal & Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-500 transition-colors">Risk Disclaimer</a></li>
                <li><a href="mailto:support@teslacapx.com" className="hover:text-primary-500 transition-colors">support@teslacapx.com</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Regulatory Notice</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Financial trading involves risk. All plans provided on this portal are models. Tesla-CapX is an independent trading company operating in the UK.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 my-8 pt-8 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} Tesla-CapX. All rights reserved.
          </div>
        </div>
      </footer>
    </body>
  );
}
