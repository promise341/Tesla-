"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload, Loader2, CheckCircle2, AlertCircle, Copy, ArrowRight, Wallet, DollarSign, X, ShoppingBag, Landmark, ArrowLeft
} from "lucide-react";

const CARS_CATALOG: Record<string, { name: string; price: number; img: string; subtitle: string }> = {
  "cyber-truck":                { name: "Cyber Truck",              price: 91500.00,   img: "/images/cars/cybertruck_exterior.png",  subtitle: "2025 • Stainless Steel • Tri-Motor AWD" },
  "cybercab":                   { name: "Tesla Cybercab",           price: 29990.00,   img: "/images/cars/cybercab_exterior.png",    subtitle: "2026 • Brushed Gold/Silver • Robotaxi" },
  "tesla-model-3-long-range-1": { name: "Tesla Model 3 Long Range", price: 42490.00,   img: "/images/cars/model3_exterior.png",       subtitle: "2025 • Deep Blue • Dual Motor AWD" },
  "tesla-model-y":              { name: "Tesla Model Y Performance",price: 43489.96,   img: "/images/cars/modely_exterior.png",       subtitle: "2025 • Solid Black • Dual Motor AWD" },
  "tesla-roadster":             { name: "Tesla Roadster Supercar",  price: 199499.96,  img: "/images/cars/roadster_exterior.png",     subtitle: "2026 • Roadster Red • SpaceX Package" },
  "tesla-model-x-2":            { name: "Tesla Model X Plaid",       price: 87700.00,   img: "/images/cars/modelx_falcon_doors.png",   subtitle: "2025 • Pearl White • Falcon Wing Doors" },
  "tesla-model-s-plaid":        { name: "Tesla Model S Plaid",       price: 89990.00,   img: "/images/cars/models_exterior.png",       subtitle: "2025 • Ultra Red • 1,020 hp Plaid" },
  "tesla-optimus":              { name: "Tesla Optimus Bot",        price: 28998.98,   img: "/images/cars/optimus_bot.png",          subtitle: "2025 • Matte Black & White • Humanoid AI" },
  "tesla-semi":                 { name: "Tesla Semi Truck",         price: 28500.02,   img: "/images/cars/semi_exterior.png",         subtitle: "2026 • Arctic White • Class 8 Electric" },
  "tesla-powerwall":            { name: "Tesla Powerwall",          price: 11000.00,   img: "https://teslacapx.com/dash/cars/10/69c404f5e8dc2.png",  subtitle: "2025 • Classic White" },
  "tesla-wall-connector":       { name: "Tesla Wall Connector",     price: 498.97,     img: "https://teslacapx.com/dash/cars/11/69c40685e0fac.jpg",  subtitle: "2025 • Metallic Silver" },
};

