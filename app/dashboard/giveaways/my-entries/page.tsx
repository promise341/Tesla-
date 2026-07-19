"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Gift, Ticket, Trophy, Car, DollarSign, Coins,
  Clock, CheckCircle2, XCircle, RefreshCw,
  Loader2, AlertCircle, Calendar, ChevronRight,
  Search, Download, Barcode, HelpCircle, FileText, CheckCircle, PlusCircle
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface GiveawayInfo {
  id: string;
  title: string;
  prize: string;
  prizeType: string;
  imageUrl: string;
  status: string;
  endsAt: string;
}

interface Entry {
  id: string;
  giveawayId: string;
  status: "ENTERED" | "WON" | "LOST";
  createdAt: string;
  giveaway: GiveawayInfo;
}

type TabType = "ALL" | "ENTERED" | "WON" | "LOST";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function entryStatusStyle(status: string) {
  if (status === "WON")    return { bg: "bg-green-100 dark:bg-green-950/20",  text: "text-green-600 dark:text-green-400",  icon: <Trophy size={11} />,      label: "Won 🎉" };
  if (status === "LOST")   return { bg: "bg-gray-150 dark:bg-gray-700/60",    text: "text-gray-500 dark:text-gray-400",    icon: <XCircle size={11} />,     label: "Not Won" };
  return                    { bg: "bg-blue-100 dark:bg-blue-900/30",           text: "text-blue-600 dark:text-blue-400",    icon: <Clock size={11} />,       label: "Entered" };
}

