"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, username }),
      });

      setLoading(false);

      if (res.ok) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setError(data?.error || "Registration failed");
    } catch (err) {
      setLoading(false);
      setError("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Create your account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Register to access your Tesla-CapX dashboard.</p>

          {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border px-4 py-2 bg-gray-50 dark:bg-gray-900" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border px-4 py-2 bg-gray-50 dark:bg-gray-900" placeholder="Choose a username" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border px-4 py-2 bg-gray-50 dark:bg-gray-900" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-xl border px-4 py-2 bg-gray-50 dark:bg-gray-900" placeholder="Create a password" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary-500 text-white font-bold">
              {loading ? "Registering..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">Already have an account? <Link href="/login" className="text-primary-500 font-semibold">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
