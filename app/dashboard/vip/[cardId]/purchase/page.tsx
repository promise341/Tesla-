"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Copy, Upload, Loader2, AlertCircle,
  DollarSign, XCircle, Landmark, Wallet, Eye, ShieldCheck,
  Award, Clock, Check
} from "lucide-react";

const VIP_CARDS_DATA: Record<string, any> = {
  silver: {
    id: "silver",
    name: "Tesla Silver Card",
    price: 499,
    duration: "1 Month",
    validity: "1 Month validity period",
    img: "/siliver.jpg",
    benefits: 5,
    tagline: "Essential perks for smart investors starting their journey.",
  },
  gold: {
    id: "gold",
    name: "Tesla Gold Card",
    price: 1499,
    duration: "3 Months",
    validity: "3 Months validity period",
    img: "/gold.png",
    benefits: 5,
    tagline: "Enhanced benefits for serious traders seeking an edge.",
  },
  platinum: {
    id: "platinum",
    name: "Tesla Platinum Card",
    price: 4999,
    duration: "6 Months",
    validity: "6 Months validity period",
    img: "/Platinum Badge.png",
    benefits: 5,
    tagline: "Elite-tier access with maximum trading advantages.",
  },
  diamond: {
    id: "diamond",
    name: "Tesla Diamond Card",
    price: 9999,
    duration: "12 Months",
    validity: "12 Months validity period",
    img: "/diamonds .png",
    benefits: 5,
    tagline: "The ultimate annual membership for elite investors.",
  },
  black: {
    id: "black",
    name: "Tesla Black Card",
    price: 19999,
    duration: "12 Months",
    validity: "12 Months validity period",
    img: "/Black Badge.png",
    benefits: 5,
    tagline: "Invite-only prestige membership with unparalleled privileges.",
  },
  elite: {
    id: "elite",
    name: "Tesla Elite Card",
    price: 49999,
    duration: "Lifetime",
    validity: "Lifetime access",
    img: "/Elite Badge.png",
    benefits: 5,
    tagline: "Lifetime membership. The apex of Teslaxipo membership.",
  },
};

