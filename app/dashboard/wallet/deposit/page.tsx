"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG as QRCode } from "qrcode.react";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  ArrowRight,
  Info,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";

// REAL CRYPTOCURRENCY WALLET ADDRESSES with fallback defaults
const CRYPTO_WALLETS = {
  BTC: {
    address: process.env.NEXT_PUBLIC_BTC_WALLET || "bc1qfkt5syd6n2dsge3af2drhkmq8w0myqealh7t6",
    name: "Bitcoin",
    network: "Bitcoin Network",
    icon: "₿",
    color: "bg-orange-500"
  },
  ETH: {
    address: process.env.NEXT_PUBLIC_ETH_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17",
    name: "Ethereum", 
    network: "Ethereum Network",
    icon: "Ξ",
    color: "bg-blue-500"
  },
  BNB: {
    address: process.env.NEXT_PUBLIC_BNB_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17",
    name: "BNB",
    network: "BSC Network (Binance Smart Chain)",
    icon: "◆",
    color: "bg-yellow-500"
  },
  XRP: {
    address: process.env.NEXT_PUBLIC_XRP_WALLET || "rs4mroj8yadUceuvCcfjnJMXXyobtNspJ3",
    name: "XRP",
    network: "XRP Network",
    icon: "✕",
    color: "bg-cyan-500"
  },
  DOGE: {
    address: process.env.NEXT_PUBLIC_DOGE_WALLET || "D7vAQaDTQG9U5nvV7JZwNJHoTEQLp8TPVu",
    name: "Dogecoin",
    network: "Dogecoin Network",
    icon: "Ð",
    color: "bg-amber-500"
  },
  SOLANA: {
    address: process.env.NEXT_PUBLIC_SOLANA_WALLET || "CpHS2AK9uLyeHNvTFmDUcnPxpNvHUnfCZ9m4P7Mqw8Sg",
    name: "Solana",
    network: "Solana Network",
    icon: "◎",
    color: "bg-purple-500"
  },
  "USDT-ETH": {
    address: process.env.NEXT_PUBLIC_USDT_ETH_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17",
    name: "USDT (Ethereum)",
    network: "Ethereum Network",
    icon: "₮",
    color: "bg-green-500"
  },
  "USDT-TRX": {
    address: process.env.NEXT_PUBLIC_USDT_TRX_WALLET || "TVyZQzexvLtq8uBC8bcXJykgtRaC4VKW6u",
    name: "USDT (Tron)",
    network: "Tron Network", 
    icon: "₮",
    color: "bg-red-500"
  }
};

function DepositPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get context from URL parameters
  const reason = searchParams?.get('reason');
  const operation = searchParams?.get('operation');
  const requiredAmount = searchParams?.get('required');
  const shortfall = searchParams?.get('shortfall');
  
  const [step, setStep] = useState<"method" | "amount" | "payment" | "proof" | "success">("method");
  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof CRYPTO_WALLETS | "">("");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);

  // Pre-fill amount if coming from insufficient balance redirect
  useEffect(() => {
    if (shortfall && !amount) {
      const suggestedAmount = parseFloat(shortfall);
      if (!isNaN(suggestedAmount) && suggestedAmount > 0) {
        // Suggest at least the shortfall, rounded up to nearest $50
        const roundedAmount = Math.ceil(suggestedAmount / 50) * 50;
        setAmount(Math.max(roundedAmount, 50).toString());
      }
    }
  }, [shortfall, amount]);

  const cryptoWallet = selectedCrypto ? CRYPTO_WALLETS[selectedCrypto] : null;

  const formatCurrency = (amt: number) => {
    return "$" + amt.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  function copyWallet() {
    if (cryptoWallet) {
      navigator.clipboard.writeText(cryptoWallet.address).then(() => {
        setCopied(true);
        toast.success(`${cryptoWallet.name} wallet address copied!`);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  async function handleAmountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }
    if (parsed < 50) {
      setError("Minimum deposit amount is $50.");
      return;
    }

    // NO DATABASE RECORD YET - just proceed to payment display
    setStep("payment");
  }

  async function handleProofSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!proofFile) {
      setError("Please select a proof image");
      return;
    }

    if (!walletAddress || walletAddress.length < 25) {
      setError("Please enter a valid wallet address for refunds");
      return;
    }

    setLoading(true);
    
    // Step 1: Create the transaction record (only now when proof is uploaded)
    try {
      const depositRes = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          method: selectedCrypto === "USDT-ETH" || selectedCrypto === "USDT-TRX" 
            ? "USDT" 
            : selectedCrypto 
        }),
      });

      const depositData = await depositRes.json();
      if (!depositRes.ok) {
        setError(depositData.error || "Failed to create deposit request");
        setLoading(false);
        return;
      }

      const newTransactionId = depositData.transaction.id;
      setTransactionId(newTransactionId);

      // Step 2: Upload the proof for this transaction
      const formData = new FormData();
      formData.append("transactionId", newTransactionId);
      formData.append("proofImage", proofFile);
      formData.append("walletAddress", walletAddress);

      const proofRes = await fetch("/api/deposits/upload-proof", {
        method: "POST",
        body: formData,
      });

      const proofData = await proofRes.json();
      if (!proofRes.ok) {
        setError(proofData.error || "Failed to upload proof");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setStep("success");
    } catch (err) {
      setError("Network error");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: Cryptocurrency Selection ──
  // ── Step 1: Payment Method Selection ──
  if (step === "method") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Choose Payment Method</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select your preferred cryptocurrency for deposit
          </p>
        </div>

        {/* Insufficient Balance Context Banner */}
        {reason === 'insufficient_balance' && operation && requiredAmount && shortfall && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Info size={20} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400 mb-1">
                  Deposit Required
                </h3>
                <p className="text-xs text-red-600 dark:text-red-300 mb-3">
                  You need more funds to complete your <span className="font-bold">{operation}</span>.
                </p>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Required amount:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(parseFloat(requiredAmount))}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-extrabold text-red-600 dark:text-red-400">Amount to deposit:</span>
                    <span className="font-extrabold text-lg text-red-600 dark:text-red-400">{formatCurrency(parseFloat(shortfall))}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                  💡 We've pre-filled the suggested amount for you
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Select Cryptocurrency</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(CRYPTO_WALLETS).map(([key, crypto]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedCrypto(key as keyof typeof CRYPTO_WALLETS);
                  setError("");
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left hover:border-primary-500 ${
                  selectedCrypto === key
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${crypto.color} flex items-center justify-center text-white text-xl font-bold`}>
                    {crypto.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{crypto.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{crypto.network}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (!selectedCrypto) {
                setError("Please select a cryptocurrency method");
                return;
              }
              setStep("amount");
            }}
            disabled={!selectedCrypto}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-colors"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Amount ──
  if (step === "amount") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Deposit {cryptoWallet?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter the amount you want to deposit via {cryptoWallet?.network}
          </p>
          <button
            onClick={() => setStep("method")}
            className="text-sm text-primary-500 hover:text-primary-600 mt-2"
          >
            ← Change payment method
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleAmountSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Amount to Deposit <span className="text-primary-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="50"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {[100, 500, 1000, 5000, 10000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setAmount(v.toString());
                      setError("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      amount === v.toString()
                        ? "bg-primary-500 text-white border-primary-500"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
                    }`}
                  >
                    +${v.toLocaleString()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum: $50.00</p>
            </div>

            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">You will deposit</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Step 3: Payment Display (Show Wallet & "I have paid" button) ──
  if (step === "payment") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Send ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {cryptoWallet?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Send the exact amount to the wallet address below
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-semibold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="text-center space-y-6">
            {/* Crypto Icon */}
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-full ${cryptoWallet?.color} flex items-center justify-center text-white text-2xl font-bold`}>
                {cryptoWallet?.icon}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {cryptoWallet?.name} Payment
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Send exactly <span className="font-bold text-primary-500">${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> worth of {cryptoWallet?.name}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <QRCode
                value={cryptoWallet?.address || ""}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            {/* Wallet Address */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {cryptoWallet?.name} Wallet Address
              </p>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                <code className="flex-1 text-gray-900 dark:text-green-400 text-sm font-mono break-all">
                  {cryptoWallet?.address}
                </code>
                <button
                  onClick={copyWallet}
                  className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex-shrink-0"
                  title="Copy wallet address"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copied && <p className="text-sm text-green-500 mt-2">✓ Address copied to clipboard!</p>}
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>Payment Instructions:</strong>
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 text-left">
                <li>• Send exactly ${parseFloat(amount).toFixed(2)} worth of {cryptoWallet?.name}</li>
                <li>• Use the {cryptoWallet?.network}</li>
                <li>• Double-check the wallet address before sending</li>
                <li>• Keep your transaction receipt/screenshot</li>
              </ul>
            </div>

            {/* "I have paid" Button */}
            <button
              onClick={() => setStep("proof")}
              className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg rounded-xl transition-colors shadow-md"
            >
              <CheckCircle2 size={20} />
              I have paid - Upload Proof
            </button>

            <p className="text-xs text-gray-400">
              Click the button above after you've completed the payment to upload your proof
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 4: Upload Proof ──
  if (step === "proof") {
    return (
      <>
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 w-full max-w-md p-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Invalid Payment Proof</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                {error || "The uploaded image does not appear to contain valid transaction details. Please upload a clear screenshot showing the payment status, TXID, or recipient wallet."}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full py-3 bg-red-500 hover:bg-red-650 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-red-500/20"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Upload Payment Proof
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload screenshot of your ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {cryptoWallet?.name} payment
          </p>
          <button
            onClick={() => setStep("payment")}
            className="text-sm text-primary-500 hover:text-primary-600 mt-2"
          >
            ← Back to payment details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${cryptoWallet?.color} flex items-center justify-center text-white text-sm font-bold`}>
                {cryptoWallet?.icon}
              </div>
              Payment Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Cryptocurrency:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{cryptoWallet?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Network:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{cryptoWallet?.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <span className="font-bold text-primary-500">${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sent to wallet:</p>
                <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-900 dark:text-gray-300 block mt-1 break-all">
                  {cryptoWallet?.address}
                </code>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3">
                Your screenshot should show:
              </p>
              <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Transaction hash/ID
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Amount: ${parseFloat(amount).toFixed(2)}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Recipient address matches above
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Transaction confirmation status
                </li>
              </ul>
            </div>
          </div>

          {/* Upload Proof Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upload Proof</h2>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-semibold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleProofSubmit} className="space-y-4">
              {/* Your Wallet Address */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Your {cryptoWallet?.name} Wallet (for refunds) <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={`Your ${cryptoWallet?.name} address for potential refunds`}
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  We'll use this address to send refunds if there are any issues
                </p>
              </div>

              {/* Proof Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Payment Proof Screenshot <span className="text-primary-500">*</span>
                </label>
                <div className="relative mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    proofFile 
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20" 
                      : "border-gray-300 dark:border-gray-600 hover:border-primary-400"
                  }`}>
                    <Upload size={32} className={`mx-auto mb-2 ${proofFile ? "text-green-500" : "text-gray-400"}`} />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {proofFile ? `✓ ${proofFile.name}` : "Click or drag screenshot here"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, or WebP (Max 5MB)
                    </p>
                  </div>
                </div>
                {/* Image Live Preview */}
                {proofFile && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-900/60 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        src={URL.createObjectURL(proofFile)}
                        alt="Receipt preview"
                        className="w-full h-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL((e.target as any).src)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{proofFile.name}</p>
                      <p className="text-[10px] text-gray-400">{(proofFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !proofFile || !walletAddress}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading Proof...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Submit Payment Proof
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

  // ── Step 5: Success ──

  // ── Step 3: Success ──
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
            Payment Proof Submitted!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Your {cryptoWallet?.name} payment proof for{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>{" "}
            has been submitted successfully.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Our admin team will verify your {cryptoWallet?.name} payment and credit your balance within 2-4 hours.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setStep("method");
                setSelectedCrypto("");
                setAmount("");
                setWalletAddress("");
                setProofFile(null);
                setError("");
                setTransactionId("");
                setCopied(false);
              }}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Make Another Deposit
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default function DepositPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading deposit window...</p>
        </div>
      </div>
    }>
      <DepositPageContent />
    </Suspense>
  );
}
