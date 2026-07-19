"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  MessageCircle, Mail, Phone, HelpCircle, ChevronDown,
  Send, HelpCircle as HelpIcon, User, MessageSquareCode,
  FileText, Clock, CheckCheck, Loader2, ArrowLeft,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  createdAt: string;
}

const FAQS = [
  { q: "How do I deposit funds?",           a: "Go to Wallet & Finance → Deposit. Choose your preferred method (BTC, ETH, or USDT) and send to the provided address." },
  { q: "How long do withdrawals take?",      a: "Withdrawals are processed within 24–48 hours after admin approval." },
  { q: "How does copy trading work?",        a: "Browse expert traders, choose one, set your investment amount (min varies per expert), and your account will automatically mirror their trades." },
  { q: "What is the minimum investment?",    a: "Minimum investment depends on the plan or bot. Some plans start from $100, while expert traders may require $500+." },
  { q: "How do I close an open trade?",      a: "Go to your trade page and click the 'Close' button on any open position. Your P&L will be credited to your balance instantly." },
  { q: "Are my funds safe?",                 a: "Teslaxipo uses industry-standard security. Funds are managed through verified payment channels with multi-layer verification." },
];

export default function SupportPage() {
  const [faqOpen, setFaqOpen]         = useState<number | null>(null);
  
  // Ticket Form States
  const [subject, setSubject]         = useState("");
  const [category, setCategory]       = useState("General Inquiry");
  const [message, setMessage]         = useState("");
  const [sendingTicket, setSendingTicket] = useState(false);
  const [tickets, setTickets]         = useState<Ticket[]>([]);

  // Live Chat Simulator States
  const [chatOpen, setChatOpen]       = useState(false);
  const [chatInput, setChatInput]     = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    { sender: "bot", text: "Hello! Welcome to Teslaxipo live support. How can I help you today?", time: "Just now" }
  ]);
  const [chatTyping, setChatTyping]   = useState(false);

  function handleSendTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSendingTicket(true);
    const tid = toast.loading("Submitting support ticket...");

    setTimeout(() => {
      const newTicket: Ticket = {
        id: "TKT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        subject: subject.trim(),
        category,
        message: message.trim(),
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };
      setTickets(prev => [newTicket, ...prev]);
      setSubject("");
      setMessage("");
      setSendingTicket(false);
      toast.success("Support ticket submitted! Our support agents will reply within 2 hours.", { id: tid, duration: 4000 });
    }, 1200);
  }

  function handleSendChatMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatTyping(true);

    // Auto replies based on keywords
    setTimeout(() => {
      let botResponse = "Thank you for reaching out. A human agent is reviewing your inquiry. Please remain online.";
      const clean = userText.toLowerCase();

      if (clean.includes("deposit") || clean.includes("add money") || clean.includes("fund")) {
        botResponse = "To deposit funds, navigate to the 'Deposit' tab under 'Wallet & Finance', select your cryptocurrency, transfer funds, and upload the transaction screenshot receipt.";
      } else if (clean.includes("withdraw") || clean.includes("cash out")) {
        botResponse = "Withdrawals are securely processed within 24-48 hours once requested under 'Wallet & Finance → Withdraw' using your withdrawal security simulation verification code.";
      } else if (clean.includes("trade") || clean.includes("expert") || clean.includes("bot")) {
        botResponse = "You can mirror top experts on the 'Copy Trading' page or launch automated strategies on the 'AI Trading Bots' panel directly.";
      } else if (clean.includes("kyc") || clean.includes("verify") || clean.includes("verification")) {
        botResponse = "KYC documents (government ID & selfie) are checked within 24 hours. Go to 'Account → Verify Identity' to upload yours.";
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: botResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setChatTyping(false);
    }, 1500);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Support Center</h1>
          <p className="text-sm text-gray-400 mt-0.5">Submit tickets, chat live with support, or search FAQs</p>
        </div>
      </div>

      {/* Main Grid: Info columns + FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Support Ticket Submission Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <MessageSquareCode size={16} className="text-primary-500" />
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">Submit a Support Ticket</h2>
            </div>
            
            <form onSubmit={handleSendTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Subject / Issue Title</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Summarize your issue (e.g. Deposit not reflecting)"
                  className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Deposit / Funding">Deposit / Funding</option>
                    <option value="Withdrawals">Withdrawals</option>
                    <option value="Copy Trading">Copy Trading</option>
                    <option value="Trading Bots">Trading Bots</option>
                    <option value="Verification / KYC">Verification / KYC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Detailed Description</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  rows={4}
                  className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingTicket || !subject || !message}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-1.5"
              >
                {sendingTicket ? (
                  <><Loader2 size={13} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={13} /> Submit Ticket</>
                )}
              </button>
            </form>
          </div>

          {/* Active Tickets History list */}
          {tickets.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Your Tickets</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {tickets.map(t => (
                  <div key={t.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 dark:text-white text-xs">{t.subject}</p>
                      <p className="text-[10px] text-gray-400">
                        {t.category} · Ticket ID: <span className="font-mono">{t.id}</span> · {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-yellow-150 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <HelpCircle size={16} className="text-primary-500"/>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">Frequently Asked Questions</h2>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <span className="font-bold text-xs text-gray-900 dark:text-white">{faq.q}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${faqOpen === i ? "rotate-180" : ""}`}/>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Right column sidebar */}
        <div className="space-y-6">
          
          {/* Contact options */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { label:"Live Chat Support",  icon:<MessageCircle size={22} className="text-green-500"/>,  bg:"bg-green-50 dark:bg-green-900/20",  sub:"Average reply: 1 minute", action: () => setChatOpen(true) },
              { label:"Email Us",   icon:<Mail size={22} className="text-blue-500"/>,            bg:"bg-blue-50 dark:bg-blue-900/20",    sub:"support@teslaxipo.com", action: () => window.location.href="mailto:support@teslaxipo.com" },
              { label:"Call Us",    icon:<Phone size={22} className="text-purple-500"/>,         bg:"bg-purple-50 dark:bg-purple-900/20",sub:"+1 (800) 000-0000", action: () => toast.success("Phone assistance is currently busy. Try Live Chat.") },
            ].map(c => (
              <div key={c.label} onClick={c.action} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center text-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center`}>{c.icon}</div>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">{c.label}</p>
                <p className="text-xs text-gray-400">{c.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Floating Live Chat Widget Popup */}
      {chatOpen && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 w-auto sm:w-full sm:max-w-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-350" style={{ height: 420 }}>
          
          {/* Chat Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-800 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <div>
                <p className="text-xs font-black">Teslaxipo Assistant</p>
                <p className="text-[9px] text-white/70">Online & Ready</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white">
              <XIcon size={16} />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900/50">
            {chatMessages.map((m, idx) => {
              const isBot = m.sender === "bot";
              return (
                <div key={idx} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    isBot 
                      ? "bg-white dark:bg-gray-800 text-gray-850 dark:text-gray-200 border border-gray-150 dark:border-gray-700 shadow-sm"
                      : "bg-primary-500 text-white shadow-md shadow-primary-500/10"
                  }`}>
                    <p>{m.text}</p>
                    <span className={`text-[8px] mt-1 block text-right ${isBot ? "text-gray-400" : "text-white/60"}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {chatTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-3 py-2.5 border border-gray-150 dark:border-gray-700 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-150 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white font-semibold"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <Send size={12} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}

function XIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );
}
