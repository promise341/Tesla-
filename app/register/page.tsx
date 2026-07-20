"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, Phone, Globe, Shield, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, Sparkles, Check, ChevronRight
} from "lucide-react";

/* ─────────────────────────────────────────────
   Full list of countries for registration
───────────────────────────────────────────── */
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize",
  "Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile",
  "China","Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia",
  "Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala",
  "Guinea","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kosovo",
  "Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Liberia","Libya","Liechtenstein",
  "Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
  "Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua",
  "Niger","Nigeria","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay",
  "Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia",
  "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan",
  "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
  "Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States of America","Uruguay",
  "Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Step State (1, 2, 3)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Fields: Credentials
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 Fields: Profile & Location
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United States of America");
  const [dob, setDob] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [experience, setExperience] = useState("Beginner");

  // Step 3 Fields: Security PIN & Agreements
  const [securityPin, setSecurityPin] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeRisk, setAgreeRisk] = useState(false);

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read referral code from URL query parameters (e.g. ?ref=john)
  useEffect(() => {
    const refParam = searchParams?.get("ref");
    if (refParam) {
      setReferralCode(refParam);
    }
  }, [searchParams]);

  // Password strength meter calculation
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  // Validation functions for each step
  function validateStep1(): boolean {
    setError("");
    if (!name.trim() || name.trim().split(" ").length < 2) {
      setError("Please enter your full first and last name.");
      return false;
    }
    if (!username.trim() || username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    setError("");
    if (!phone.trim() || phone.trim().length < 7) {
      setError("Please enter a valid mobile phone number.");
      return false;
    }
    if (!country) {
      setError("Please select your country of residence.");
      return false;
    }
    if (dob) {
      const birthDate = new Date(dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        setError("You must be at least 18 years old to register.");
        return false;
      }
    }
    return true;
  }

  function validateStep3(): boolean {
    setError("");
    if (!securityPin || securityPin.length !== 4 || isNaN(Number(securityPin))) {
      setError("Please create a 4-digit numerical security PIN for your account.");
      return false;
    }
    if (!agreeTerms || !agreeRisk) {
      setError("You must accept the Terms of Service and Risk Disclosure to continue.");
      return false;
    }
    return true;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
          username: username.trim(),
          phone: phone.trim(),
          country,
          referralCode: referralCode.trim(),
          securityPin,
          currency,
          experience
        }),
      });

      setLoading(false);

      if (res.ok) {
        router.push("/login?registered=true");
        return;
      }

      const data = await res.json();
      setError(data?.error || "Registration failed. Please check your information.");
    } catch (err) {
      setLoading(false);
      setError("Network connection error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-red-500 selection:text-white">
      <div className="w-full max-w-xl">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Teslaxipo
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">
            Create Your Account
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Complete the 3-step verification process to access your trading platform.
          </p>
        </div>

        {/* 3-Step Wizard Progress Bar */}
        <div className="mb-8 bg-gray-900/80 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between relative">
            
            {/* Step 1 Indicator */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${
                step > 1 ? "bg-green-500 text-white shadow-lg shadow-green-900/30" :
                step === 1 ? "bg-red-600 text-white ring-4 ring-red-950 shadow-lg shadow-red-900/40" :
                "bg-gray-800 text-gray-400"
              }`}>
                {step > 1 ? <Check size={18} /> : "1"}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${step === 1 ? "text-red-400" : step > 1 ? "text-green-400" : "text-gray-500"}`}>
                Credentials
              </span>
            </div>

            {/* Connecting Line 1-2 */}
            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${step > 1 ? "bg-green-500" : "bg-gray-800"}`} />

            {/* Step 2 Indicator */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${
                step > 2 ? "bg-green-500 text-white shadow-lg shadow-green-900/30" :
                step === 2 ? "bg-red-600 text-white ring-4 ring-red-950 shadow-lg shadow-red-900/40" :
                "bg-gray-800 text-gray-400"
              }`}>
                {step > 2 ? <Check size={18} /> : "2"}
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${step === 2 ? "text-red-400" : step > 2 ? "text-green-400" : "text-gray-500"}`}>
                Profile & Location
              </span>
            </div>

            {/* Connecting Line 2-3 */}
            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${step > 2 ? "bg-green-500" : "bg-gray-800"}`} />

            {/* Step 3 Indicator */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${
                step === 3 ? "bg-red-600 text-white ring-4 ring-red-950 shadow-lg shadow-red-900/40" :
                "bg-gray-800 text-gray-400"
              }`}>
                "3"
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${step === 3 ? "text-red-400" : "text-gray-500"}`}>
                Security & Terms
              </span>
            </div>

          </div>
        </div>

        {/* Card Container */}
        <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ─────────────────────────────────────────────
               STEP 1: CREDENTIALS & SECURITY
            ───────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border-b border-gray-800 pb-3 mb-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <User size={16} className="text-red-500" /> Step 1: Personal Credentials
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Enter your legal full name and account sign-in credentials.</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Johnathan Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="john_doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-gray-400">Password Strength:</span>
                      <span className={strengthScore >= 3 ? "text-green-400" : strengthScore === 2 ? "text-yellow-400" : "text-red-400"}>
                        {strengthScore >= 4 ? "Strong 🔥" : strengthScore === 3 ? "Good 👍" : strengthScore === 2 ? "Medium ⚠️" : "Weak ❌"}
                      </span>
                    </div>
                    <div className="flex gap-1.5 h-1.5">
                      <div className={`flex-1 rounded-full ${strengthScore >= 1 ? "bg-red-500" : "bg-gray-800"}`} />
                      <div className={`flex-1 rounded-full ${strengthScore >= 2 ? "bg-yellow-500" : "bg-gray-800"}`} />
                      <div className={`flex-1 rounded-full ${strengthScore >= 3 ? "bg-green-500" : "bg-gray-800"}`} />
                      <div className={`flex-1 rounded-full ${strengthScore >= 4 ? "bg-emerald-400" : "bg-gray-800"}`} />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950"
                >
                  Continue to Step 2 <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ─────────────────────────────────────────────
               STEP 2: PROFILE & LOCATION VERIFICATION
            ───────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="border-b border-gray-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Globe size={16} className="text-red-500" /> Step 2: Location & Contact Profile
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Provide your phone number and country for security compliance.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                </div>

                {/* Country Selection */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Country of Residence <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c} className="bg-gray-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile Phone Number */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Date of Birth (Must be 18+)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                  />
                </div>

                {/* Trading Experience Level */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Trading Experience Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["Beginner", "Intermediate", "Advanced", "Pro"].map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setExperience(exp)}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                          experience === exp
                            ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-950"
                            : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900"
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Referral Code */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="e.g. REF123"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all uppercase"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3.5 rounded-xl border border-gray-800 text-gray-300 font-extrabold text-sm hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950"
                  >
                    Continue to Step 3 <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────
               STEP 3: SECURITY PIN & AGREEMENT
            ───────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="border-b border-gray-800 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Shield size={16} className="text-red-500" /> Step 3: Security & Verification
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Set your 4-digit transaction PIN and accept platform terms.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                </div>

                {/* 4-Digit Security PIN */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    4-Digit Security PIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="password"
                      maxLength={4}
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 1234"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-mono tracking-widest font-black focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">This PIN will be required to authorize withdrawals and transfers.</p>
                </div>

                {/* Account Base Currency */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1.5">
                    Preferred Base Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                  >
                    <option value="USD">USD ($) - United States Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="BTC">BTC (₿) - Bitcoin Account</option>
                    <option value="USDT">USDT (₮) - Tether Account</option>
                  </select>
                </div>

                {/* Mandatory Agreements Checkboxes */}
                <div className="space-y-3 bg-gray-950/80 p-4 rounded-2xl border border-gray-800/80">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded bg-gray-900 border-gray-700 text-red-600 focus:ring-red-600 w-4 h-4"
                    />
                    <span className="text-xs text-gray-300 leading-relaxed">
                      I agree to the <span className="text-red-400 font-bold hover:underline">Terms of Service</span>, <span className="text-red-400 font-bold hover:underline">Privacy Policy</span>, and declare that I am at least 18 years of age.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeRisk}
                      onChange={(e) => setAgreeRisk(e.target.checked)}
                      className="mt-0.5 rounded bg-gray-900 border-gray-700 text-red-600 focus:ring-red-600 w-4 h-4"
                    />
                    <span className="text-xs text-gray-300 leading-relaxed">
                      I acknowledge the <span className="text-red-400 font-bold hover:underline">Financial Risk Disclosure</span> and understand that trading involves risk of loss.
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3.5 rounded-xl border border-gray-800 text-gray-300 font-extrabold text-sm hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-gray-800/80 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-red-400 font-extrabold hover:text-red-300 transition-colors inline-flex items-center gap-1">
                Sign in to Dashboard <ChevronRight size={13} />
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white font-bold">Loading Registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