const CRYPTO_METHODS = [
  { id: "BTC",    name: "Bitcoin",  address: process.env.NEXT_PUBLIC_BTC_WALLET || "bc1qfkt5syd6n2dsge3af2drhkmq8w0myqealh7t6" },
  { id: "ETH",    name: "Ethereum", address: process.env.NEXT_PUBLIC_ETH_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17" },
  { id: "USDT",   name: "USDT (TRC20)", address: process.env.NEXT_PUBLIC_USDT_TRX_WALLET || "TVyZQzexvLtq8uBC8bcXJykgtRaC4VKW6u" },
  { id: "BNB",    name: "BNB (BSC)", address: process.env.NEXT_PUBLIC_BNB_WALLET || "0x79De6d50cC9D9fB9A5926b6b4037570650DF1a17" },
  { id: "XRP",    name: "XRP",      address: process.env.NEXT_PUBLIC_XRP_WALLET || "rs4mroj8yadUceuvCcfjnJMXXyobtNspJ3" },
  { id: "DOGE",   name: "Dogecoin", address: process.env.NEXT_PUBLIC_DOGE_WALLET || "D7vAQaDTQG9U5nvV7JZwNJHoTEQLp8TPVu" },
  { id: "SOLANA", name: "Solana",   address: process.env.NEXT_PUBLIC_SOLANA_WALLET || "CpHS2AK9uLyeHNvTFmDUcnPxpNvHUnfCZ9m4P7Mqw8Sg" },
];

export default function CarCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params?.carId as string;
  const car = CARS_CATALOG[carId];

  const [userBalance, setUserBalance] = useState(0);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"BALANCE" | "BTC" | "ETH" | "USDT" | "BNB" | "SOLANA">("BALANCE");
  
  // Checkout details form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  
  // Crypto payment proof state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch user details to pre-fill email/name and get balance
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.balance !== undefined) setUserBalance(Number(d.balance));
        if (d?.email) setEmail(d.email);
        if (d?.name) setFullName(d.name);
        setBalanceLoaded(true);
      })
      .catch(() => setBalanceLoaded(true));
  }, []);

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Vehicle Not Found</h2>
        <p className="text-sm text-gray-400">The vehicle you are trying to order does not exist in our catalog.</p>
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors"
        >
          <ArrowLeft size={14} /> Back to Inventory
        </Link>
      </div>
    );
  }

  const selectedCrypto = CRYPTO_METHODS.find((c) => c.id === paymentMethod);
  const shortfall = car.price - userBalance;
  const hasEnoughBalance = userBalance >= car.price;

  function copyWallet() {
    if (selectedCrypto) {
      navigator.clipboard.writeText(selectedCrypto.address).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (paymentMethod === "BALANCE" && !hasEnoughBalance) {
      // Redirect to deposit page
      router.push(
        `/dashboard/wallet/deposit?reason=insufficient_balance&operation=${encodeURIComponent("car purchase (" + car.name + ")")}&required=${car.price.toFixed(2)}&shortfall=${shortfall.toFixed(2)}`
      );
      setLoading(false);
      return;
    }

    try {
      let finalProofUrl = "N/A";
      
      if (paymentMethod !== "BALANCE") {
        if (!proofFile) {
          setError("Please upload payment proof screenshot");
          setLoading(false);
          return;
        }
        if (!walletAddress || walletAddress.length < 25) {
          setError("Please enter your wallet address for refund/verification purposes");
          setLoading(false);
          return;
        }

        // Upload image first
        const uploadForm = new FormData();
        uploadForm.append("file", proofFile);
        uploadForm.append("type", "car-payment-proof");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || "Failed to upload payment proof screenshot");
        }

        const uploadData = await uploadRes.json();
        finalProofUrl = uploadData.url;
      }

      // Call order API
      const res = await fetch("/api/cars/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId,
          carName: car.name,
          price: car.price,
          fullName,
          email,
          phone,
          company,
          street,
          city,
          state,
          postalCode,
          country,
          paymentMethod,
          walletAddress: paymentMethod === "BALANCE" ? "N/A" : walletAddress,
          proofUrl: finalProofUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order submission failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/35 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={44} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Thank you for your order. Your purchase request for a new <span className="font-extrabold text-gray-900 dark:text-white">{car.name}</span> has been registered successfully.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price</span>
            <span className="font-bold text-gray-950 dark:text-white">${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Payment Mode</span>
            <span className="font-bold text-gray-950 dark:text-white">{paymentMethod === "BALANCE" ? "Account Balance (Instant)" : `Crypto (${paymentMethod})`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className={`font-bold ${paymentMethod === "BALANCE" ? "text-green-500" : "text-yellow-500"}`}>
              {paymentMethod === "BALANCE" ? "APPROVED" : "AWAITING ADMIN APPROVAL"}
            </span>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard/inventory"
            className="px-5 py-3 border border-gray-300 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-350 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Browse Inventory
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/10"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
      <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/dashboard/inventory/${carId}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Vehicle
      </Link>

      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-950 dark:text-white">Complete Your Order</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide delivery info and choose your payment method.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <ShoppingBag size={18} className="text-primary-500" />
              Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Tesla Motors"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="123 Elon Musk Way"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Austin"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="TX"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="78725"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <Wallet size={18} className="text-primary-500" />
              Select Payment Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pay with Balance Option */}
              <button
                type="button"
                onClick={() => { setPaymentMethod("BALANCE"); setError(""); }}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  paymentMethod === "BALANCE"
                    ? "border-primary-500 bg-red-50/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Landmark size={16} className="text-primary-500" />
                    Account Balance
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "BALANCE" ? "border-primary-500" : "border-gray-400"}`}>
                    {paymentMethod === "BALANCE" && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">Pay instantly from your account balance.</p>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-400">Available:</span>
                  <span className={hasEnoughBalance ? "text-green-500 font-extrabold" : "text-red-500 font-extrabold"}>
                    ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>

              {/* Pay with Crypto Options */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cryptocurrency Transfer</p>
                <div className="grid grid-cols-2 gap-2">
                  {CRYPTO_METHODS.map((crypto) => (
                    <button
                      key={crypto.id}
                      type="button"
                      onClick={() => { setPaymentMethod(crypto.id as any); setError(""); }}
                      className={`py-3 px-4 rounded-xl border-2 text-center font-bold text-xs transition-all ${
                        paymentMethod === crypto.id
                          ? "border-primary-500 bg-red-50/10 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-450 hover:border-gray-300"
                      }`}
                    >
                      {crypto.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Crypto Transfer Details Panel */}
            {paymentMethod !== "BALANCE" && selectedCrypto && (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(selectedCrypto.address)}`} 
                      alt="QR Code" 
                      className="w-[110px] h-[110px] object-contain mx-auto"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      Send ${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} to this {selectedCrypto.name} address:
                    </h3>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 px-3 py-2 rounded-xl text-xs text-green-500 font-mono break-all leading-relaxed select-all">
                        {selectedCrypto.address}
                      </code>
                      <button
                        type="button"
                        onClick={copyWallet}
                        className="px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 border border-gray-200 dark:border-gray-750 rounded-xl text-gray-500 hover:text-primary-500 transition-colors shadow-sm"
                      >
                        {copied ? <span className="text-xs text-green-500 font-bold">Copied</span> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">Make sure to send exactly the total amount. Transaction fee from your wallet is not covered.</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-750 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Wallet Refund Address *</label>
                    <input
                      type="text"
                      required
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-650 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Enter your wallet address for potential refund verification"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Transfer Screenshot Proof *</label>
                    {!proofPreview ? (
                      <label className="block cursor-pointer">
                        <div className="border border-dashed border-gray-300 dark:border-gray-650 hover:border-primary-500 rounded-xl p-4 text-center bg-white dark:bg-gray-800 transition-colors">
                          <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-xs font-bold text-gray-300">Click to upload transfer confirmation image</p>
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
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Order Summary details */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-250 dark:border-gray-700 p-6 shadow-sm space-y-5 sticky top-6">
            <h2 className="font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Order Summary</h2>

            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <img src={car.img} alt={car.name} className="w-full h-full object-cover" />
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug">{car.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{car.subtitle}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Fee</span>
                <span className="text-gray-900 dark:text-white">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-500">${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-650 dark:text-red-400 font-semibold">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              type="submit"
              disabled={loading || (paymentMethod !== "BALANCE" && (!proofFile || !walletAddress))}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-primary-500/20"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing Order...
                </>
              ) : paymentMethod === "BALANCE" && !hasEnoughBalance ? (
                <>
                  <DollarSign size={16} /> Deposit Funds to Order
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Place Order
                </>
              )}
            </button>

            {/* Balance status under button */}
            {paymentMethod === "BALANCE" && !hasEnoughBalance && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-250 dark:border-yellow-900/50 rounded-xl flex items-start gap-2 text-[10px] text-yellow-800 dark:text-yellow-400">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Insufficient Account Balance</p>
                  <p className="mt-0.5">Clicking the deposit button will redirect you to deposit ${shortfall.toLocaleString(undefined, { minimumFractionDigits: 2 })} to finish ordering.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </form>
     </div>
    </>
  );
}
