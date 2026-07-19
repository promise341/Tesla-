"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, X, Loader2, Star, Zap, Crown,
  Shield, Gem, Rocket, ChevronDown, ChevronUp,
  AlertCircle, DollarSign, Wallet,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Card definitions — 3 from screenshot + 3 extra
───────────────────────────────────────────── */
const VIP_CARDS = [
  {
    id: "silver",
    name: "Tesla Silver Card",
    tag: "POPULAR",
    tagColor: "bg-primary-500",
    price: 499,
    duration: "1 Month",
    img: "/siliver.jpg",
    fallbackBg: "bg-gradient-to-br from-gray-300 to-gray-500",
    fallbackLabel: "SILVER",
    labelColor: "text-gray-700",
    borderColor: "border-gray-300 dark:border-gray-500",
    accentColor: "text-gray-500",
    icon: <Shield size={22} className="text-gray-400" />,
    tagline: "Essential perks for smart investors starting their journey.",
    features: [
      "Priority customer support",
      "Basic market signals",
      "Early access to new plans",
      "Monthly market reports",
      "Dedicated account manager",
    ],
    extra: [],
  },
  {
    id: "gold",
    name: "Tesla Gold Card",
    tag: "POPULAR",
    tagColor: "bg-primary-500",
    price: 1499,
    duration: "3 Months",
    img: "/gold.png",
    fallbackBg: "bg-gradient-to-br from-yellow-300 to-yellow-600",
    fallbackLabel: "GOLD",
    labelColor: "text-yellow-800",
    borderColor: "border-yellow-400 dark:border-yellow-600",
    accentColor: "text-yellow-500",
    icon: <Star size={22} className="text-yellow-500" />,
    tagline: "Enhanced benefits for serious traders seeking an edge.",
    features: [
      "Everything in Silver",
      "Premium market signals",
      "Reduced trading fees (5%)",
      "Exclusive analyst webinars",
      "Priority withdrawal processing",
    ],
    extra: ["VIP chat support", "Weekly performance reports"],
  },
  {
    id: "platinum",
    name: "Tesla Platinum Card",
    tag: "POPULAR",
    tagColor: "bg-primary-500",
    price: 4999,
    duration: "6 Months",
    img: "/Platinum Badge.png",
    fallbackBg: "bg-gradient-to-br from-slate-300 to-slate-600",
    fallbackLabel: "Platinum Level",
    labelColor: "text-slate-700",
    borderColor: "border-slate-400 dark:border-slate-500",
    accentColor: "text-slate-500",
    icon: <Gem size={22} className="text-slate-400" />,
    tagline: "Elite-tier access with maximum trading advantages.",
    features: [
      "Everything in Gold",
      "Real-time AI trading signals",
      "Reduced trading fees (15%)",
      "Personal investment advisor",
      "High-yield exclusive plans",
    ],
    extra: ["Priority hotline 24/7", "Quarterly portfolio review", "Exclusive Tesla merch", "Early car inventory access"],
  },
  {
    id: "diamond",
    name: "Tesla Diamond Card",
    tag: "NEW",
    tagColor: "bg-blue-500",
    price: 9999,
    duration: "12 Months",
    img: "/diamonds .png",
    fallbackBg: "bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500",
    fallbackLabel: "DIAMOND",
    labelColor: "text-white",
    borderColor: "border-blue-400 dark:border-blue-500",
    accentColor: "text-blue-500",
    icon: <Gem size={22} className="text-blue-400" />,
    tagline: "The ultimate annual membership for elite investors.",
    features: [
      "Everything in Platinum",
      "Zero trading fees",
      "Dedicated wealth manager",
      "Private investment briefings",
      "Diamond lounge access",
    ],
    extra: ["Annual Tesla event invites", "Custom portfolio strategies", "Insider market previews"],
  },
  {
    id: "black",
    name: "Tesla Black Card",
    tag: "VIP",
    tagColor: "bg-gray-900",
    price: 19999,
    duration: "12 Months",
    img: "/Black Badge.png",
    fallbackBg: "bg-gradient-to-br from-gray-800 to-gray-950",
    fallbackLabel: "BLACK",
    labelColor: "text-white",
    borderColor: "border-gray-700 dark:border-gray-600",
    accentColor: "text-gray-300",
    icon: <Crown size={22} className="text-gray-300" />,
    tagline: "Invite-only prestige membership with unparalleled privileges.",
    features: [
      "Everything in Diamond",
      "1-on-1 Elon strategy sessions",
      "Guaranteed ROI protection",
      "Private Tesla factory tours",
      "Unlimited withdrawal priority",
    ],
    extra: ["Exclusive Tesla Roadster discount", "Global concierge service", "Black card physical delivery"],
  },
  {
    id: "elite",
    name: "Tesla Elite Card",
    tag: "ELITE",
    tagColor: "bg-purple-600",
    price: 49999,
    duration: "Lifetime",
    img: "/Elite Badge.png",
    fallbackBg: "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500",
    fallbackLabel: "ELITE",
    labelColor: "text-white",
    borderColor: "border-purple-500 dark:border-purple-400",
    accentColor: "text-purple-500",
    icon: <Rocket size={22} className="text-purple-400" />,
    tagline: "Lifetime membership. The apex of Teslaxipo membership.",
    features: [
      "Everything in Black",
      "Lifetime zero-fee trading",
      "Equity stake opportunities",
      "Named on VIP investor wall",
      "Direct CEO access channel",
    ],
    extra: ["Lifetime Tesla service credits", "Annual dividend bonuses", "Legacy account transfer"],
  },
];

