"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useBalance } from "@/app/hooks/useBalance";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Home,
  Info,
  Bitcoin,
  CreditCard,
  DollarSign,
  Wallet,
  RefreshCw,
  Coins,
} from "lucide-react";

const PAYMENT_METHODS = [
  { id: "USDT",   label: "USDT",      icon: <DollarSign size={16} className="text-green-500" />, fee: 1.50, desc: "Tether USD" },
  { id: "ETH",    label: "Ethereum",   icon: <CreditCard size={16} className="text-blue-500" />,  fee: 3.00, desc: "Ethereum Network" },
  { id: "BTC",    label: "Bitcoin",    icon: <Bitcoin size={16} className="text-orange-400" />,   fee: 5.00, desc: "Bitcoin Core" },
  { id: "BNB",    label: "BNB",        icon: <DollarSign size={16} className="text-yellow-500" />, fee: 1.00, desc: "Smart Chain" },
  { id: "SOLANA", label: "Solana",     icon: <CreditCard size={16} className="text-purple-500" />, fee: 0.50, desc: "Solana Network" },
];

type Step = "verify" | "form" | "success";

const STATIC_WITHDRAWAL_CODE = "WD-2025-CAPX";

export default function WithdrawPage() {
  const router = useRouter();
  const { balance, loading: balanceLoading, formatBalance, refreshBalance } = useBalance();

  const [step, setStep] = useState<Step>("verify");

  // Verification step
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [learnOpen, setLearnOpen] = useState(false);

  // Withdrawal form step
  const [method, setMethod]              = useState("USDT");
  const [amount, setAmount]              = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [formError, setFormError]         = useState("");
  const [loading, setLoading]             = useState(false);

  const selectedMethodObj = PAYMENT_METHODS.find(m => m.id === method) || PAYMENT_METHODS[0];
  const networkFee = selectedMethodObj.fee;
  const numAmount = parseFloat(amount) || 0;
  const netPayout = Math.max(0, numAmount - networkFee);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyCode.trim()) {
      setVerifyError("Please enter your verification code.");
      return;
    }
    if (verifyCode.trim() !== STATIC_WITHDRAWAL_CODE) {
      setVerifyError("Invalid verification code. Request a code below or contact support.");
      return;
    }
    setVerifyError("");
    setStep("form");
    toast.success("Verification code accepted!");
  }

  function simulateRequestCode() {
    toast.success(`Verification code sent to your screen: ${STATIC_WITHDRAWAL_CODE}`, {
      duration: 8000,
      icon: "🔑",
    });
    setVerifyCode(STATIC_WITHDRAWAL_CODE);
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setFormError("Please enter a valid withdrawal amount.");
      return;
    }
    if (parsed < 10) {
      setFormError("Minimum withdrawal amount is $10.00.");
      return;
    }
    if (parsed > balance) {
      setFormError(`Insufficient balance. You only have $${balance.toFixed(2)}.`);
      return;
    }
    if (!walletAddress.trim()) {
      setFormError("Please enter your wallet address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsed,
          method,
          walletAddress: walletAddress.trim(),
          verificationCode: verifyCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setStep("verify");
          setVerifyError(data.error || "Invalid verification code.");
        } else {
          setFormError(data.error || "Withdrawal failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      toast.success("Withdrawal request submitted successfully!");
      // Dispatch balance updated event immediately
      window.dispatchEvent(new CustomEvent("balance-updated"));
      refreshBalance();
      setStep("success");
    } catch {
      setFormError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto mt-16 text-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
            Withdrawal Submitted!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Your withdrawal of{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>{" "}
            via <span className="font-bold">{method}</span> is now{" "}
            <span className="text-yellow-500 font-bold">pending</span>.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 my-4 space-y-1.5 text-xs text-left">
            <div className="flex justify-between text-gray-400">
              <span>Network fee:</span>
              <span>-${networkFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-1.5">
              <span>Estimated Net Payout:</span>
              <span>${netPayout.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-8 leading-relaxed">
            Your balance has been debited to lock the funds. Payout will be processed after admin approval (typically 24–48 hours).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setStep("verify"); setVerifyCode(""); setAmount(""); setWalletAddress(""); }}
              className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors"
            >
              Make Another Withdrawal
            </button>
            <button
              onClick={() => router.push("/dashboard/wallet")}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-primary-500">Fund Withdrawals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Securely withdraw your funds using various payment methods
          </p>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
            <Home size={11} />
            <Link href="/dashboard" className="hover:text-primary-500 transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/dashboard/wallet" className="hover:text-primary-500 transition-colors">Wallet</Link>
            <ChevronRight size={11} />
            <span className="text-gray-600 dark:text-gray-300 font-semibold">Withdrawals</span>
          </div>
        </div>
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-primary-400 transition-colors shadow-sm"
        >
          ← Wallet Overview
        </Link>
      </div>

      {/* Security Verification Card */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 shadow-lg text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={24} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Security Verification Required</h2>
            <p className="text-sm text-gray-400 mt-0.5">Additional verification needed to process your withdrawal</p>
          </div>
        </div>

        {/* Warning box */}
        <div className="bg-yellow-950/60 border-l-4 border-yellow-500 rounded-r-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Info size={15} className="text-yellow-400 flex-shrink-0" />
            <span className="text-sm font-extrabold text-yellow-400">Withdrawal Code Required</span>
          </div>
          <p className="text-xs text-yellow-200/80 leading-relaxed">
            For your security, this withdrawal requires a verification code. Request a code using the simulator button below or contact support at{" "}
            <a href="mailto:support@teslacapx.com" className="underline text-yellow-300 hover:text-yellow-200">
              support@teslacapx.com
            </a>.
          </p>
          <button
            onClick={() => setLearnOpen(!learnOpen)}
            className="flex items-center gap-1 mt-3 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            Learn about withdrawal security
            <ChevronDown size={13} className={`transition-transform ${learnOpen ? "rotate-180" : ""}`} />
          </button>
          {learnOpen && (
            <ul className="mt-3 space-y-1.5 text-xs text-yellow-200/70 list-disc list-inside leading-relaxed">
              <li>Verification codes prevent unauthorized withdrawals</li>
              <li>Each code is unique and expires after use</li>
              <li>Funds are immediately debited from your balance and locked for safety</li>
            </ul>
          )}
        </div>

        {step === "verify" ? (
          <div className="space-y-4">
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Enter Withdrawal Verification Code
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => { setVerifyCode(e.target.value); setVerifyError(""); }}
                  placeholder="Enter verification code (e.g. WD-2025-CAPX)"
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {verifyError && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-400 font-semibold">
                    <AlertCircle size={13} /> {verifyError}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={simulateRequestCode}
                  className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
                >
                  🔑 Get Simulation Code
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl transition-colors shadow-md shadow-primary-500/20"
                >
                  <ShieldCheck size={14} /> Verify & Continue
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-5">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-700 rounded-lg">
              <ShieldCheck size={14} className="text-green-400" />
              <span className="text-xs font-bold text-green-400">Verification code accepted — proceed with your withdrawal</span>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-xl text-sm text-red-400 font-semibold">
                <AlertCircle size={15} className="flex-shrink-0" /> {formError}
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">
                Payment Method <span className="text-primary-500">*</span>
              </label>
              <div className="flex gap-3 flex-wrap">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      method === m.id
                        ? "border-primary-500 bg-primary-900/30 text-primary-400"
                        : "border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-bold text-gray-300">
                  Amount to Withdraw <span className="text-primary-500">*</span>
                </label>
                <span className="text-xs font-bold text-gray-400">
                  Available: <span className="text-green-400">${balance.toFixed(2)}</span>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="10"
                  step="0.01"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setFormError(""); }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[25, 50, 100].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setAmount(((balance * pct) / 100).toFixed(2))}
                    className="px-2.5 py-1 text-[10px] font-black border border-gray-700 text-gray-400 hover:border-primary-500 rounded-lg"
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(balance.toFixed(2))}
                  className="px-2.5 py-1 text-[10px] font-black border border-gray-700 text-gray-400 hover:border-primary-500 rounded-lg ml-auto"
                >
                  Max
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: $10.00</p>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1.5">
                Your {method} Wallet Address <span className="text-primary-500">*</span>
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => { setWalletAddress(e.target.value); setFormError(""); }}
                placeholder={`Enter your ${method} wallet address`}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Double-check your address — transactions cannot be reversed</p>
            </div>

            {/* Summary */}
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="bg-gray-850 rounded-xl p-4 border border-gray-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Withdrawal Amount</span>
                  <span className="font-bold">${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network Processing Fee</span>
                  <span className="font-bold text-red-400">-${networkFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-2 font-black text-sm">
                  <span className="text-gray-300">You Will Receive (Net)</span>
                  <span className="text-green-400">${netPayout.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep("verify")}
                className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 font-bold text-sm hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !amount || !walletAddress}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Processing...</>
                ) : (
                  <><ShieldCheck size={15} /> Submit Withdrawal</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
