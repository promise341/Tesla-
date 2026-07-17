"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft, Send, DollarSign, User, AlertCircle,
  CheckCircle2, Loader2, RefreshCw, ArrowUpRight,
  ArrowDownLeft, Clock, Info, UserCheck, UserX,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface TransferTx {
  id: string;
  type: "WITHDRAWAL" | "DEPOSIT";
  amount: number;
  address: string | null;
  status: string;
  createdAt: string;
}

interface TransferResult {
  reference: string;
  amount: number;
  recipient: { name: string; username: string };
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmt(n: number) {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseRef(address: string | null): string {
  if (!address) return "";
  const m = address.match(/Ref:\s*([^\s|]+)/);
  return m ? m[1] : "";
}

function parseName(address: string | null, type: "WITHDRAWAL" | "DEPOSIT"): string {
  if (!address) return "—";
  if (type === "WITHDRAWAL") {
    const m = address.match(/To:\s*([^|]+)/);
    return m ? m[1].trim() : "—";
  }
  const m = address.match(/From:\s*([^|]+)/);
  return m ? m[1].trim() : "—";
}

/* ─────────────────────────────────────────────
   Success Screen
───────────────────────────────────────────── */
function SuccessScreen({
  result, onReset,
}: { result: TransferResult; onReset: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-8 text-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={36} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Transfer Successful!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span className="font-bold text-gray-900 dark:text-white">{fmt(result.amount)}</span> has been sent to{" "}
          <span className="font-bold text-gray-900 dark:text-white">{result.recipient.name}</span>
          {" "}(@{result.recipient.username}).
        </p>
        <p className="text-xs text-gray-400 mb-2 mt-3">
          The funds have been credited to the recipient's account instantly.
        </p>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-2.5 mb-8 inline-block">
          <p className="text-[10px] text-gray-400 font-semibold">Reference ID</p>
          <p className="text-xs font-black text-gray-900 dark:text-white font-mono">{result.reference}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onReset}
            className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors"
          >
            Make Another Transfer
          </button>
          <Link
            href="/dashboard/wallet"
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center block"
          >
            Back to Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Transfer History Row
───────────────────────────────────────────── */
function HistoryRow({ tx }: { tx: TransferTx }) {
  const isSent   = tx.type === "WITHDRAWAL";
  const ref      = parseRef(tx.address);
  const name     = parseName(tx.address, tx.type);

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isSent ? "bg-orange-50 dark:bg-orange-900/20" : "bg-green-50 dark:bg-green-900/20"
      }`}>
        {isSent
          ? <ArrowUpRight size={16} className="text-orange-500" />
          : <ArrowDownLeft size={16} className="text-green-500" />}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {isSent ? "Sent to" : "Received from"} {name}
        </p>
        <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
          <Clock size={9} />
          {new Date(tx.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
          {ref && <span className="font-mono text-gray-300 dark:text-gray-600"> · {ref}</span>}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-black ${isSent ? "text-orange-500" : "text-green-500"}`}>
          {isSent ? "-" : "+"}{fmt(tx.amount)}
        </p>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
          COMPLETED
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function InternalTransferPage() {
  const [balance,        setBalance]        = useState(0);
  const [recipient,      setRecipient]      = useState("");
  const [amount,         setAmount]         = useState("");
  const [note,           setNote]           = useState("");
  const [loading,        setLoading]        = useState(false);
  const [fieldError,     setFieldError]     = useState("");
  const [result,         setResult]         = useState<TransferResult | null>(null);
  const [history,        setHistory]        = useState<TransferTx[]>([]);
  const [histLoad,       setHistLoad]       = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);

  // Recipient validation states
  const [searchingUser,  setSearchingUser]  = useState(false);
  const [userFoundName,  setUserFoundName]  = useState("");
  const [userErrorMsg,   setUserErrorMsg]   = useState("");

  const numAmount = parseFloat(amount) || 0;

  /* Fetch balance + history */
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setHistLoad(true);
    else setRefreshing(true);
    try {
      const [meRes, histRes] = await Promise.all([
        fetch("/api/user/me"),
        fetch("/api/transactions/transfer"),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        if (d?.balance !== undefined) setBalance(Number(d.balance));
      }
      if (histRes.ok) {
        const d = await histRes.json();
        setHistory(Array.isArray(d) ? d : []);
      }
    } catch {}
    finally { setHistLoad(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Debounced recipient validator
  useEffect(() => {
    if (!recipient.trim()) {
      setUserFoundName("");
      setUserErrorMsg("");
      setSearchingUser(false);
      return;
    }

    setSearchingUser(true);
    setUserErrorMsg("");
    setUserFoundName("");

    const handler = setTimeout(async () => {
      try {
        const r = await fetch(`/api/user/check?q=${encodeURIComponent(recipient.trim())}`);
        const data = await r.json();
        if (data.exists) {
          setUserFoundName(`${data.name} (@${data.username})`);
        } else if (data.isSelf) {
          setUserErrorMsg("You cannot send funds to yourself.");
        } else {
          setUserErrorMsg("User not found.");
        }
      } catch {
        setUserErrorMsg("Validation failed.");
      } finally {
        setSearchingUser(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [recipient]);

  /* Submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError("");

    if (!recipient.trim()) {
      const m = "Recipient email or username is required.";
      setFieldError(m); toast.error(m, { id: "v" }); return;
    }
    if (userErrorMsg) {
      setFieldError(userErrorMsg); toast.error(userErrorMsg, { id: "v" }); return;
    }
    if (numAmount <= 0) {
      const m = "Enter a valid transfer amount.";
      setFieldError(m); toast.error(m, { id: "v" }); return;
    }
    if (numAmount < 50) {
      const m = "Minimum transfer amount is $50.00.";
      setFieldError(m); toast.error(m, { id: "v" }); return;
    }
    if (numAmount > balance) {
      const m = `Insufficient balance. You have ${fmt(balance)}.`;
      setFieldError(m); toast.error(m, { id: "v" }); return;
    }

    setLoading(true);
    const tid = toast.loading("Processing transfer…");
    try {
      const res = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: recipient.trim(), amount: numAmount, note: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Transfer failed. Please try again.", { id: tid });
        setFieldError(data.error || "Transfer failed.");
        return;
      }
      toast.success(`${fmt(numAmount)} sent to ${data.recipient.name} successfully!`, { id: tid, duration: 5000 });
      setBalance(b => b - numAmount);
      setResult(data);
      window.dispatchEvent(new CustomEvent("balance-updated"));
      fetchData(true);
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setRecipient("");
    setAmount("");
    setNote("");
    setFieldError("");
    setUserFoundName("");
    setUserErrorMsg("");
  }

  /* Show success screen */
  if (result) return <SuccessScreen result={result} onReset={handleReset} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Transfer Funds</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Send funds securely to other platform users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)} disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Wallet
          </Link>
        </div>
      </div>

      {/* Available Balance card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
          <DollarSign size={22} className="text-primary-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-0.5">Available Balance</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{fmt(balance)}</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Transfer Form (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <Send size={16} className="text-primary-500" />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 dark:text-white">Send Funds</h2>
                <p className="text-xs text-gray-400">Transfer funds to another user account</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Recipient Email or Username <span className="text-primary-500">*</span>
                </label>
                <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 transition-colors ${
                  userErrorMsg
                    ? "border-red-400 focus-within:border-red-400"
                    : userFoundName
                      ? "border-green-400 focus-within:border-green-400"
                      : "border-gray-200 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500"
                }`}>
                  <User size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => { setRecipient(e.target.value); setFieldError(""); }}
                    placeholder="Enter recipient's email or username"
                    className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
                    autoComplete="off"
                  />
                  {searchingUser && <Loader2 size={14} className="animate-spin text-gray-400" />}
                </div>

                {/* Recipient Validation Response Banner */}
                {userFoundName && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <UserCheck size={13} /> Recipient found: {userFoundName} ✓
                  </div>
                )}
                {userErrorMsg && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500 font-semibold">
                    <UserX size={13} /> {userErrorMsg}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Amount ($) <span className="text-primary-500">*</span>
                </label>
                <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 transition-colors ${
                  fieldError && (fieldError.includes("amount") || fieldError.includes("balance") || fieldError.includes("Minimum"))
                    ? "border-red-400 focus-within:border-red-400"
                    : "border-gray-200 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500"
                }`}>
                  <DollarSign size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="number"
                    min="50"
                    step="0.01"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setFieldError(""); }}
                    placeholder="Enter amount to transfer"
                    className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[50, 100, 500, 1000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(v.toString())}
                      className="px-2.5 py-1 text-[10px] font-black border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-500 rounded-lg"
                    >
                      ${v}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(balance.toFixed(2))}
                    className="px-2.5 py-1 text-[10px] font-black border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-500 rounded-lg ml-auto"
                  >
                    Max
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Minimum transfer amount: $50.00</p>
              </div>

              {/* Note (optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="What is this transfer for?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {fieldError && !userErrorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {fieldError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !recipient || !amount || !!userErrorMsg || searchingUser}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Processing...</>
                ) : (
                  <><Send size={14} /> Send Funds Now</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Sidebar details */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white">How It Works</h3>
            <div className="space-y-3">
              {[
                { s: "1", title: "Enter Recipient Details", desc: "Type in recipient's email address or username on the platform. The system checks validation instantly." },
                { s: "2", title: "Specify Amount & Notes", desc: "Input an amount above $50. Add an optional private memo explaining the payment details." },
                { s: "3", title: "Review Transfer Preview", desc: "Double check user tags and balance check. Click transfer to move funds instantly." },
              ].map(item => (
                <div key={item.s} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{item.s}</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-5">
            <h4 className="font-extrabold text-primary-700 dark:text-primary-400 text-xs flex items-center gap-1"><Info size={13} /> Transfer Security</h4>
            <p className="text-[10px] text-primary-600 dark:text-primary-300 leading-relaxed mt-1">
              Internal transfers are executed instantly and cannot be reversed once processed. Ensure the verified user name check is correct before sending.
            </p>
          </div>
        </div>
      </div>

      {/* Internal Transfer History (if any) */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Internal Transfer History</h3>
            <span className="text-xs text-gray-400 font-bold">{history.length} records</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[300px] overflow-y-auto">
            {history.map(tx => (
              <HistoryRow key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
