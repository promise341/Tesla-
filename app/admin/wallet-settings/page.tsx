"use client";

import { useState, useEffect } from "react";
import { Wallet, Copy, Check, Save, ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { PAYMENT_WALLETS } from "@/lib/payment-config";

export default function AdminWalletSettingsPage() {
  const [wallets, setWallets] = useState({
    BTC: PAYMENT_WALLETS.BTC,
    ETH: PAYMENT_WALLETS.ETH,
    USDT_TRX: PAYMENT_WALLETS.USDT_TRC20,
    BNB: PAYMENT_WALLETS.BNB_BSC,
    XRP: PAYMENT_WALLETS.XRP,
    DOGE: PAYMENT_WALLETS.DOGE,
    SOLANA: PAYMENT_WALLETS.SOLANA,
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/wallet-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.wallets) {
          setWallets(data.wallets);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  function copyAddress(key: string, address: string) {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Wallet className="text-red-500" size={28} /> Deposit Crypto Wallets Config
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            View verified official deposit cryptocurrency wallet addresses configured across all user deposit portals.
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-semibold ${
          feedback.type === "success"
            ? "bg-green-950/60 border-green-800/50 text-green-300"
            : "bg-red-950/60 border-red-800/50 text-red-300"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Wallet Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: "BTC", name: "Bitcoin (BTC)", network: "Bitcoin Network", color: "border-orange-500/40 bg-orange-950/10", icon: "₿", address: wallets.BTC },
          { key: "ETH", name: "Ethereum (ETH)", network: "Ethereum Network", color: "border-blue-500/40 bg-blue-950/10", icon: "Ξ", address: wallets.ETH },
          { key: "USDT_TRX", name: "Tether (USDT-TRC20)", network: "Tron Network", color: "border-red-500/40 bg-red-950/10", icon: "₮", address: wallets.USDT_TRX },
          { key: "BNB", name: "Binance Coin (BNB-BSC)", network: "BSC Network", color: "border-yellow-500/40 bg-yellow-950/10", icon: "◆", address: wallets.BNB },
          { key: "XRP", name: "Ripple (XRP)", network: "XRP Network", color: "border-cyan-500/40 bg-cyan-950/10", icon: "✕", address: wallets.XRP },
          { key: "DOGE", name: "Dogecoin (DOGE)", network: "Dogecoin Network", color: "border-amber-500/40 bg-amber-950/10", icon: "Ð", address: wallets.DOGE },
          { key: "SOLANA", name: "Solana (SOL)", network: "Solana Network", color: "border-purple-500/40 bg-purple-950/10", icon: "◎", address: wallets.SOLANA },
        ].map((w) => (
          <div key={w.key} className={`rounded-3xl border ${w.color} p-6 space-y-4 shadow-xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-lg font-black text-white">
                  {w.icon}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{w.name}</h3>
                  <p className="text-xs text-gray-400">{w.network}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-green-950/80 border border-green-800/60 text-green-400 text-[10px] font-black tracking-wider uppercase">
                ACTIVE
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                Deposit Wallet Address
              </label>
              <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl p-3">
                <span className="font-mono text-xs text-white break-all flex-1 font-bold">
                  {w.address}
                </span>
                <button
                  onClick={() => copyAddress(w.key, w.address)}
                  className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copiedKey === w.key ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
