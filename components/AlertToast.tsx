"use client";

import { Toaster, ToastBar, toast } from "react-hot-toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

/* ─────────────────────────────────────────────
   Map toast type → icon + colour scheme
───────────────────────────────────────────── */
function getStyle(type: string) {
  switch (type) {
    case "success":
      return {
        icon:    <CheckCircle2 size={28} className="text-green-500 flex-shrink-0" />,
        ring:    "ring-green-200 dark:ring-green-800",
        accent:  "bg-green-500",
        title:   "text-green-700 dark:text-green-300",
        bg:      "bg-white dark:bg-gray-800",
      };
    case "error":
      return {
        icon:    <XCircle size={28} className="text-red-500 flex-shrink-0" />,
        ring:    "ring-red-200 dark:ring-red-800",
        accent:  "bg-red-500",
        title:   "text-red-700 dark:text-red-300",
        bg:      "bg-white dark:bg-gray-800",
      };
    case "loading":
      return {
        icon: (
          <svg className="animate-spin w-7 h-7 text-primary-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ),
        ring:   "ring-blue-200 dark:ring-blue-800",
        accent: "bg-blue-500",
        title:  "text-blue-700 dark:text-blue-300",
        bg:     "bg-white dark:bg-gray-800",
      };
    default: // info / blank / custom
      return {
        icon:    <Info size={28} className="text-blue-500 flex-shrink-0" />,
        ring:    "ring-blue-200 dark:ring-blue-800",
        accent:  "bg-blue-500",
        title:   "text-blue-700 dark:text-blue-300",
        bg:      "bg-white dark:bg-gray-800",
      };
  }
}

/* ─────────────────────────────────────────────
   Custom centered Toaster
   Drop this once in layout and every toast
   becomes a beautiful centered modal-style alert.
───────────────────────────────────────────── */
export default function AlertToast() {
  return (
    <Toaster
      position="top-center"
      gutter={16}
      containerStyle={{ top: "50%", transform: "translateY(-50%)" }}
      toastOptions={{
        duration: 4000,
        style: { background: "transparent", boxShadow: "none", padding: 0, maxWidth: 420 },
      }}
    >
      {(t) => {
        const s = getStyle(t.type);
        return (
          <ToastBar toast={t} style={{ background: "transparent", boxShadow: "none", padding: 0 }}>
            {() => (
              <div
                className={`
                  relative flex items-start gap-4 w-full max-w-sm mx-auto
                  ${s.bg} rounded-2xl shadow-2xl ring-2 ${s.ring}
                  overflow-hidden
                  ${t.visible ? "animate-enter" : "animate-leave"}
                `}
                style={{
                  animation: t.visible
                    ? "alertIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards"
                    : "alertOut 0.2s ease-in forwards",
                }}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.accent}`} />

                {/* Body */}
                <div className="flex items-start gap-3 px-5 py-4 pl-6 flex-1 min-w-0">
                  {s.icon}
                  <div className="flex-1 min-w-0">
                    {/* Title derived from type */}
                    <p className={`text-xs font-black uppercase tracking-wider mb-1 ${s.title}`}>
                      {t.type === "success" ? "Success"
                        : t.type === "error"   ? "Error"
                        : t.type === "loading" ? "Processing…"
                        : "Notice"}
                    </p>
                    {/* Message */}
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug break-words">
                      {typeof t.message === "function" ? t.message(t) : String(t.message)}
                    </p>
                  </div>
                </div>

                {/* Dismiss button — not shown for loading toasts */}
                {t.type !== "loading" && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}

                {/* Progress bar */}
                {t.type !== "loading" && (
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 ${s.accent} opacity-40`}
                    style={{
                      width: "100%",
                      animation: `shrink ${(t.duration ?? 4000) / 1000}s linear forwards`,
                    }}
                  />
                )}
              </div>
            )}
          </ToastBar>
        );
      }}
    </Toaster>
  );
}
