"use client";

import { useState, useEffect } from "react";
import { Send, Bell, Users, User, CheckCircle2, AlertCircle, Sparkles, Shield, Info } from "lucide-react";

interface UserOption {
  id: string;
  name: string;
  email: string;
  username: string;
}

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [target, setTarget] = useState<"all" | "single">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("SYSTEM");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users);
          if (data.users.length > 0) setSelectedUserId(data.users[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Please enter both a title and message." });
      return;
    }

    if (target === "single" && !selectedUserId) {
      setFeedback({ type: "error", text: "Please select a recipient user." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          userId: target === "single" ? selectedUserId : undefined,
          title: title.trim(),
          message: message.trim(),
          type,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setFeedback({ type: "success", text: data.message || "Notification sent successfully!" });
        setTitle("");
        setMessage("");
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to send notification." });
      }
    } catch (err) {
      setLoading(false);
      setFeedback({ type: "error", text: "Network error occurred. Please try again." });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Bell className="text-red-500" size={28} /> Send System Notifications
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Broadcast custom alerts, deposit updates, or announcements to users' in-app notification bells.
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-semibold ${
          feedback.type === "success"
            ? "bg-green-950/60 border-green-800/50 text-green-300"
            : "bg-red-950/60 border-red-800/50 text-red-300"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} className="text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSend} className="space-y-6">
          
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2">
              Target Audience
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTarget("all")}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  target === "all"
                    ? "bg-red-950/40 border-red-600 text-white shadow-lg shadow-red-950/50 ring-1 ring-red-500"
                    : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <Users size={22} className={target === "all" ? "text-red-400" : "text-gray-500"} />
                <div>
                  <div className="font-extrabold text-sm">All Platform Users</div>
                  <div className="text-xs text-gray-500 mt-0.5">Broadcast to every registered user ({users.length})</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTarget("single")}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  target === "single"
                    ? "bg-red-950/40 border-red-600 text-white shadow-lg shadow-red-950/50 ring-1 ring-red-500"
                    : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <User size={22} className={target === "single" ? "text-red-400" : "text-gray-500"} />
                <div>
                  <div className="font-extrabold text-sm">Specific User</div>
                  <div className="text-xs text-gray-500 mt-0.5">Send alert to one chosen account</div>
                </div>
              </button>
            </div>
          </div>

          {/* Select User Dropdown if target === 'single' */}
          {target === "single" && (
            <div>
              <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2">
                Select Recipient User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-gray-900 text-white">
                    {u.name} (@{u.username}) — {u.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notification Category */}
          <div>
            <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2">
              Notification Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "SYSTEM", label: "System Update" },
                { id: "BONUS", label: "Bonus / Credit" },
                { id: "SECURITY", label: "Security Alert" },
                { id: "ANNOUNCEMENT", label: "Announcement" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setType(c.id)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition-all ${
                    type === c.id
                      ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-950"
                      : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2">
              Notification Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deposit Credited / Special Bonus / Scheduled Maintenance"
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2">
              Notification Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter full notification message text..."
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-600 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span>Sending Notification...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Send Notification ({target === "all" ? `To All ${users.length} Users` : "To Selected User"})</span>
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
