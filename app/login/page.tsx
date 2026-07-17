"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Zap, Shield, Fingerprint, ScanFace, QrCode, ShieldCheck, Award, Loader2 } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callback = params?.get("callbackUrl") || "/dashboard";
  const urlError = params?.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    // Show URL error on initial load if present
    if (urlError === "suspended") {
      return "Your account has been suspended. Please contact support.";
    }
    if (urlError) {
      return "Authentication failed. Please try again.";
    }
    return "";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      
      if (res && !res.error) {
        // Small delay for session to establish, then redirect
        await new Promise(r => setTimeout(r, 500));
        try {
          const redirectResponse = await fetch('/api/auth/redirect');
          const redirectData = await redirectResponse.json();
          
          if (redirectData.role === 'admin') {
            setError("🔐 Admin detected! Redirecting...");
          } else {
            setError("✅ Login successful - Redirecting...");
          }
          
          router.push(redirectData.redirect || "/dashboard");
        } catch {
          router.push("/dashboard");
        }
      } else {
        setError(res?.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden py-12 flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-lg">
        {/* Trading Login Card */}
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 sm:p-10 shadow-2xl transition-colors">
          <div className="relative">
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <img
                  src="https://teslacapx.com/storage/app/public/photos/HAq45OMWd5nUmcX2yNzNY6x5MURQeV0acUk6NB7X.jpg"
                  className="h-16 w-auto rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                  alt="Tesla-CapX Logo"
                />
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mb-2">Welcome Back</h1>
              <h2 className="text-lg font-bold mb-3"><span className="text-primary-500">Tesla-CapX</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Access your trading dashboard</p>

              {/* Trading Stats */}
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold">Live</span>
                  </div>
                  <div className="dark:text-gray-400">24/7 Markets</div>
                </div>
                <div className="w-px h-8 bg-gray-250 dark:bg-gray-700"></div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary-500 mb-1"><Zap size={12} /><span className="font-bold">Fast</span></div>
                  <div className="dark:text-gray-400">Execution</div>
                </div>
                <div className="w-px h-8 bg-gray-250 dark:bg-gray-700"></div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary-500 mb-1"><Shield size={12} /><span className="font-bold">Secure</span></div>
                  <div className="dark:text-gray-400">Platform</div>
                </div>
              </div>
            </div>

            {/* Error/Success Message */}
            {error && (
              <div className={`mb-4 p-3 border rounded-xl text-sm font-semibold ${
                error.includes('successful') || error.includes('✅') || error.includes('🔐')
                  ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                  : 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
              }`}>
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Email Address or Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-primary-500 transition-colors"><Mail size={18} /></div>
                  <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-12 pr-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-gray-50 dark:focus:bg-gray-800 transition-all text-sm font-semibold focus:outline-none" placeholder="your.email@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-primary-500 transition-colors"><Lock size={18} /></div>
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-12 pr-12 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-gray-50 dark:focus:bg-gray-800 transition-all text-sm font-semibold focus:outline-none" placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-primary-500 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500/20 transition-colors" />
                  <label htmlFor="remember" className="ml-2.5 text-gray-600 dark:text-gray-350 font-bold cursor-pointer select-none">Remember me</label>
                </div>
                <Link href="#" className="text-primary-500 hover:text-primary-400 font-bold transition-colors underline underline-offset-2">Forgot password?</Link>
              </div>

              <div className="mt-8">
                <button type="submit" disabled={loading} className="group relative flex w-full justify-center items-center gap-3 rounded-2xl bg-primary-500 hover:bg-primary-600 px-6 py-4 text-base font-black text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Verifying Credentials...</span></>) : (<><LogIn className="w-5 h-5" /><span>Access Dashboard</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div><div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-gray-800 px-4 text-gray-400 font-bold uppercase tracking-wider">Quick Access</span></div></div>
              <div className="mt-6 flex justify-center gap-4">
                {[{ icon: <Fingerprint size={24} className="text-primary-400" />, label: "Fingerprint" },{ icon: <ScanFace size={24} className="text-primary-400" />, label: "Face ID" },{ icon: <QrCode size={24} className="text-green-400" />, label: "QR Code" }].map((item, idx) => (<button key={idx} type="button" className="group relative inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-primary-400/50 transition-all shadow-md">{item.icon}</button>))}
              </div>
            </div>

            <div className="mt-10 text-center space-y-6">
              <div className="text-sm"><span className="text-gray-500 dark:text-gray-400 font-medium">New to trading? </span><Link href="/register" className="font-extrabold text-primary-500 hover:text-primary-450 transition-colors underline underline-offset-2">Create your account</Link></div>
              <div className="flex items-center justify-center gap-5 py-4 border-t border-gray-150 dark:border-gray-750 text-xs text-gray-500 dark:text-gray-400"><div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /><span>SSL Secured</span></div><div className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-primary-500" /><span>256-bit Encryption</span></div><div className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-primary-500" /><span>Regulated</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
