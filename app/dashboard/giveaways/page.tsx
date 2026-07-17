"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Gift, Clock, Users, Trophy, Car, DollarSign,
  Coins, CheckCircle2, Loader2, RefreshCw, X,
  AlertCircle, ChevronRight, Ticket, Search, Info, HelpCircle
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface WinnerUser {
  email: string;
  name: string;
}

interface GiveawayEntryDetail {
  user: WinnerUser;
}

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizeType: string;
  imageUrl: string;
  status: "ACTIVE" | "ENDED" | "UPCOMING";
  endsAt: string;
  maxEntries: number;
  _count: { entries: number };
  entries?: GiveawayEntryDetail[]; // Winners list
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function prizeIcon(type: string) {
  if (type === "CAR")     return <Car size={20} className="text-primary-500" />;
  if (type === "CRYPTO")  return <Coins size={20} className="text-orange-500" />;
  if (type === "CREDITS") return <Trophy size={20} className="text-purple-500" />;
  return <DollarSign size={20} className="text-green-500" />;
}

function prizeColor(type: string) {
  if (type === "CAR")     return "bg-red-50 dark:bg-red-950/20";
  if (type === "CRYPTO")  return "bg-orange-50 dark:bg-orange-950/20";
  if (type === "CREDITS") return "bg-purple-50 dark:bg-purple-950/20";
  return "bg-green-50 dark:bg-green-950/20";
}

// Live ticking countdown hook
function useCountdown(endsAt: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      else       setTimeLeft(`${h}h ${m}m ${s}s`);
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}

/* ─────────────────────────────────────────────
   Giveaway Detail & Entry Modal
───────────────────────────────────────────── */
interface EnterModalProps {
  giveaway: Giveaway;
  onClose: (entered: boolean) => void;
  vipTier: string;
}

