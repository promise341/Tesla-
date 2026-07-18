"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  CreditCard,
  Car,
  Building2,
  Shield,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  totalUsers: number;
  totalTransactions: number;
  totalBalance?: number;
  totalRevenue?: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKyc: 0,
    totalUsers: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [depositsRes, withdrawalsRes, kycRes, statsRes] = await Promise.all([
        fetch("/api/admin/deposits/approve"),
        fetch("/api/admin/withdrawals/approve"),
        fetch("/api/admin/kyc/pending"),
        fetch("/api/admin/stats"),
      ]);

      const deposits = depositsRes.ok ? await depositsRes.json() : { count: 0 };
      const withdrawals = withdrawalsRes.ok ? await withdrawalsRes.json() : { count: 0 };
      const kyc = kycRes.ok ? await kycRes.json() : { count: 0 };
      const platformStats = statsRes.ok ? await statsRes.json() : {};

      setStats({
        pendingDeposits: deposits.count ?? 0,
        pendingWithdrawals: withdrawals.count ?? 0,
        pendingKyc: kyc.count ?? 0,
        totalUsers: platformStats.totalUsers ?? 0,
        totalTransactions: platformStats.totalTransactions ?? 0,
        totalBalance: platformStats.totalBalance ?? 0,
        totalRevenue: platformStats.totalRevenue ?? 0,
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const urgentCards = [
    {
      label: "Pending Deposits",
      value: stats.pendingDeposits,
      icon: DollarSign,
      href: "/admin/payment-proofs",
      gradient: "from-blue-700 to-blue-900",
      border: "border-blue-800/40",
      glow: "shadow-blue-900/30",
      urgency: stats.pendingDeposits > 0,
    },
    {
      label: "Pending Withdrawals",
      value: stats.pendingWithdrawals,
      icon: Clock,
      href: "/admin/withdrawals",
      gradient: "from-yellow-700 to-yellow-900",
      border: "border-yellow-800/40",
      glow: "shadow-yellow-900/30",
      urgency: stats.pendingWithdrawals > 0,
    },
    {
      label: "Pending KYC",
      value: stats.pendingKyc,
      icon: Shield,
      href: "/admin/kyc",
      gradient: "from-orange-700 to-orange-900",
      border: "border-orange-800/40",
      glow: "shadow-orange-900/30",
      urgency: stats.pendingKyc > 0,
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      gradient: "from-red-700 to-red-900",
      border: "border-red-800/40",
      glow: "shadow-red-900/30",
      urgency: false,
    },
  ];

  const quickLinks = [
    { label: "Payment Proofs", href: "/admin/payment-proofs", icon: CheckCircle2, desc: "Approve crypto deposits" },
    { label: "Withdrawals", href: "/admin/withdrawals", icon: TrendingUp, desc: "Review withdrawal requests" },
    { label: "KYC Verification", href: "/admin/kyc", icon: Shield, desc: "Verify user documents" },
    { label: "Credit/Debit User", href: "/admin/credit-user", icon: DollarSign, desc: "Add/deduct user balance" },
    { label: "Investment Plans", href: "/admin/investment-payments", icon: Activity, desc: "Review plan payments" },
    { label: "VIP Purchases", href: "/admin/vip-purchases", icon: CreditCard, desc: "Approve VIP memberships" },
    { label: "Car Orders", href: "/admin/car-orders", icon: Car, desc: "Manage Tesla orders" },
    { label: "Real Estate", href: "/admin/real-estate-requests", icon: Building2, desc: "Property requests" },
    { label: "User Management", href: "/admin/users", icon: Users, desc: "Manage all users" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-12 h-12">
            <div className="absolute inset-0 border-2 border-red-900/40 rounded-full animate-ping" />
            <div className="absolute inset-1 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalPending = stats.pendingDeposits + stats.pendingWithdrawals + stats.pendingKyc;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10
            text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Urgent Alert Banner */}
      {totalPending > 0 && (
        <div className="px-5 py-4 rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center gap-3"
          style={{ boxShadow: "0 0 30px rgba(220,38,38,0.08)" }}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          <p className="text-sm text-red-300 font-medium">
            <span className="text-red-400 font-bold">{totalPending}</span> item{totalPending !== 1 ? "s" : ""} require your attention across all queues.
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {urgentCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <div className={`
                relative group overflow-hidden rounded-2xl bg-[#111] border ${card.border}
                p-5 cursor-pointer transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl ${card.glow}
                ${card.urgency ? "ring-1 ring-red-700/30" : ""}
              `}>
                {/* Subtle gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`} />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
                    <p className="text-4xl font-bold text-white mt-2 tracking-tight">{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                </div>

                <div className="relative flex items-center gap-1 mt-4 text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
                  <span>View details</span>
                  <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Urgency pulse indicator */}
                {card.urgency && (
                  <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Activity size={16} className="text-red-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="group flex items-center gap-3 p-4 rounded-xl bg-[#111] border border-white/8
                  hover:border-red-900/50 hover:bg-red-950/20 transition-all duration-200 cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-900/30 flex items-center justify-center flex-shrink-0
                    group-hover:bg-red-900/40 transition-colors">
                    <Icon size={16} className="text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">{link.label}</p>
                    <p className="text-xs text-gray-600 truncate">{link.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-700 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all ml-auto flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <div className="px-5 py-4 rounded-2xl bg-[#111] border border-red-900/20 flex items-start gap-3">
        <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="text-gray-500 font-medium">Security Notice:</span> All admin actions are logged for full audit compliance. Review all pending transactions carefully before approval or rejection.
        </p>
      </div>
    </div>
  );
}
