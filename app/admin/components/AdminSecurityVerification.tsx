"use client";

import { useState, useEffect } from "react";
import { Shield, Calculator, Lock, AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react";

interface MathChallenge {
  question: string;
  answer: number;
}

interface AdminSecurityProps {
  onVerified: () => void;
  onFailed: () => void;
}

export default function AdminSecurityVerification({ onVerified, onFailed }: AdminSecurityProps) {
  const [step, setStep] = useState<'password' | 'math' | 'verified'>('password');
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mathChallenge, setMathChallenge] = useState<MathChallenge | null>(null);
  const [mathAnswer, setMathAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timeout

  // Generate random math challenge
  const generateMathChallenge = (): MathChallenge => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 50;
        num2 = Math.floor(Math.random() * 30) + 10;
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
        question = "5 + 3";
    }
    
    return { question, answer };
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onFailed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onFailed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log('[ADMIN SECURITY] Password submit attempt:', adminPassword);

    if (!adminPassword.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      console.log('[ADMIN SECURITY] Calling password verification API...');
      const response = await fetch('/api/admin/security/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      console.log('[ADMIN SECURITY] API Response status:', response.status);
      const data = await response.json();
      console.log('[ADMIN SECURITY] API Response data:', data);

      if (response.ok && data.success) {
        console.log('[ADMIN SECURITY] Password verified, generating math challenge...');
        // Password correct, proceed to math challenge
        const challenge = generateMathChallenge();
        console.log('[ADMIN SECURITY] Math challenge generated:', challenge);
        setMathChallenge(challenge);
        setStep('math');
        setAdminPassword(""); // Clear password for security
        setError("✅ Password verified! Solve the math problem to proceed.");
      } else {
        console.log('[ADMIN SECURITY] Password verification failed:', data);
        setAttempts(prev => prev + 1);
        if (attempts >= 2) {
          console.log('[ADMIN SECURITY] Too many attempts, calling onFailed');
          onFailed();
        } else {
          setError(data.message || "Invalid password. Try again.");
        }
      }
    } catch (error) {
      console.error('[ADMIN SECURITY] Password verification error:', error);
      setError("Security verification failed. Please try again.");
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        onFailed();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!mathAnswer.trim()) {
      setError("Please solve the math problem");
      setLoading(false);
      return;
    }

    const userAnswer = parseInt(mathAnswer);
    if (isNaN(userAnswer) || userAnswer !== mathChallenge?.answer) {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        onFailed();
      } else {
        setError("Incorrect answer. Try again.");
        // Generate new challenge on wrong answer
        const newChallenge = generateMathChallenge();
        setMathChallenge(newChallenge);
        setMathAnswer("");
      }
      setLoading(false);
      return;
    }

    try {
      // Create secure admin session
      const response = await fetch('/api/admin/security/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          challengeSolved: true,
          timestamp: Date.now() 
        }),
      });

      if (response.ok) {
        setStep('verified');
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError("Failed to create secure session");
      }
    } catch (error) {
      console.error('Session creation error:', error);
      setError("Security session creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Security Verification
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ultra-strong security required for admin access
            </p>
            
            {/* Countdown Timer */}
            <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                Time remaining: {formatTime(timeLeft)}
              </p>
            </div>
            
            {/* Attempts Counter */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Attempts: {attempts}/3
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Password Verification */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Admin Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter admin password"
                    required
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !adminPassword.trim()}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Verifying...' : 'Verify Password'}
              </button>
            </form>
          )}

          {/* Step 2: Math Challenge */}
          {step === 'math' && mathChallenge && (
            <form onSubmit={handleMathSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calculator className="inline h-4 w-4 mr-2" />
                  Solve this math problem to proceed
                </label>
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {mathChallenge.question} = ?
                  </p>
                </div>
                <input
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-lg"
                  placeholder="Enter your answer"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !mathAnswer.trim()}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Verifying...' : 'Submit Answer'}
              </button>
            </form>
          )}

          {/* Step 3: Verified */}
          {step === 'verified' && (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-green-600 dark:text-green-400">
                Security Verification Complete!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redirecting to admin dashboard...
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
              <div className="text-xs text-yellow-700 dark:text-yellow-400">
                <p className="font-medium mb-1">Security Notice:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Maximum 3 attempts allowed</li>
                  <li>5-minute session timeout</li>
                  <li>All attempts are logged</li>
                  <li>Failed attempts trigger security alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}