"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Calculator,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  Activity,
} from "lucide-react";

interface MathChallenge {
  question: string;
  answer: number;
}

interface AdminSecurityProps {
  onVerified: () => void;
  onFailed: () => void;
}

function generateMathChallenge(): MathChallenge {
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1: number, num2: number, answer: number, question: string;
  switch (operation) {
    case "+":
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case "-":
      num1 = Math.floor(Math.random() * 50) + 50;
      num2 = Math.floor(Math.random() * 30) + 10;
      answer = num1 - num2;
      question = `${num1} − ${num2}`;
      break;
    case "*":
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
      break;
    default:
      return { question: "5 + 3", answer: 8 };
  }
  return { question, answer };
}

export default function AdminSecurityVerification({
  onVerified,
  onFailed,
}: AdminSecurityProps) {
  const [step, setStep] = useState<"password" | "math" | "verified">("password");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mathChallenge, setMathChallenge] = useState<MathChallenge | null>(null);
  const [mathAnswer, setMathAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const solvedRef = React.useRef(false); // prevents timer firing after success
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
      size: Math.random() > 0.5 ? "w-0.5 h-0.5" : "w-1 h-1",
    }))
  );

  const handleFailed = useCallback(() => onFailed(), [onFailed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!solvedRef.current) handleFailed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleFailed]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const timerColor =
    timeLeft > 180
      ? "text-green-400"
      : timeLeft > 60
      ? "text-yellow-400"
      : "text-red-400";

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!adminPassword.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/security/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const challenge = generateMathChallenge();
        setMathChallenge(challenge);
        setAdminPassword("");
        setSuccessMsg("Password verified — solve the challenge below");
        setTimeout(() => {
          setSuccessMsg("");
          setStep("math");
        }, 900);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          handleFailed();
        } else {
          setError(data.message || data.error || "Invalid password.");
        }
      }
    } catch {
      setError("Security check failed. Try again.");
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) handleFailed();
    } finally {
      setLoading(false);
    }
  };

  const handleMathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!mathAnswer.trim()) {
      setError("Enter your answer");
      setLoading(false);
      return;
    }

    const userAnswer = parseInt(mathAnswer);
    if (isNaN(userAnswer) || userAnswer !== mathChallenge?.answer) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        handleFailed();
      } else {
        setError("Incorrect answer. New challenge generated.");
        setMathChallenge(generateMathChallenge());
        setMathAnswer("");
      }
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/security/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeSolved: true, timestamp: Date.now() }),
      });

      if (response.ok) {
        solvedRef.current = true; // stop countdown timer from firing onFailed
        setStep("verified");
        setTimeout(() => onVerified(), 1400);
      } else {
        setError("Failed to create secure session.");
      }
    } catch {
      setError("Session creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Red glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220,38,38,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute ${p.size} bg-red-500/30 rounded-full animate-pulse`}
            style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="bg-[#111111] rounded-2xl border border-red-900/40 overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(220,38,38,0.15), 0 25px 50px rgba(0,0,0,0.8)" }}
        >
          {/* Header Bar */}
          <div className="h-1 bg-gradient-to-r from-red-900 via-red-600 to-red-900" />

          <div className="p-8">
            {/* Icon + Title */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center mb-5">
                <div className="absolute w-20 h-20 bg-red-600/10 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
                <div className="relative w-16 h-16 bg-gradient-to-br from-red-700 to-red-950 rounded-2xl flex items-center justify-center border border-red-700/50 shadow-xl shadow-red-900/60">
                  {step === "math" ? (
                    <Calculator className="w-7 h-7 text-red-300" />
                  ) : step === "verified" ? (
                    <CheckCircle className="w-7 h-7 text-green-400" />
                  ) : (
                    <Shield className="w-7 h-7 text-red-300" />
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {step === "password" && "Admin Security Verification"}
                {step === "math" && "Mathematical Challenge"}
                {step === "verified" && "Access Granted"}
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                {step === "password" && "Enter your master password to continue"}
                {step === "math" && "Solve the equation below to unlock access"}
                {step === "verified" && "Redirecting to admin dashboard..."}
              </p>

              {/* Timer + Attempts */}
              <div className="mt-5 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10">
                  <Activity size={11} className={timerColor} />
                  <span className={`text-xs font-mono font-semibold ${timerColor}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10">
                  <span className="text-xs text-gray-400">
                    Attempts:&nbsp;
                    <span className={attempts >= 2 ? "text-red-400 font-bold" : "text-gray-200"}>
                      {attempts}/3
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center gap-2.5">
                <AlertTriangle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            {successMsg && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-green-950/60 border border-green-800/50 flex items-center gap-2.5">
                <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-300">{successMsg}</p>
              </div>
            )}

            {/* ── Step 1: Password ───────────────────────── */}
            {step === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    <Lock className="inline w-3.5 h-3.5 mr-1.5 text-red-500" />
                    Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-black/60 border border-red-900/40
                        text-white text-sm rounded-xl placeholder-gray-600
                        focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/40
                        transition-all duration-200 disabled:opacity-50"
                      placeholder="Enter admin master password"
                      required
                      disabled={loading}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !adminPassword.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5
                    bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800
                    text-white text-sm font-bold rounded-xl transition-all duration-200
                    shadow-lg shadow-red-900/50 hover:shadow-red-700/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border border-red-700/40"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Verify Password
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── Step 2: Math Challenge ─────────────────── */}
            {step === "math" && mathChallenge && (
              <form onSubmit={handleMathSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    <Calculator className="inline w-3.5 h-3.5 mr-1.5 text-red-500" />
                    Solve to Proceed
                  </label>

                  {/* Math Display */}
                  <div className="relative mb-4">
                    <div className="p-6 rounded-xl bg-black/80 border border-red-900/40 text-center"
                      style={{ boxShadow: "inset 0 0 30px rgba(220,38,38,0.06)" }}
                    >
                      <p className="text-4xl font-bold font-mono text-white tracking-wide">
                        {mathChallenge.question}
                        <span className="text-red-500 ml-3">=</span>
                        <span className="text-red-400 ml-2">?</span>
                      </p>
                    </div>
                    {/* Glow */}
                    <div className="absolute inset-0 rounded-xl bg-red-600/5 pointer-events-none" />
                  </div>

                  <input
                    type="number"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-red-900/40
                      text-white text-lg font-mono text-center rounded-xl placeholder-gray-600
                      focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/40
                      transition-all duration-200 disabled:opacity-50
                      [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Your answer"
                    required
                    disabled={loading}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !mathAnswer.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5
                    bg-gradient-to-r from-green-700 to-green-900 hover:from-green-600 hover:to-green-800
                    text-white text-sm font-bold rounded-xl transition-all duration-200
                    shadow-lg shadow-green-900/50 hover:shadow-green-700/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border border-green-700/40"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Submit Answer
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── Step 3: Verified ───────────────────────── */}
            {step === "verified" && (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-950/60 border border-green-700/40 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="text-base font-semibold text-green-400">Verification Complete!</p>
                  <p className="text-sm text-gray-500 mt-1">Entering admin dashboard...</p>
                </div>
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-green-600/40 border-t-green-500 rounded-full animate-spin" />
                </div>
              </div>
            )}

            {/* Security Notice */}
            {step !== "verified" && (
              <div className="mt-6 px-4 py-3 rounded-xl bg-black/40 border border-red-900/30 flex items-start gap-2.5">
                <AlertTriangle size={13} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-600 space-y-0.5 leading-relaxed">
                  <p className="font-semibold text-gray-500">Security Notice</p>
                  <p>Max 3 attempts · 5-min session · All actions are logged</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {(["password", "math", "verified"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                step === s
                  ? "w-8 bg-red-500"
                  : (["password", "math", "verified"].indexOf(step) > i)
                  ? "w-4 bg-green-700"
                  : "w-4 bg-gray-800"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}