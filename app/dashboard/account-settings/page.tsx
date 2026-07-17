"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Home, ChevronRight, User, Mail, Phone, Globe, Lock,
  Eye, EyeOff, Save, Loader2, AlertCircle, CheckCircle2,
  Shield, Activity, LogIn, RefreshCw, Camera,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Full list of countries for the dropdown
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
  "Mauritania ","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua",
  "Niger","Nigeria","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay",
  "Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia",
  "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan",
  "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
  "Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States of America","Uruguay",
  "Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

type Tab = "personal" | "security";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  avatar?: string | null;
  createdAt: string;
}

interface ActivityItem {
  icon: React.ReactNode;
  title: string;
  sub: string;
  time: string;
}

export default function AccountSettingsPage() {
  const { status } = useSession();
  const [tab,         setTab]         = useState<Tab>("personal");
  const [profile,     setProfile]     = useState<UserProfile | null>(null);
  const [loading,     setLoading]     = useState(true);

  /* Photo upload */
  const fileInputRef                  = useRef<HTMLInputElement>(null);
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);

  /* Personal info form */
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [country,     setCountry]     = useState("");
  const [saving,      setSaving]      = useState(false);

  /* Security / password form */
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [savingPw,    setSavingPw]    = useState(false);

  /* Recent activity (static — no activity model in DB yet) */
  const activity: ActivityItem[] = profile ? [
    {
      icon: <LogIn size={16} className="text-blue-400" />,
      title: "Account Login",
      sub: "Last login from your device",
      time: "Just now",
    },
    {
      icon: <RefreshCw size={16} className="text-green-400" />,
      title: "Profile Updated",
      sub: "You updated your profile information",
      time: new Date(profile.createdAt).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }),
    },
  ] : [];

  /* ── Fetch profile — wait for session to be authenticated first ── */
  useEffect(() => {
    if (status === "loading") return; // session not ready yet
    if (status === "unauthenticated") { setLoading(false); return; }

    fetch("/api/user/me", { credentials: "include" })
      .then(async r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((d: UserProfile & { error?: string }) => {
        if (d.error) return; // silently ignore — user will see empty form
        setProfile(d);
        setName(d.name ?? "");
        setPhone(d.phone ?? "");
        setCountry(d.country ?? "");
      })
      .catch(() => {}) // silently fail — no scary error toast on load
      .finally(() => setLoading(false));
  }, [status]);

  /* ── Initials from name ── */
  function initials(n: string) {
    return n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  }

  /* ── Photo: pick file → preview then upload ── */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 5 MB.");
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload via FormData (avoids base64 size issues)
    uploadAvatar(file);
  }

  /* ── Upload avatar to server via FormData ── */
  async function uploadAvatar(file: File) {
    setUploading(true);
    const tid = toast.loading("Uploading photo…");
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        credentials: "include",
        body: form,
        // Do NOT set Content-Type — browser sets it with the correct boundary
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed.", { id: tid });
        setPreviewUrl(null);
        return;
      }

      // Update local profile with real server path
      setProfile(prev => prev ? { ...prev, avatar: data.avatar } : prev);
      // Release the blob URL and clear preview (now using server path)
      setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
      toast.success("Profile photo updated!", { id: tid, duration: 4000 });
      window.dispatchEvent(new CustomEvent("avatar-updated"));
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
      setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* ── Save personal info ── */
  async function handleSavePersonal(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())  { toast.error("Full name is required."); return; }
    if (!phone.trim()) { toast.error("Phone number is required."); return; }
    if (!country)      { toast.error("Please select your country."); return; }

    setSaving(true);
    const tid = toast.loading("Saving changes…");
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), country }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to save.", { id: tid }); return; }
      setProfile(prev => prev ? { ...prev, ...data.user } : prev);
      toast.success("Profile updated successfully!", { id: tid, duration: 4000 });
      window.dispatchEvent(new CustomEvent("avatar-updated"));
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
    } finally {
      setSaving(false);
    }
  }

  /* ── Save new password ── */
  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw)             { toast.error("Enter your current password."); return; }
    if (newPw.length < 8)       { toast.error("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw)    { toast.error("New passwords do not match."); return; }

    setSavingPw(true);
    const tid = toast.loading("Updating password…");
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update password.", { id: tid }); return; }
      toast.success("Password updated successfully!", { id: tid, duration: 4000 });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      toast.error("Network error. Please try again.", { id: tid });
    } finally {
      setSavingPw(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your account details and security preferences
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Home size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Home size={11} />
        <Link href="/dashboard" className="hover:text-primary-500 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-gray-600 dark:text-gray-300 font-semibold">Profile</span>
      </div>

      {/* ── Red hero banner — matches screenshot exactly ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#b91c1c 0%,#E31937 50%,#991b1b 100%)" }}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_70%_40%,white,transparent)]" />
        <div className="relative flex flex-col items-center py-10 px-6 text-center">

          {/* Avatar with camera overlay */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/40 shadow-lg bg-white/20">
              {/* Show preview → uploaded avatar → initials */}
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{initials(profile?.name ?? "")}</span>
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors border-2 border-white/40"
              title="Change profile photo"
            >
              {uploading
                ? <Loader2 size={14} className="animate-spin text-gray-500" />
                : <Camera size={14} className="text-gray-600" />}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <h2 className="text-xl font-extrabold text-white">{profile?.name}</h2>
          <p className="text-white/70 text-sm mt-0.5">{profile?.email}</p>
          <p className="text-white/50 text-xs mt-2">Click the camera icon to change your photo</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Tab headers */}
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          {[
            { key: "personal" as Tab, icon: <User size={14} />,   label: "Personal Information" },
            { key: "security" as Tab, icon: <Lock size={14} />,   label: "Security" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold transition-colors ${
                tab === t.key
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Personal Information Tab ── */}
        {tab === "personal" && (
          <form onSubmit={handleSavePersonal} className="p-6 space-y-6">

            {/* Info banner — matches screenshot */}
            <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle size={15} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Your personal information helps us personalise your experience. Please ensure all details are accurate and up-to-date.
              </p>
            </div>

            {/* Full Name */}
            <FieldRow
              label="Full Name"
              sub="Your display name on the platform"
              icon={<User size={14} className="text-gray-400" />}
            >
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputCls}
                placeholder="Enter your full name"
                required
              />
            </FieldRow>

            {/* Phone */}
            <FieldRow
              label="Phone Number"
              sub="Used for account verification"
              icon={<Phone size={14} className="text-gray-400" />}
            >
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={inputCls}
                placeholder="Enter your phone number"
                required
              />
            </FieldRow>

            {/* Email — read-only */}
            <FieldRow
              label="Email Address"
              sub="Your primary contact email"
              icon={<Mail size={14} className="text-gray-400" />}
            >
              <div className="space-y-1">
                <div className={`${inputCls} bg-gray-50 dark:bg-gray-900/60 flex items-center gap-2 cursor-not-allowed`}>
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{profile?.email}</span>
                </div>
                <p className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Lock size={9} /> Email address cannot be changed
                </p>
              </div>
            </FieldRow>

            {/* Country */}
            <FieldRow
              label="Country"
              sub="Your current location"
              icon={<Globe size={14} className="text-gray-400" />}
            >
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className={`${inputCls} pl-8 appearance-none cursor-pointer`}
                  required
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </FieldRow>

            {/* Username — read-only */}
            <FieldRow
              label="Username"
              sub="Your unique identifier"
              icon={<User size={14} className="text-gray-400" />}
            >
              <div className="space-y-1">
                <div className={`${inputCls} bg-gray-50 dark:bg-gray-900/60 flex items-center gap-2 cursor-not-allowed`}>
                  <User size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{profile?.username}</span>
                </div>
                <p className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Lock size={9} /> Username cannot be changed
                </p>
              </div>
            </FieldRow>

            {/* Save Changes button — matches screenshot */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
              >
                {saving
                  ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                  : <><Save size={15} /> Save Changes</>}
              </button>
            </div>

          </form>
        )}

        {/* ── Security Tab ── */}
        {tab === "security" && (
          <form onSubmit={handleSavePassword} className="p-6 space-y-6">

            <div className="flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <Shield size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Keep your account secure. Use a strong password with at least 8 characters, including letters, numbers, and symbols.
              </p>
            </div>

            {/* Current Password */}
            <FieldRow label="Current Password" sub="Enter your existing password" icon={<Lock size={14} className="text-gray-400" />}>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showCur ? "text" : "password"}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  className={`${inputCls} pl-8 pr-10`}
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCur(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </FieldRow>

            {/* New Password */}
            <FieldRow label="New Password" sub="At least 8 characters" icon={<Lock size={14} className="text-gray-400" />}>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className={`${inputCls} pl-8 pr-10`}
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPw.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full ${
                        newPw.length >= n * 2
                          ? n <= 1 ? "bg-red-400" : n <= 2 ? "bg-yellow-400" : n <= 3 ? "bg-blue-400" : "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {newPw.length < 4 ? "Weak" : newPw.length < 6 ? "Fair" : newPw.length < 8 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </FieldRow>

            {/* Confirm Password */}
            <FieldRow label="Confirm New Password" sub="Re-enter your new password" icon={<Lock size={14} className="text-gray-400" />}>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showConf ? "text" : "password"}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  className={`${inputCls} pl-8 pr-10 ${confirmPw && confirmPw !== newPw ? "border-red-400 focus:ring-red-400" : confirmPw && confirmPw === newPw ? "border-green-400" : ""}`}
                  placeholder="Confirm new password"
                />
                <button type="button" onClick={() => setShowConf(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {confirmPw && (
                  <div className="absolute right-9 top-1/2 -translate-y-1/2">
                    {confirmPw === newPw
                      ? <CheckCircle2 size={13} className="text-green-500" />
                      : <AlertCircle size={13} className="text-red-400" />}
                  </div>
                )}
              </div>
              {confirmPw && confirmPw !== newPw && (
                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={9} /> Passwords do not match</p>
              )}
            </FieldRow>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPw}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
              >
                {savingPw
                  ? <><Loader2 size={15} className="animate-spin" /> Updating…</>
                  : <><Lock size={15} /> Update Password</>}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* ── Recent Activity — matches screenshot ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Activity size={16} className="text-primary-500" />
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Recent Activity</h3>
            <p className="text-xs text-gray-400">Latest actions on your account</p>
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {activity.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-400 truncate">{item.sub}</p>
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0">{item.time}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ── Shared input class ── */
const inputCls = "w-full px-3 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

/* ── Two-column field row ── */
function FieldRow({ label, sub, icon, children }: {
  label: string; sub: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 sm:gap-6 items-start">
      <div className="flex items-start gap-1.5 pt-2.5">
        {icon}
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