type Card = typeof VIP_CARDS[number];

/* ─────────────────────────────────────────────
   Details Modal
───────────────────────────────────────────── */
function DetailsModal({ card, onClose, onGetCard }: { card: Card; onClose: () => void; onGetCard: () => void }) {
  const router = useRouter();

  function handleGetCard() {
    router.push(`/dashboard/vip/${card.id}/purchase`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>

        {/* Card image / badge */}
        <div className={`w-full h-32 rounded-xl mb-5 flex items-center justify-center overflow-hidden relative ${card.img ? "" : card.fallbackBg}`}>
          {card.img ? (
            <>
              <img src={card.img} alt={card.name} className="w-full h-full object-cover"
                onError={(e) => {
                  const parent = (e.target as HTMLImageElement).parentElement!;
                  parent.classList.add(...card.fallbackBg.split(" "));
                  (e.target as HTMLImageElement).style.display = "none";
                }} />
              <div className="absolute inset-0 bg-black/30" />
              <span className={`absolute font-black text-2xl tracking-widest ${card.labelColor}`}>{card.fallbackLabel}</span>
            </>
          ) : (
            <span className={`text-2xl font-black tracking-widest ${card.labelColor}`}>{card.fallbackLabel}</span>
          )}
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{card.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{card.tagline}</p>

        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-3xl font-black text-gray-900 dark:text-white">${card.price.toLocaleString()}.00</span>
          <span className="text-sm text-gray-400">/ {card.duration}</span>
        </div>

        <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">All Benefits</p>
        <ul className="space-y-2 mb-6">
          {[...card.features, ...card.extra].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Close
          </button>
          <button 
            onClick={handleGetCard}
            className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
          >
            Get Card
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Get Card Modal
───────────────────────────────────────────── */
function GetCardModal({ card, onClose }: { card: Card; onClose: (success: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubscribe() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/vip/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardName: card.name, price: card.price, duration: card.duration }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Subscription failed. Please try again."); return; }
      setDone(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && onClose(done)} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
        <button onClick={() => onClose(done)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" disabled={loading}><X size={18} /></button>

        {!done ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.fallbackBg}`}>
                {card.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white">Get VIP Card</h3>
                <p className="text-xs text-gray-400">{card.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-5 space-y-2">
              {[
                { label: "Card",       value: card.name },
                { label: "Price",      value: `$${card.price.toLocaleString()}.00`, red: true },
                { label: "Duration",   value: card.duration },
                { label: "Status",     value: "Pending Activation" },
                { label: "Payment",    value: "Payment Pending" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{r.label}</span>
                  <span className={r.red ? "font-bold text-primary-500" : "font-bold text-gray-900 dark:text-white"}>{r.value}</span>
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-red-500 font-semibold mb-4 flex items-center gap-1"><X size={11} />{error}</p>}

            <button onClick={handleSubscribe} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : <>Confirm Order</>}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-3">You will be prompted to complete payment in My Memberships.</p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Order Placed!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Your <span className="font-bold text-gray-900 dark:text-white">{card.name}</span> order has been created.
            </p>
            <p className="text-xs text-gray-400 mb-6">Complete your payment in My Memberships to activate the card.</p>
            <div className="flex gap-3">
              <button onClick={() => onClose(true)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Continue Browsing
              </button>
              <Link href="/dashboard/vip/my-memberships" className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl text-center transition-colors">
                My Memberships
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIP Card component
───────────────────────────────────────────── */
function VipCard({ card, onDetails }: { card: Card; onDetails: () => void }) {
  const [showExtra, setShowExtra] = useState(false);
  const visibleFeatures = card.features;
  const extraCount = card.extra.length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border-2 ${card.borderColor} shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow`}>

      {/* Card image header */}
      <div className="relative">
        <div className={`h-44 w-full flex items-center justify-center overflow-hidden ${card.img ? "" : card.fallbackBg}`}>
          {card.img ? (
            <>
              <img
                src={card.img}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails, hide it and show gradient fallback
                  const parent = (e.target as HTMLImageElement).parentElement!;
                  parent.classList.add(...card.fallbackBg.split(" "));
                  (e.target as HTMLImageElement).style.display = "none";
                  const span = parent.querySelector(".fallback-label") as HTMLElement;
                  if (span) span.style.display = "flex";
                }}
              />
              {/* Overlay so text is always readable */}
              <div className="absolute inset-0 bg-black/30" />
              <span className={`fallback-label absolute inset-0 hidden items-center justify-center text-4xl font-black tracking-widest select-none ${card.labelColor} drop-shadow-lg`}>
                {card.fallbackLabel}
              </span>
            </>
          ) : (
            <span className={`text-4xl font-black tracking-widest select-none ${card.labelColor} drop-shadow-lg`}>
              {card.fallbackLabel}
            </span>
          )}
        </div>
        {/* Tag badge */}
        {card.tag && (
          <span className={`absolute top-3 right-3 ${card.tagColor} text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shadow`}>
            {card.tag}
          </span>
        )}
        {/* Icon */}
        <div className="absolute bottom-3 left-4 w-8 h-8 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow">
          {card.icon}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-3">
        {/* Name */}
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{card.name}</h3>

        {/* Tagline */}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{card.tagline}</p>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-gray-900 dark:text-white">${card.price.toLocaleString()}.00</span>
          <span className="text-xs text-gray-400">/ {card.duration}</span>
        </div>

        {/* Features list */}
        <ul className="space-y-1.5">
          {visibleFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" /> {f}
            </li>
          ))}

          {/* Expandable extras */}
          {showExtra && extraCount > 0 && card.extra.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle2 size={13} className="text-blue-400 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>

        {/* Show more/less toggle */}
        {extraCount > 0 && (
          <button
            onClick={() => setShowExtra(!showExtra)}
            className={`flex items-center gap-1 text-xs font-bold ${card.accentColor} hover:opacity-80 transition-opacity`}
          >
            {showExtra ? <><ChevronUp size={12} /> Hide extras</> : <><ChevronDown size={12} /> + {extraCount} more benefits</>}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons — Details + Get Card matching screenshot */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onDetails}
            className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Details
          </button>
          <Link
            href={`/dashboard/vip/${card.id}/purchase`}
            className="flex-1 text-center py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-primary-500/20"
          >
            Purchase This Card
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function VipCardsPage() {
  const [detailCard,  setDetailCard]  = useState<Card | null>(null);
  const [getCardCard, setGetCardCard] = useState<Card | null>(null);

  return (
    <>
      {/* Details Modal */}
      {detailCard && (
        <DetailsModal
          card={detailCard}
          onClose={() => setDetailCard(null)}
          onGetCard={() => setGetCardCard(detailCard)}
        />
      )}

      {/* Get Card Modal */}
      {getCardCard && (
        <GetCardModal
          card={getCardCard}
          onClose={() => setGetCardCard(null)}
        />
      )}

      <div className="space-y-8">

        {/* Page header — centred, matching screenshot */}
        <div className="text-center pt-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">VIP Card Memberships</h1>
          <p className="text-sm text-primary-500 mt-2 max-w-md mx-auto leading-relaxed">
            Unlock exclusive benefits and premium privileges with our VIP membership tiers.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {VIP_CARDS.map((card) => (
            <VipCard
              key={card.id}
              card={card}
              onDetails={() => setDetailCard(card)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="font-extrabold text-white text-base">Already have a membership?</h3>
            <p className="text-xs text-gray-400 mt-0.5">View your active VIP cards, check status, and complete pending payments.</p>
          </div>
          <Link
            href="/dashboard/vip/my-memberships"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20 flex-shrink-0"
          >
            My Memberships
          </Link>
        </div>

      </div>
    </>
  );
}
