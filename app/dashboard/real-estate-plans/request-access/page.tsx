"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home, ChevronRight, Building2, Upload, Loader2, 
  AlertCircle, CheckCircle2, DollarSign, Shield, Lock
} from "lucide-react";

const REAL_ESTATE_PLANS = [
  { name: "Property Starter", price: 500, description: "Entry-level real estate investment" },
  { name: "Property Growth", price: 1000, description: "Growing your real estate portfolio" },
  { name: "Property Premium", price: 5000, description: "Premium property investments" },
  { name: "Property Elite", price: 10000, description: "Elite real estate opportunities" },
  { name: "REIT Portfolio", price: 25000, description: "Diversified REIT portfolio" },
  { name: "Luxury Estates", price: 50000, description: "Luxury real estate investments" },
];

const PAYMENT_METHODS = [
  { id: "BTC", name: "Bitcoin (BTC)", address: process.env.NEXT_PUBLIC_BTC_WALLET || "bc1qfkt5syd6n2dsge3af2drhkmq8w0myqealh7t6" },
  { id: "ETH", name: "Ethereum (ETH)", address: process.env.NEXT_PUBLIC_ETH_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17" },
  { id: "USDT", name: "Tether (USDT-TRC20)", address: process.env.NEXT_PUBLIC_USDT_TRX_WALLET || "TVyZQzexvLtq8uBC8bcXJykgtRaC4VKW6u" },
  { id: "BNB", name: "Binance Coin (BNB-BSC)", address: process.env.NEXT_PUBLIC_BNB_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17" },
  { id: "XRP", name: "Ripple (XRP)", address: process.env.NEXT_PUBLIC_XRP_WALLET || "rs4mroj8yadUceuvCcfjnJMXXyobtNspJ3" },
  { id: "DOGE", name: "Dogecoin (DOGE)", address: process.env.NEXT_PUBLIC_DOGE_WALLET || "D7vAQaDTQG9U5nvV7JZwNJHoTEQLp8TPVu" },
  { id: "SOLANA", name: "Solana (SOL)", address: process.env.NEXT_PUBLIC_SOLANA_WALLET || "CpHS2AK9uLyeHNvTFmDUcnPxpNvHUnfCZ9m4P7Mqw8Sg" },
];

export default function RequestAccessPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedPlanData = REAL_ESTATE_PLANS.find(p => p.name === selectedPlan);
  const selectedPayment = PAYMENT_METHODS.find(m => m.id === paymentMethod);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setProofFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedPlan || !paymentMethod || !walletAddress || !proofFile) {
      setError("Please fill all fields and upload payment proof");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload proof image
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("type", "payment-proof");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload payment proof");
      }

      const uploadData = await uploadRes.json();

      // Submit plan request
      const res = await fetch("/api/user/real-estate-plans/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: selectedPlan,
          paymentMethod,
          walletAddress,
          proofUrl: uploadData.url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/real-estate-plans");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
            Request Submitted Successfully!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your real estate plan request has been submitted. Our admin will review your payment proof and approve access within 24 hours.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            Redirecting to plans...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Home size={11} />
        <Link href="/dashboard" className="hover:text-primary-500 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <Link href="/dashboard/buy-plan" className="hover:text-primary-500 transition-colors">Investment Plans</Link>
        <ChevronRight size={11} />
        <Link href="/dashboard/real-estate-plans" className="hover:text-primary-500 transition-colors">Real Estate</Link>
        <ChevronRight size={11} />
        <span className="text-gray-600 dark:text-gray-300 font-semibold">Request Access</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Building2 size={22} className="text-primary-500" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-primary-500">Request Real Estate Access</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Purchase a real estate plan to unlock access to premium property investments
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Shield size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Secure Payment Verification</p>
          <p className="text-blue-700 dark:text-blue-300 text-xs">
            All payments are manually verified by our admin team. Upload clear proof of payment to ensure quick approval.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Step 1: Select Plan */}
        <div>
          <label className="block text-sm font-extrabold text-gray-900 dark:text-white mb-3">
            Step 1: Select Real Estate Plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REAL_ESTATE_PLANS.map((plan) => (
              <button
                key={plan.name}
                type="button"
                onClick={() => setSelectedPlan(plan.name)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPlan === plan.name
                    ? "border-primary-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-extrabold text-gray-900 dark:text-white">{plan.name}</h3>
                  {selectedPlan === plan.name && (
                    <CheckCircle2 size={18} className="text-primary-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{plan.description}</p>
                <p className="text-lg font-black text-primary-500">${plan.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Payment Method */}
        {selectedPlan && (
          <div>
            <label className="block text-sm font-extrabold text-gray-900 dark:text-white mb-3">
              Step 2: Select Payment Method
            </label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id
                      ? "border-primary-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{method.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click to reveal address</p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle2 size={18} className="text-primary-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Payment Address */}
        {selectedPayment && (
          <div>
            <label className="block text-sm font-extrabold text-gray-900 dark:text-white mb-3">
              Step 3: Send Payment to This Address
            </label>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount to Send</p>
                <p className="text-2xl font-black text-primary-500">
                  ${selectedPlanData?.price.toLocaleString()} USD
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{selectedPayment.name} Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 dark:text-white break-all">
                    {selectedPayment.address}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedPayment.address)}
                    className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Your Wallet */}
        {selectedPayment && (
          <div>
            <label className="block text-sm font-extrabold text-gray-900 dark:text-white mb-2">
              Step 4: Your Wallet Address
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Enter your {selectedPayment.name} wallet address (for refunds if needed)
            </p>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder={`Your ${selectedPayment.name} wallet address`}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        )}

        {/* Step 5: Upload Proof */}
        {walletAddress && (
          <div>
            <label className="block text-sm font-extrabold text-gray-900 dark:text-white mb-2">
              Step 5: Upload Payment Proof
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Upload a screenshot of your payment transaction (PNG, JPG - Max 5MB)
            </p>
            
            {!proofPreview ? (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                  <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Click to upload payment proof
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={proofPreview}
                  alt="Payment proof"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProofFile(null);
                    setProofPreview("");
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedPlan || !paymentMethod || !walletAddress || !proofFile}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-colors shadow-md"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting Request...
            </>
          ) : (
            <>
              <Lock size={18} />
              Submit Request for Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}