function giveawayStatusStyle(status: string, endsAt: string) {
  const ended = status === "ENDED" || new Date(endsAt) < new Date();
  if (ended) return { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-500 dark:text-gray-450", label: "Ended" };
  return       { bg: "bg-green-100 dark:bg-green-950/20", text: "text-green-600 dark:text-green-400", label: "Active" };
}

function prizeIcon(type: string) {
  if (type === "CAR")     return <Car size={18} className="text-primary-500" />;
  if (type === "CRYPTO")  return <Coins size={18} className="text-orange-500" />;
  if (type === "CREDITS") return <Trophy size={18} className="text-purple-500" />;
  return <DollarSign size={18} className="text-green-500" />;
}

function prizeBg(type: string) {
  if (type === "CAR")     return "bg-red-50 dark:bg-red-950/20";
  if (type === "CRYPTO")  return "bg-orange-50 dark:bg-orange-950/20";
  if (type === "CREDITS") return "bg-purple-50 dark:bg-purple-950/20";
  return "bg-green-50 dark:bg-green-950/20";
}

/* ─────────────────────────────────────────────
   Ticket Detailed Preview Modal
───────────────────────────────────────────── */
interface TicketModalProps {
  entry: Entry;
  onClose: () => void;
  userName: string;
}

function TicketModal({ entry, onClose, userName }: TicketModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const ticketNumber = useMemo(() => {
    return `TKT-${entry.id.substring(0, 8).toUpperCase()}-${entry.giveawayId.substring(0, 4).toUpperCase()}`;
  }, [entry]);

  // Virtual verification hash
  const hashKey = useMemo(() => {
    return `SHA256:${entry.id.toUpperCase()}${entry.createdAt.replace(/[^0-9]/g, "")}`;
  }, [entry]);

  function handlePrintTicket() {
    const printContent = `
      <html>
        <head>
          <title>Entry Ticket - ${ticketNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 90vh; background-color: #f3f4f6; }
            .ticket { background-color: white; border: 2px dashed #a855f7; border-radius: 16px; padding: 30px; width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #ef4444; margin-top: 5px; }
            .details { line-height: 1.8; font-size: 14px; margin-bottom: 25px; }
            .barcode { font-family: 'Courier New', Courier, monospace; text-align: center; background-color: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin-top: 15px; }
            .footer { font-size: 10px; color: #777; text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div style="font-weight: 900; letter-spacing: 1px;">TESLAXIPO VOUCHER</div>
              <div class="title">${entry.giveaway.title}</div>
            </div>
            <div class="details">
              <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p><strong>Candidate Name:</strong> ${userName || "Verified Investor"}</p>
              <p><strong>Grand Prize:</strong> ${entry.giveaway.prize}</p>
              <p><strong>Date Joined:</strong> ${new Date(entry.createdAt).toLocaleString()}</p>
              <p><strong>Audit Status:</strong> ${entry.status}</p>
            </div>
            <div class="barcode">
              ||||| | |||| ||| || |||||| | ||||<br>
              <span style="font-size:11px; font-weight:bold; letter-spacing:2px;">${ticketNumber}</span>
            </div>
            <div class="footer">
              Valid only for drawing verification at teslaxipo.com. Non-transferrable.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-250 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-150 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35">
          <div className="flex items-center gap-3">
            <Ticket className="text-primary-500" size={22} />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Digital Entry Ticket</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-650">
            <XCircle size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Card Mock Ticket Layout */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-gray-750 relative overflow-hidden flex flex-col justify-between aspect-[1.8/1]">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary-500/10 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/10 rounded-full blur-xl" />
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Tesla Voucher Ticket</p>
                <h4 className="text-sm font-black text-white mt-1 leading-snug line-clamp-1">{entry.giveaway.title}</h4>
              </div>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                entry.status === "WON" ? "bg-green-500 text-white" : entry.status === "LOST" ? "bg-gray-600 text-gray-300" : "bg-primary-500 text-white"
              }`}>
                {entry.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[8px] text-gray-500 font-bold uppercase">Holder Name</p>
                <p className="text-[11px] font-bold truncate mt-0.5">{userName || "Verified Investor"}</p>
              </div>
              <div>
                <p className="text-[8px] text-gray-500 font-bold uppercase">Ticket Number</p>
                <p className="text-[10px] font-mono font-bold mt-0.5 text-primary-400">{ticketNumber}</p>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-700/80 pt-3 flex items-center justify-between mt-4">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[8px] text-gray-500 font-bold uppercase">Prize Category</p>
                <p className="text-[11px] font-black text-green-400 mt-0.5 truncate">{entry.giveaway.prize}</p>
              </div>
              <Barcode className="text-gray-400" size={32} />
            </div>
          </div>

          {/* Details & verification */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={13} className="text-primary-500" /> Audit Log
            </h4>
            <div className="space-y-2 border-t dark:border-gray-700 pt-2 text-gray-655 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Date Joined</span>
                <span className="font-semibold">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Drawing Close</span>
                <span className="font-semibold">{new Date(entry.giveaway.endsAt).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-1 mt-2.5 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border dark:border-gray-750">
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Audit contract SHA256 Hash</span>
                <code className="text-[10px] font-mono text-green-500 break-all select-all leading-normal">{hashKey}</code>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/35 flex justify-end gap-2">
          <button
            onClick={handlePrintTicket}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors"
          >
            <FileText size={14} /> Download/Print Ticket
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Close Voucher
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main My Entries Page Component
───────────────────────────────────────────── */
export default function MyEntriesPage() {
  const [entries,    setEntries]    = useState<Entry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [userName,   setUserName]   = useState("");

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<Entry | null>(null);

  const fetchEntries = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [eRes, uRes] = await Promise.all([
        fetch("/api/giveaways/entries"),
        fetch("/api/user/me")
      ]);
      if (!eRes.ok) throw new Error();
      const data = await eRes.json();
      setEntries(Array.isArray(data) ? data : []);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUserName(uData.name || uData.email);
      }
    } catch {
      setError("Could not load your entries. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Counts
  const won     = useMemo(() => entries.filter((e) => e.status === "WON").length, [entries]);
  const entered = useMemo(() => entries.filter((e) => e.status === "ENTERED").length, [entries]);
  const lost    = useMemo(() => entries.filter((e) => e.status === "LOST").length, [entries]);

  // Filters & Search query mapping
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return entries.filter(e => {
      const matchSearch = !q || e.giveaway.title.toLowerCase().includes(q) || e.giveaway.prize.toLowerCase().includes(q);
      const matchTab = activeTab === "ALL" || e.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [entries, searchQuery, activeTab]);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "ALL",      label: "All Vouchers", count: entries.length },
    { id: "ENTERED",  label: "Active Draw Rooms", count: entered },
    { id: "WON",      label: "Won Rewards", count: won },
    { id: "LOST",     label: "Not Won", count: lost },
  ];

  // CSV Data Export
  function handleExportCSV() {
    const headers = ["Ticket ID", "Giveaway Room ID", "Prize Title", "Prize Category", "Entry Status", "Draw Expiry Date", "Registered Date"];
    const rows = entries.map(e => [
      `TKT-${e.id.substring(0, 8).toUpperCase()}`,
      e.giveawayId,
      e.giveaway.title,
      e.giveaway.prize,
      e.status,
      new Date(e.giveaway.endsAt).toLocaleDateString(),
      new Date(e.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tesla-capx-giveaway-tickets-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {selectedTicket && (
        <TicketModal
          entry={selectedTicket}
          userName={userName}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">My Entries</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and audit all your giveaway entries and ticket vouchers</p>
          </div>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-gray-655 dark:text-gray-300 border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <Download size={14} /> Export CSV
              </button>
            )}
            <button onClick={() => fetchEntries(true)} disabled={refreshing}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
            <Link href="/dashboard/giveaways"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
              <Gift size={14} /> Browse Giveaways
            </Link>
          </div>
        </div>

        {/* Stats card indicators */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Vouchers Registered", value: entries.length, icon: <Ticket size={16} className="text-primary-500" />, bg: "bg-red-50 dark:bg-red-950/15" },
              { label: "Active Draw Rooms", value: entered, icon: <Clock size={16} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-950/15" },
              { label: "Rewards Won", value: won, icon: <Trophy size={16} className="text-green-500" />, bg: "bg-green-50 dark:bg-green-950/15" },
              { label: "Not Won Tiers", value: lost, icon: <XCircle size={16} className="text-gray-400" />, bg: "bg-gray-100 dark:bg-gray-700/50" },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight mt-0.5">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters control & Search logs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">Voucher Statement</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">{filteredEntries.length} tickets matching</p>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Ticket, Room, Prize..."
                  className="pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-750 dark:text-gray-300 placeholder-gray-400 w-48 sm:w-64 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
            </div>

            {/* Filter buttons tabs */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeTab === t.id
                      ? "bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/20"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
                  }`}
                >
                  {t.label}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === t.id ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* List display log */}
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-sm text-gray-400">Querying entries statement...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center text-center">
              <AlertCircle size={32} className="text-red-400 mb-4" />
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button onClick={() => fetchEntries()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
                <Ticket size={28} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">No Entries Found</h3>
              <p className="text-sm text-gray-450 max-w-sm leading-relaxed mb-6">
                {entries.length === 0 ? "You haven't registered into any giveaways yet. Join active pools to get tickets!" : "No registered entry vouchers match your search."}
              </p>
              <Link href="/dashboard/giveaways"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
                <PlusCircle size={14} /> Browse Giveaways
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-150 dark:divide-gray-700">
              {/* Header labels for desktop view */}
              <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                <span className="w-14" />
                <span>Giveaway Details</span>
                <span className="text-right">Ticket ID</span>
                <span className="text-center">Voucher Status</span>
                <span className="w-24 text-right">Action</span>
              </div>

              {filteredEntries.map(entry => {
                const es = entryStatusStyle(entry.status);
                const gs = giveawayStatusStyle(entry.giveaway.status, entry.giveaway.endsAt);

                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedTicket(entry)}
                    className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-750/30 transition-colors cursor-pointer group"
                  >
                    {/* Icon container */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                      entry.giveaway.imageUrl ? "overflow-hidden p-0" : prizeBg(entry.giveaway.prizeType)
                    }`}>
                      {entry.giveaway.imageUrl ? (
                        <img src={entry.giveaway.imageUrl} alt={entry.giveaway.title} className="w-full h-full object-cover" />
                      ) : (
                        prizeIcon(entry.giveaway.prizeType)
                      )}
                    </div>

                    {/* Middle Details */}
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                        {entry.giveaway.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap font-semibold">
                        <Calendar size={10} />
                        Entered {new Date(entry.createdAt).toLocaleDateString()}
                        &nbsp;·&nbsp;
                        <span className="text-primary-500 uppercase">{entry.giveaway.prize}</span>
                      </p>
                    </div>

                    {/* Ticket Code */}
                    <div className="md:text-right flex md:flex-col justify-between items-center md:items-end gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden">Voucher Code</span>
                      <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                        #{entry.id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>

                    {/* Status badges */}
                    <div className="flex md:justify-center items-center justify-between gap-1 flex-wrap">
                      <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden">Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${gs.bg} ${gs.text}`}>
                          {gs.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${es.bg} ${es.text}`}>
                          {es.icon} {es.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions trigger */}
                    <div className="flex md:justify-end justify-between items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] text-gray-400 font-bold uppercase md:hidden">Action</span>
                      <div className="flex gap-2">
                        {entry.status === "WON" && (
                          <span className="text-[10px] font-bold text-green-500 flex items-center gap-0.5 bg-green-500/10 px-2 py-1 rounded-lg">
                            <Trophy size={11} /> Winner
                          </span>
                        )}
                        <button
                          onClick={() => setSelectedTicket(entry)}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] text-gray-655 dark:text-gray-300 font-extrabold rounded-lg border border-gray-250 dark:border-gray-655 transition-colors flex items-center gap-1"
                        >
                          Voucher Details <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
