"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Gift, Copy, Users, DollarSign, Share2, CheckCircle2, TrendingUp, UserPlus, Loader2, Clock, Check } from "lucide-react";

interface ReferredFriend {
  id: string;
  username: string;
  joinedAt: string;
  kycStatus: "VERIFIED" | "PENDING" | "UNVERIFIED";
  reward: number;
  rewardStatus: "PAID" | "PENDING";
}

const mockReferrals: ReferredFriend[] = [
  { id: "1", username: "alex_jones", joinedAt: "2026-07-10T14:24:00Z", kycStatus: "VERIFIED", reward: 25.00, rewardStatus: "PAID" },
  { id: "2", username: "cryptoking", joinedAt: "2026-07-12T09:15:00Z", kycStatus: "PENDING", reward: 25.00, rewardStatus: "PENDING" },
  { id: "3", username: "marta_s",    joinedAt: "2026-07-15T18:40:00Z", kycStatus: "UNVERIFIED", reward: 0.00, rewardStatus: "PENDING" },
];

export default function ReferralPage() {
  const [username, setUsername]   = useState("");
  const [loading,  setLoading]    = useState(true);
  const [copied,   setCopied]     = useState(false);

  useEffect(() => {
    fetch("/api/user/me").then(r => r.json()).then(d => {
      if (d?.username) setUsername(d.username);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://teslacapx.com";
  const referralLink = username ? `${origin}/register?ref=${username}` : "";

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 3000);
    });
  }

  const STEPS = [
    { num:"1", title:"Share Your Link",   desc:"Copy your unique referral link and share it with friends or on social media." },
    { num:"2", title:"Friend Signs Up",   desc:"Your friend creates an account using your referral link and completes registration." },
    { num:"3", title:"First Deposit",     desc:"Your friend makes their first deposit and starts investing on the platform." },
    { num:"4", title:"Both Earn Rewards", desc:"You both receive a bonus credited directly to your balances automatically." },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Referral Program</h1>
        <p className="text-sm text-gray-400 mt-0.5">Invite friends and earn rewards together</p>
      </div>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#b91c1c 0%,#E31937 50%,#991b1b 100%)" }}>
        <div className="px-8 py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-white"/>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Invite Friends, Earn Together</h2>
          <p className="text-white/80 text-sm max-w-md mx-auto leading-relaxed">
            Share your referral link. When your friend signs up and makes their first deposit, you both earn a bonus.
          </p>
          <div className="flex items-center justify-center gap-8 mt-6">
            {[
              { label:"Earn per referral", value:"5% Bonus" },
              { label:"Friend gets",       value:"$25 Credit" },
              { label:"No limit",          value:"Unlimited" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-[10px] text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Total Referrals",  value: mockReferrals.length.toString(), icon:<Users size={20} className="text-primary-500"/>,   bg:"bg-red-50 dark:bg-red-900/20" },
          { label:"Active Referrals", value: mockReferrals.filter(r => r.kycStatus === "VERIFIED" || r.kycStatus === "PENDING").length.toString(), icon:<TrendingUp size={20} className="text-green-500"/>,bg:"bg-green-50 dark:bg-green-900/20" },
          { label:"Total Earned",     value: "$" + mockReferrals.filter(r => r.rewardStatus === "PAID").reduce((s, r) => s + r.reward, 0).toFixed(2), icon:<DollarSign size={20} className="text-blue-500"/>, bg:"bg-blue-50 dark:bg-blue-900/20" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm text-center">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>{s.icon}</div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Share2 size={16} className="text-primary-500"/>
          <h3 className="font-extrabold text-gray-900 dark:text-white">Your Referral Link</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-400 truncate">
            {loading ? "Loading…" : referralLink}
          </div>
          <button onClick={copyLink} disabled={!referralLink}
            className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex-shrink-0">
            {copied ? <><CheckCircle2 size={14}/> Copied!</> : <><Copy size={14}/> Copy</>}
          </button>
        </div>
        {/* Share buttons */}
        {referralLink && (
          <div className="flex gap-2 flex-wrap">
            {[
              { label:"Share on X",      bg:"bg-black hover:bg-gray-800",            href:`https://twitter.com/intent/tweet?text=${encodeURIComponent("Join Teslaxipo & start earning! "+referralLink)}` },
              { label:"WhatsApp",        bg:"bg-green-500 hover:bg-green-600",       href:`https://wa.me/?text=${encodeURIComponent("Join Teslaxipo: "+referralLink)}` },
              { label:"Email",           bg:"bg-blue-500 hover:bg-blue-600",         href:`mailto:?subject=Join+Teslaxipo&body=${encodeURIComponent("Join me on Teslaxipo: "+referralLink)}` },
            ].map(b => (
              <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center px-4 py-2 ${b.bg} text-white text-xs font-bold rounded-xl transition-colors`}>
                {b.label}
              </a>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400">You'll earn a 5% bonus when your referral makes their first deposit.</p>
      </div>

      {/* Referred Friends Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Referred Friends</h3>
          <span className="text-xs font-bold text-gray-400">{mockReferrals.length} referrals total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Joined Date</th>
                <th className="p-4 font-bold">KYC Status</th>
                <th className="p-4 font-bold">Reward</th>
                <th className="p-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-semibold text-gray-700 dark:text-gray-300">
              {mockReferrals.map(ref => (
                <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="p-4 text-gray-900 dark:text-white">@{ref.username}</td>
                  <td className="p-4">{new Date(ref.joinedAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      ref.kycStatus === "VERIFIED"
                        ? "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                        : ref.kycStatus === "PENDING"
                          ? "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400"
                          : "bg-gray-100 dark:bg-gray-900 text-gray-500"
                    }`}>
                      {ref.kycStatus}
                    </span>
                  </td>
                  <td className="p-4 font-black">${ref.reward.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase ${
                      ref.rewardStatus === "PAID" ? "text-green-500" : "text-yellow-500"
                    }`}>
                      {ref.rewardStatus === "PAID" ? <Check size={10} /> : <Clock size={10} />}
                      {ref.rewardStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus size={16} className="text-primary-500"/>
          <h3 className="font-extrabold text-gray-900 dark:text-white">How It Works</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map(s => (
            <div key={s.num} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <span className="w-8 h-8 rounded-full bg-primary-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0">{s.num}</span>
              <div>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{s.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