function EnterModal({ giveaway, onClose, vipTier }: EnterModalProps) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  // VIP entry multiplier
  const entryMultiplier = useMemo(() => {
    const tier = vipTier?.toUpperCase() || "STANDARD";
    if (tier.includes("SILVER")) return "1.5x Multiplier Active (Silver Card)";
    if (tier.includes("GOLD")) return "2x Multiplier Active (Gold Card)";
    if (tier.includes("PLATINUM")) return "3x Multiplier Active (Platinum Card)";
    if (tier.includes("DIAMOND") || tier.includes("BLACK") || tier.includes("ELITE")) {
      return "5x Multiplier Active (Prestige Level)";
    }
    return "1x Standard Entries";
  }, [vipTier]);

  async function handleEnter() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/giveaways/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giveawayId: giveaway.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to enter. Please try again."); return; }
      setDone(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && onClose(done)} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35">
          <div className="flex items-center gap-3">
            <Gift className="text-primary-500" size={22} />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Giveaway Details</h3>
          </div>
          <button onClick={() => onClose(done)} disabled={loading} className="text-gray-400 hover:text-gray-650">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Card Mock image */}
          <div className={`aspect-[16/9] rounded-2xl flex items-center justify-center relative overflow-hidden ${prizeColor(giveaway.prizeType)}`}>
            {giveaway.imageUrl ? (
              <img src={giveaway.imageUrl} alt={giveaway.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-50">
                {prizeIcon(giveaway.prizeType)}
                <span className="text-xs font-black uppercase tracking-wider">{giveaway.prizeType}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white font-extrabold text-sm">{giveaway.prize}</div>
          </div>

          <div className="space-y-2">
            <h4 className="font-black text-gray-900 dark:text-white text-base leading-snug">{giveaway.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{giveaway.description}</p>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 pt-3 border-t dark:border-gray-700 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Entries Logged</span>
              <span className="font-bold text-gray-900 dark:text-white">{giveaway._count.entries} users</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Closing Draw Date</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {new Date(giveaway.endsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-950/20 p-2.5 rounded-xl border dark:border-primary-900/50 mt-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Ticket size={12} className="text-primary-500" /> VIP Bonus Entry
              </span>
              <span className="font-black text-primary-500 text-[10px]">{entryMultiplier}</span>
            </div>
          </div>

          {/* Verification terms */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-3.5 rounded-2xl border dark:border-gray-750/70 text-[10px] text-gray-400 space-y-1">
            <p className="font-bold text-gray-700 dark:text-gray-300">📜 Entry Terms & Conditions</p>
            <p>1. Drawing is audited and compiled automatically via smart contract hashes.</p>
            <p>2. Winners are contacted via registered emails within 24 hours of closing.</p>
            <p>3. One entry per eligible account is permitted.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-650 dark:text-red-400 font-semibold">
              <AlertCircle size={13} className="flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35 flex justify-end gap-2">
          {!done ? (
            <>
              <button onClick={() => onClose(false)} className="px-4 py-2 border border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleEnter}
                disabled={loading}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center gap-1.5"
              >
                {loading ? <><Loader2 size={13} className="animate-spin" /> Entering...</> : <><Ticket size={13} /> Confirm Entry</>}
              </button>
            </>
          ) : (
            <div className="text-center w-full py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center mx-auto"><CheckCircle2 className="text-green-500" size={24} /></div>
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">Successfully Entered!</h4>
                <p className="text-xs text-gray-400 mt-1">Ticket voucher registered. Good luck! 🍀</p>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => onClose(true)} className="px-4 py-2 border dark:border-gray-700 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-300">Close</button>
                <Link href="/dashboard/giveaways/my-entries" className="px-4 py-2 bg-primary-500 text-white text-xs font-extrabold rounded-xl text-center">View Tickets</Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Giveaway Card Component
───────────────────────────────────────────── */
interface GiveawayCardProps {
  giveaway: Giveaway;
  onEnter: () => void;
  alreadyEntered: boolean;
}

function GiveawayCard({ giveaway, onEnter, alreadyEntered }: GiveawayCardProps) {
  const countdown = useCountdown(giveaway.endsAt);
  const isEnded   = giveaway.status === "ENDED" || new Date(giveaway.endsAt) < new Date();
  const isFull    = giveaway.maxEntries > 0 && giveaway._count.entries >= giveaway.maxEntries;
  const progress  = giveaway.maxEntries > 0
    ? Math.min((giveaway._count.entries / giveaway.maxEntries) * 100, 100)
    : 0;

  // Mask winner email helper (e.g. user@gmail.com -> u***@gmail.com)
  const formatWinnerEmail = (email: string) => {
    if (!email) return "Anonymous Winner";
    const parts = email.split("@");
    if (parts.length !== 2) return "Verified Winner";
    const first = parts[0];
    const masked = first.substring(0, Math.min(2, first.length)) + "***";
    return `${masked}@${parts[1]}`;
  };

  const winningEntries = giveaway.entries || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col relative group">
      
      {/* Visual top bar for prize */}
      <div className={`relative h-40 flex items-center justify-center overflow-hidden ${prizeColor(giveaway.prizeType)}`}>
        {giveaway.imageUrl ? (
          <img src={giveaway.imageUrl} alt={giveaway.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-900/50 flex items-center justify-center shadow-sm">
              {prizeIcon(giveaway.prizeType)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">{giveaway.prizeType}</span>
          </div>
        )}

        <div className={`absolute top-3 left-3 text-[9px] font-black px-2.5 py-1 rounded-full text-white shadow-sm ${
          isEnded ? "bg-gray-500" : "bg-green-500 animate-pulse"
        }`}>
          {isEnded ? "ENDED" : "● LIVE"}
        </div>

        {/* Ticking Countdown Timer */}
        {!isEnded && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-black text-white font-mono flex items-center gap-1 shadow-sm">
            <Clock size={9} className="text-primary-500" />
            {countdown}
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
            <p className="text-[9px] text-white/70 font-semibold uppercase tracking-wider">Prize</p>
            <p className="text-xs font-black text-white">{giveaway.prize}</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">{giveaway.title}</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{giveaway.description}</p>
        </div>

        {/* ProgressBar */}
        {giveaway.maxEntries > 0 && !isEnded && (
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase tracking-wider">
              <span>{giveaway._count.entries} / {giveaway.maxEntries} joined</span>
              <span>{progress.toFixed(0)}% full</span>
            </div>
          </div>
        )}

        {/* Display Winner if Ended */}
        {isEnded && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl p-2.5 flex items-center gap-2">
            <Trophy size={14} className="text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Audit Results Winner</p>
              <p className="text-xs font-bold text-green-600 dark:text-green-400 truncate">
                {winningEntries.length > 0
                  ? formatWinnerEmail(winningEntries[0].user?.email || winningEntries[0].user?.name)
                  : "Verified Winner Announced"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t dark:border-gray-750">
          <span className="flex items-center gap-1"><Users size={11} /> {giveaway._count.entries} entered</span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {isEnded ? "Closed" : "Ends"} {new Date(giveaway.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* CTA */}
        <div className="pt-2">
          {alreadyEntered ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-green-50 dark:bg-green-950/15 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 font-bold text-xs rounded-xl">
              <CheckCircle2 size={13} /> Entered Vouchers
            </div>
          ) : isEnded ? (
            <div className="w-full flex items-center justify-center py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold text-xs rounded-xl cursor-not-allowed">
              Giveaway Closed
            </div>
          ) : isFull ? (
            <div className="w-full flex items-center justify-center py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold text-xs rounded-xl cursor-not-allowed">
              Full Room Limit
            </div>
          ) : (
            <button
              onClick={onEnter}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-primary-500/20"
            >
              <Ticket size={13} /> Enter & Detail
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Giveaways Page
───────────────────────────────────────────── */
type FilterType = "ALL" | "CAR" | "CASH" | "CRYPTO" | "CREDITS";

export default function GiveawaysPage() {
  const [giveaways,   setGiveaways]   = useState<Giveaway[]>([]);
  const [enteredIds,  setEnteredIds]  = useState<Set<string>>(new Set());
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [refreshing,  setRefreshing]  = useState(false);
  const [enterTarget, setEnterTarget] = useState<Giveaway | null>(null);
  
  // Custom states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab,   setActiveTab]   = useState<FilterType>("ALL");
  const [userVipTier, setUserVipTier] = useState("STANDARD");

  const fetchAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [gRes, eRes, uRes] = await Promise.all([
        fetch("/api/giveaways"),
        fetch("/api/giveaways/entries"),
        fetch("/api/user/me")
      ]);
      
      const gData = await gRes.json();
      setGiveaways(Array.isArray(gData) ? gData : []);

      if (eRes.ok) {
        const eData = await eRes.json();
        if (Array.isArray(eData)) {
          setEnteredIds(new Set(eData.map((e: { giveawayId: string }) => e.giveawayId)));
        }
      }

      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData?.vipMembership?.cardName) {
          setUserVipTier(uData.vipMembership.cardName);
        }
      }
    } catch {
      setError("Could not load giveaways. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived counts & stats
  const activeCount = useMemo(() => {
    return giveaways.filter(g => g.status === "ACTIVE" && new Date(g.endsAt) > new Date()).length;
  }, [giveaways]);

  // Filters & Search
  const filteredGiveaways = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return giveaways.filter(g => {
      const matchSearch = !q || g.title.toLowerCase().includes(q) || g.prize.toLowerCase().includes(q);
      const matchTab = activeTab === "ALL" || g.prizeType === activeTab;
      return matchSearch && matchTab;
    });
  }, [giveaways, searchQuery, activeTab]);

  const tabs: { id: FilterType; label: string }[] = [
    { id: "ALL", label: "All Vouchers" },
    { id: "CAR", label: "🚘 Vehicle Giveaways" },
    { id: "CASH", label: "💵 Cash Giveaways" },
    { id: "CRYPTO", label: "🪙 Crypto Pools" },
    { id: "CREDITS", label: "🏆 Investment Credits" },
  ];

  return (
    <>
      {enterTarget && (
        <EnterModal
          giveaway={enterTarget}
          vipTier={userVipTier}
          onClose={(entered) => {
            if (entered) setEnteredIds((prev) => new Set(Array.from(prev).concat(enterTarget.id)));
            setEnterTarget(null);
            if (entered) fetchAll(true);
          }}
        />
      )}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-950 dark:text-white">Tesla Giveaways</h1>
            <p className="text-sm text-gray-400 mt-1">
              Win premium prizes —{" "}
              <span className="text-gray-655 dark:text-gray-300">vehicles, cash pools, and</span>{" "}
              <span className="text-primary-500 font-extrabold">investment credits</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchAll(true)} disabled={refreshing}
              className="p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
            <Link href="/dashboard/giveaways/my-entries"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-extrabold text-sm rounded-xl hover:border-primary-400 transition-colors">
              <Ticket size={14} className="text-primary-500" /> My Entries
            </Link>
          </div>
        </div>

        {/* Statistics panel */}
        {giveaways.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Pool Giveaways", value: giveaways.length, icon: <Gift size={18} className="text-primary-500" />, bg: "bg-red-50 dark:bg-red-950/15" },
              { label: "Active Draw Rooms", value: activeCount, icon: <Trophy size={18} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-950/15" },
              { label: "My Entry Tickets", value: enteredIds.size, icon: <Ticket size={18} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-950/15" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight mt-0.5">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">Browse Active Room Giveaways</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">{filteredGiveaways.length} draw pools available</p>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Prize or Giveaway..."
                className="pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-750 dark:text-gray-300 placeholder-gray-400 w-48 sm:w-64 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === t.id
                    ? "bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/20"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-450 hover:border-primary-400 hover:text-primary-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-primary-500" />
            <p className="text-sm text-gray-400">Syncing with smart contract...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
            <AlertCircle size={32} className="text-red-400 mb-4" />
            <h3 className="font-extrabold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <button onClick={() => fetchAll()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : filteredGiveaways.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
              <Gift size={30} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">No Draw Rooms Found</h3>
            <p className="text-sm text-gray-450 max-w-xs mx-auto">No giveaways match your filter search. Check back soon for new pools!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGiveaways.map((g) => (
              <GiveawayCard
                key={g.id}
                giveaway={g}
                alreadyEntered={enteredIds.has(g.id)}
                onEnter={() => setEnterTarget(g)}
              />
            ))}
          </div>
        )}

      </div>
    </>
  );
}
