"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ShieldCheck, Upload, CheckCircle2, Clock, XCircle,
  AlertTriangle, Loader2, Camera, FileText, User, ChevronDown, X,
} from "lucide-react";

type KYCStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

/* ─────────────────────────────────────────────
   Upload zone component
───────────────────────────────────────────── */
function UploadZone({
  label, sub, icon, file, onFile, required,
}: {
  label: string; sub: string; icon: React.ReactNode;
  file: File | null; onFile: (f: File) => void; required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10 MB."); return; }
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      toast.error("Please upload an image (JPEG, PNG, WebP) or PDF.");
      return;
    }
    onFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  return (
    <div>
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
        {icon} {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <p className="text-xs text-gray-400 mb-2">{sub}</p>
      <div
        onClick={() => ref.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-8 transition-all ${
          file
            ? "border-green-400 bg-green-50 dark:bg-green-900/10"
            : "border-gray-300 dark:border-gray-600 hover:border-primary-400 bg-gray-50 dark:bg-gray-900/30"
        }`}
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-32 max-w-full rounded-lg object-contain" />
        ) : file ? (
          <FileText size={32} className="text-green-500"/>
        ) : (
          <Upload size={28} className="text-gray-400"/>
        )}
        {file ? (
          <div className="text-center">
            <p className="text-xs font-extrabold text-green-600 dark:text-green-400 flex items-center gap-1 justify-center">
              <CheckCircle2 size={12}/> {file.name}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
            Click to upload or drag & drop<br/>
            <span className="text-[10px] text-gray-400">JPEG, PNG, WebP or PDF · Max 10 MB</span>
          </p>
        )}
        <input ref={ref} type="file" accept="image/*,.pdf" onChange={handleChange} className="hidden"/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function VerifyAccountPage() {
  const [kycStatus,  setKycStatus]  = useState<KYCStatus>("UNVERIFIED");
  const [submittedAt,setSubmittedAt]= useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [docType,    setDocType]    = useState("National ID");
  const [docFront,   setDocFront]   = useState<File | null>(null);
  const [docBack,    setDocBack]    = useState<File | null>(null);
  const [selfie,     setSelfie]     = useState<File | null>(null);
  const [faqOpen,    setFaqOpen]    = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/verify")
      .then(r => r.json())
      .then(d => {
        if (d?.kycStatus) setKycStatus(d.kycStatus as KYCStatus);
        if (d?.kycSubmittedAt) setSubmittedAt(d.kycSubmittedAt);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!docFront) { toast.error("Front of ID document is required."); return; }
    if (!selfie)   { toast.error("Selfie with ID is required."); return; }

    setSubmitting(true);
    const tid = toast.loading("Submitting verification documents…");
    try {
      const form = new FormData();
      form.append("docFront", docFront);
      if (docBack) form.append("docBack", docBack);
      form.append("selfie", selfie);
      form.append("docType", docType);

      const res  = await fetch("/api/user/verify", { method: "POST", credentials: "include", body: form });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Submission failed.", { id: tid }); return; }
      toast.success("Documents submitted! We'll review within 24 hours.", { id: tid, duration: 5000 });
      setKycStatus("PENDING");
      setSubmittedAt(new Date().toISOString());
      window.dispatchEvent(new CustomEvent("kyc-updated"));
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  }

  const FAQS = [
    { q:"Why do we require KYC?",       a:"KYC is required by financial regulations to prevent fraud and money laundering. It protects both you and the platform." },
    { q:"What documents do I need?",    a:"A government-issued photo ID (passport, national ID, or driver's license) that is valid and clearly legible." },
    { q:"How long does it take?",       a:"Verification is typically completed within 24 hours. You'll be notified by email once complete." },
    { q:"Is my data secure?",           a:"Yes. All submitted documents are encrypted and stored securely. We comply with GDPR and international data protection regulations." },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={32} className="animate-spin text-primary-500"/>
    </div>
  );

  /* ── Status screens ── */
  if (kycStatus === "VERIFIED") return (
    <div className="max-w-lg mx-auto mt-12 text-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={36} className="text-green-500"/>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Account Verified ✓</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Your identity has been successfully verified. You have full access to all platform features.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  if (kycStatus === "PENDING") return (
    <div className="max-w-lg mx-auto mt-12 text-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-5">
          <Clock size={36} className="text-yellow-500"/>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Verification Under Review</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
          Your documents have been submitted and are being reviewed. This usually takes up to 24 hours.
        </p>
        {submittedAt && (
          <p className="text-xs text-gray-400 mb-8">
            Submitted: {new Date(submittedAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" })}
          </p>
        )}
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  if (kycStatus === "REJECTED") return (
    <div className="max-w-lg mx-auto mt-12 text-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
          <XCircle size={36} className="text-red-500"/>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Verification Rejected</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Your verification was not approved. Please resubmit with clearer documents. Contact support if you need help.
        </p>
        <button onClick={() => setKycStatus("UNVERIFIED")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );

  /* ── Main upload form ── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Title */}
      <div className="text-center pt-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"/>
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Verification Required</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">KYC Verification</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete your identity verification to unlock all platform features</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2">
        {["Select Document","Upload Documents","Submit for Review"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-black flex items-center justify-center">{i+1}</div>
              <span className="hidden sm:block text-xs font-semibold text-gray-600 dark:text-gray-400">{s}</span>
            </div>
            {i < 2 && <div className="w-8 h-px bg-gray-200 dark:bg-gray-700"/>}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">

          {/* Info banner */}
          <div className="flex items-start gap-3 p-3.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <AlertTriangle size={15} className="text-yellow-500 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
              <span className="font-extrabold">Important:</span> Ensure all documents are valid, clear, and not expired. Blurry or incomplete documents will be rejected.
            </p>
          </div>

          {/* Document type */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-1.5">
              <FileText size={14} className="text-primary-500"/> Document Type <span className="text-primary-500">*</span>
            </label>
            <div className="relative">
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer">
                <option>National ID</option>
                <option>Passport</option>
                <option>Driver's License</option>
                <option>Residence Permit</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>

          {/* Front ID */}
          <UploadZone
            label="Front of Document"
            sub="Clear photo of the front side of your ID"
            icon={<FileText size={13} className="text-primary-500"/>}
            file={docFront}
            onFile={setDocFront}
            required
          />

          {/* Back ID */}
          <UploadZone
            label="Back of Document"
            sub="Clear photo of the back side (if applicable)"
            icon={<FileText size={13} className="text-gray-400"/>}
            file={docBack}
            onFile={setDocBack}
          />

          {/* Selfie */}
          <UploadZone
            label="Selfie Holding Your ID"
            sub="Take a clear selfie while holding your ID next to your face"
            icon={<Camera size={13} className="text-primary-500"/>}
            file={selfie}
            onFile={setSelfie}
            required
          />

          {/* Submit */}
          <button type="submit" disabled={submitting || !docFront || !selfie}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20">
            {submitting
              ? <><Loader2 size={15} className="animate-spin"/> Submitting…</>
              : <><ShieldCheck size={15}/> Submit for Verification</>}
          </button>

        </div>
      </form>

      {/* FAQ accordion */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary-500"/>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Frequently Asked Questions</h3>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
            <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{faq.q}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${faqOpen===i?"rotate-180":""}`}/>
            </button>
            {faqOpen === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Support CTA */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Having trouble with verification? <span className="font-bold text-gray-900 dark:text-white">Our support team is here to help.</span>
        </p>
        <Link href="/dashboard/support"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors flex-shrink-0">
          Get Help
        </Link>
      </div>

    </div>
  );
}