const PAYMENT_METHODS = [
  { id: "BALANCE", name: "Account Balance", desc: "Pay instantly from account balance", address: "N/A" },
  { id: "BTC", name: "Bitcoin", desc: "Cryptocurrency Payment", address: process.env.NEXT_PUBLIC_BTC_WALLET || "bc1qfkt5syd6n2dsge3af2drhkmq8w0myqealh7t6" },
  { id: "ETH", name: "Ethereum", desc: "Cryptocurrency Payment", address: process.env.NEXT_PUBLIC_ETH_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17" },
  { id: "USDT", name: "USDT (TRC20)", desc: "Cryptocurrency Payment", address: process.env.NEXT_PUBLIC_USDT_TRX_WALLET || "TVyZQzexvLtq8uBC8bcXJykgtRaC4VKW6u" },
];

export default function VIPCardPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.cardId as string;
  const card = VIP_CARDS_DATA[cardId];

  const [paymentMethod, setPaymentMethod] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.balance !== undefined) setUserBalance(Number(d.balance));
        setBalanceLoaded(true);
      })
      .catch(() => setBalanceLoaded(true));
  }, []);

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">VIP Card Not Found</h2>
        <Link
          href="/dashboard/vip"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors"
        >
          <ArrowLeft size={14} /> Back to VIP Cards
        </Link>
      </div>
    );
  }

  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
  const hasEnoughBalance = userBalance >= card.price;
  const shortfall = card.price - userBalance;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setProofFile(file);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSubmit() {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    const isBalancePayment = paymentMethod === "BALANCE";

    if (isBalancePayment) {
      if (!hasEnoughBalance) {
        router.push(`/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent(card.name)}&required=${card.price.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`);
        return;
      }
    } else {
      if (!proofFile) {
        setError("Please upload payment proof screenshot");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      let finalProofUrl = "N/A";

      if (!isBalancePayment) {
        // Upload proof
        const formData = new FormData();
        formData.append("file", proofFile!);
        formData.append("type", "vip-payment-proof");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || "Failed to validate payment proof screenshot");
        }

        const uploadData = await uploadRes.json();
        finalProofUrl = uploadData.url;
      }

      // Submit VIP purchase
      const res = await fetch("/api/vip/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          cardName: card.name,
          price: card.price,
          duration: card.duration,
          paymentMethod,
          proofUrl: finalProofUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Purchase processing failed");
      }

      // Redirect to my memberships
      router.push("/dashboard/vip/my-memberships?success=true");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      if (paymentMethod !== "BALANCE") {
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* OCR Validation Error Dialog */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 w-full max-w-md p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Invalid Payment Proof</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              {error || "The uploaded image does not appear to contain valid transaction credentials. Please upload a clear screenshot of the transfer details."}
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

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/vip`}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft size={15} /> Back to VIP Tiers
          </Link>
        </div>

        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-950 dark:text-white">Purchase Membership</h1>
          <p className="text-sm text-gray-400 mt-1">Unlock priority access, AI trade signals, and premium tier benefits.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main selection forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Choose payment */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 p-6 shadow-sm space-y-4">
              <h2 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                <Award size={18} className="text-primary-500" />
                Choose Payment Method
              </h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => { setPaymentMethod(method.id); setError(""); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? "border-primary-500 bg-red-50/10 dark:bg-red-950/10"
                        : "border-gray-250 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === method.id ? "border-primary-500" : "border-gray-400"
                        }`}
                      >
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                          {method.id === "BALANCE" ? <Landmark size={15} className="text-primary-500" /> : <Wallet size={15} className="text-primary-500" />}
                          {method.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
                      </div>
                      {method.id === "BALANCE" && balanceLoaded && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Balance</p>
                          <p className={`text-sm font-black ${hasEnoughBalance ? "text-green-500" : "text-red-500"}`}>
                            ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Crypto wallet receipt instructions */}
              {selectedPayment && paymentMethod !== "BALANCE" && (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="bg-white p-3 rounded-xl border border-gray-255 shadow-sm flex-shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(selectedPayment.address)}`} 
                        alt="QR Code" 
                        className="w-[110px] h-[110px] object-contain mx-auto"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                        Send exactly ${card.price.toLocaleString()} to this {selectedPayment.name} address:
                      </h3>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 px-3 py-2 rounded-xl text-xs text-green-500 font-mono break-all leading-relaxed select-all">
                          {selectedPayment.address}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedPayment.address)}
                          className="px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 border border-gray-200 dark:border-gray-755 rounded-xl text-gray-500 hover:text-primary-500 transition-colors shadow-sm"
                        >
                          {copied ? <span className="text-xs text-green-500 font-bold">Copied</span> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400">Standard confirmation time is 10–30 minutes depending on network load.</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-750 pt-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Transfer Confirmation Screenshot *</label>
                    {!proofPreview ? (
                      <label className="block cursor-pointer">
                        <div className="border border-dashed border-gray-300 dark:border-gray-650 hover:border-primary-500 rounded-xl p-6 text-center bg-white dark:bg-gray-800 transition-colors">
                          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-xs font-bold text-gray-400">Click to upload payment receipt image</p>
                          <p className="text-[10px] text-gray-400 mt-1">PNG, JPG formats supported up to 5MB</p>
                        </div>
                        <input type="file" required accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-750 rounded-xl">
                        <img src={proofPreview} alt="Screenshot proof preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        <span className="text-xs font-bold text-gray-500 truncate flex-1">{proofFile?.name}</span>
                        <button
                          type="button"
                          onClick={() => { setProofFile(null); setProofPreview(""); }}
                          className="p-1 hover:bg-gray-100 rounded-lg text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary details */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 p-6 shadow-sm space-y-5 sticky top-6">
              <h2 className="font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Membership Order</h2>

              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 relative">
                <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/45" />
                <span className="absolute bottom-3 left-3 text-white font-black tracking-widest text-lg bg-black/40 px-2 py-0.5 rounded uppercase">
                  {card.id}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug">{card.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{card.tagline}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration Period</span>
                  <span className="text-gray-900 dark:text-white">{card.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxes & Admin Fees</span>
                  <span className="text-gray-900 dark:text-white">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-white">Total Cost</span>
                  <span className="text-primary-500">${card.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Error Alert */}
              {error && !showErrorModal && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-650 dark:text-red-400 font-semibold">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !paymentMethod || (paymentMethod !== "BALANCE" && !proofFile)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-primary-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Activating...
                  </>
                ) : paymentMethod === "BALANCE" && !hasEnoughBalance ? (
                  <>
                    <DollarSign size={16} /> Deposit Funds to Unlock
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Confirm Activation
                  </>
                )}
              </button>

              {/* Balance status alert */}
              {paymentMethod === "BALANCE" && !hasEnoughBalance && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-250 dark:border-yellow-900/50 rounded-xl flex items-start gap-2 text-[10px] text-yellow-800 dark:text-yellow-400">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Insufficient Account Balance</p>
                    <p className="mt-0.5">Clicking the deposit button redirects you to deposit ${shortfall.toLocaleString(undefined, { minimumFractionDigits: 2 })} to finish card registration.</p>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-2 text-[10px] text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-green-500" />
                  Verified secure checkout payment
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-green-500" />
                  Activates within 10–30 mins of verification
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
