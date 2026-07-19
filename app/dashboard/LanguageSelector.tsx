"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

/* flagcdn.com serves 20×15 flag images by ISO 3166-1 alpha-2 country code */
function FlagImg({ iso, label }: { iso: string; label: string }) {
  return (
    <img
      src={`https://flagcdn.com/20x15/${iso}.png`}
      srcSet={`https://flagcdn.com/40x30/${iso}.png 2x`}
      width={20}
      height={15}
      alt={label}
      className="rounded-sm object-cover flex-shrink-0"
      loading="lazy"
    />
  );
}

const LANGUAGES = [
  { code: "en",    label: "English",     iso: "us" },
  { code: "af",    label: "Afrikaans",   iso: "za" },
  { code: "sq",    label: "Albanian",    iso: "al" },
  { code: "am",    label: "Amharic",     iso: "et" },
  { code: "ar",    label: "Arabic",      iso: "sa" },
  { code: "hy",    label: "Armenian",    iso: "am" },
  { code: "az",    label: "Azerbaijani", iso: "az" },
  { code: "eu",    label: "Basque",      iso: "es" },
  { code: "be",    label: "Belarusian",  iso: "by" },
  { code: "bn",    label: "Bengali",     iso: "bd" },
  { code: "bs",    label: "Bosnian",     iso: "ba" },
  { code: "bg",    label: "Bulgarian",   iso: "bg" },
  { code: "ca",    label: "Catalan",     iso: "es" },
  { code: "zh-CN", label: "Chinese",     iso: "cn" },
  { code: "hr",    label: "Croatian",    iso: "hr" },
  { code: "cs",    label: "Czech",       iso: "cz" },
  { code: "da",    label: "Danish",      iso: "dk" },
  { code: "nl",    label: "Dutch",       iso: "nl" },
  { code: "et",    label: "Estonian",    iso: "ee" },
  { code: "fi",    label: "Finnish",     iso: "fi" },
  { code: "fr",    label: "French",      iso: "fr" },
  { code: "gl",    label: "Galician",    iso: "es" },
  { code: "ka",    label: "Georgian",    iso: "ge" },
  { code: "de",    label: "German",      iso: "de" },
  { code: "el",    label: "Greek",       iso: "gr" },
  { code: "gu",    label: "Gujarati",    iso: "in" },
  { code: "ht",    label: "Haitian",     iso: "ht" },
  { code: "ha",    label: "Hausa",       iso: "ng" },
  { code: "hi",    label: "Hindi",       iso: "in" },
  { code: "hu",    label: "Hungarian",   iso: "hu" },
  { code: "id",    label: "Indonesian",  iso: "id" },
  { code: "ga",    label: "Irish",       iso: "ie" },
  { code: "it",    label: "Italian",     iso: "it" },
  { code: "ja",    label: "Japanese",    iso: "jp" },
  { code: "ko",    label: "Korean",      iso: "kr" },
  { code: "lv",    label: "Latvian",     iso: "lv" },
  { code: "lt",    label: "Lithuanian",  iso: "lt" },
  { code: "mk",    label: "Macedonian",  iso: "mk" },
  { code: "ms",    label: "Malay",       iso: "my" },
  { code: "mt",    label: "Maltese",     iso: "mt" },
  { code: "no",    label: "Norwegian",   iso: "no" },
  { code: "fa",    label: "Persian",     iso: "ir" },
  { code: "pl",    label: "Polish",      iso: "pl" },
  { code: "pt",    label: "Portuguese",  iso: "br" },
  { code: "ro",    label: "Romanian",    iso: "ro" },
  { code: "ru",    label: "Russian",     iso: "ru" },
  { code: "sr",    label: "Serbian",     iso: "rs" },
  { code: "sk",    label: "Slovak",      iso: "sk" },
  { code: "sl",    label: "Slovenian",   iso: "si" },
  { code: "es",    label: "Spanish",     iso: "es" },
  { code: "sw",    label: "Swahili",     iso: "ke" },
  { code: "sv",    label: "Swedish",     iso: "se" },
  { code: "tl",    label: "Tagalog",     iso: "ph" },
  { code: "th",    label: "Thai",        iso: "th" },
  { code: "tr",    label: "Turkish",     iso: "tr" },
  { code: "uk",    label: "Ukrainian",   iso: "ua" },
  { code: "ur",    label: "Urdu",        iso: "pk" },
  { code: "vi",    label: "Vietnamese",  iso: "vn" },
  { code: "cy",    label: "Welsh",       iso: "gb" },
  { code: "yi",    label: "Yiddish",     iso: "il" },
  { code: "yo",    label: "Yoruba",      iso: "ng" },
  { code: "zu",    label: "Zulu",        iso: "za" },
];

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages?: string; autoDisplay?: boolean },
          element: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export default function LanguageSelector() {
  const [open, setOpen]           = useState(false);
  const [current, setCurrent]     = useState(LANGUAGES[0]);
  const [initialized, setInit]    = useState(false);
  const containerRef              = useRef<HTMLDivElement>(null);

  /* Inject hidden Google Translate widget */
  useEffect(() => {
    if (initialized) return;
    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id    = "google_translate_element";
      el.style.display = "none";
      document.body.appendChild(el);
    }
    window.googleTranslateElementInit = () => {
      try {
        if (!window.google?.translate?.TranslateElement) return;
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      } catch (e) {
        console.warn("Google Translate init failed:", e);
      }
    };
    if (window.google?.translate?.TranslateElement) window.googleTranslateElementInit();
    setInit(true);
  }, [initialized]);

  /* Close on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function changeLanguage(lang: (typeof LANGUAGES)[number]) {
    setCurrent(lang);
    setOpen(false);
    const code = lang.code === "en" ? "" : lang.code;
    if (code === "") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=.${window.location.hostname}`;
    }
    window.location.reload();
  }

  return (
    <div ref={containerRef} className="relative px-3 py-3 border-t border-gray-100 dark:border-gray-800">

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <FlagImg iso={current.iso} label={current.label} />
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white uppercase">
            {current.code.slice(0, 2)}
          </span>
          <span className="text-xs text-gray-400 hidden xl:block">{current.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 mx-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Select Language</p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors ${
                  current.code === lang.code
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <FlagImg iso={lang.iso} label={lang.label} />
                <span className="font-semibold text-xs flex-1 text-left">{lang.label}</span>
                <span className="text-[10px] text-gray-400 uppercase font-mono">
                  {lang.code.slice(0, 2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
